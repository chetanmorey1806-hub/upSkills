export default {
  id: 'day-04-computed-watchers',
  title: 'Computed Properties and Watchers (watch, watchEffect)',
  module: 'Module 1: Vue Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Derive values from state with cached computed properties, and run side effects when state changes with watch and watchEffect. Learn writable computeds, deep and immediate watchers, cleanup, and how to choose between computed, watch and watchEffect.',
  objectives: [
    'Create computed properties and explain computed caching vs methods',
    'Write a writable computed with get and set',
    'React to changes with watch(source, callback) including deep, immediate and once options',
    'Use watchEffect for automatic dependency tracking and onWatcherCleanup for cancelling work',
    'Decide when to use computed, watch or watchEffect',
  ],
  theory: [
    {
      heading: 'computed(): derived state with caching',
      content:
        'A **computed property** is a value calculated from other reactive state. You pass a getter function to `computed()` and get back a **read-only ref**.\n\n- It is **cached**: Vue remembers the result and only recalculates when one of its reactive dependencies changes.\n- It is **lazy**: it is only calculated when someone reads it.\n- In JavaScript read it with `.value`; in templates it is unwrapped like any ref.\n\nAnalogy: a computed is like the "Total" cell of a bill. The waiter does not re-add every item each time you glance at the bill; the total only changes when an item is added or removed.\n\nUse computed whenever you would otherwise write a long expression in the template: filtered lists, totals, full names, formatted values, validation flags (`isFormValid`).',
      syntax: `import { ref, computed } from 'vue'

const items = ref([{ name: 'Pen', price: 10, qty: 3 }])
const total = computed(() =>
  items.value.reduce((sum, i) => sum + i.price * i.qty, 0)
)
console.log(total.value) // 30`,
      tip: 'Getters must be pure: no API calls, no DOM changes, no changing other state inside computed. Side effects belong in watchers.',
    },
    {
      heading: 'Computed vs methods, and writable computed',
      content:
        'You could call a function in the template, `{{ getTotal() }}`, and get the same output. The difference:\n\n- A **method** runs **every time** the component re-renders, even if its inputs did not change.\n- A **computed** returns the cached value until a dependency changes.\n\nFor expensive work (filtering 10,000 rows) computed is much faster. Methods are still right for event handlers and when you need arguments.\n\n**Writable computed**: occasionally you want to assign to a computed. Provide an object with `get` and `set`. The setter should update the underlying source state.',
      syntax: `const firstName = ref('Asha')
const lastName = ref('Patil')

const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ')
  }
})

fullName.value = 'Ravi Kumar' // setter updates both refs`,
      points: [
        'A computed that depends on Date.now() will never update: Date.now() is not reactive',
        'Vue 3.4+: a computed only triggers its dependents when its value actually changes; the getter also receives the previous value as its first argument',
      ],
    },
    {
      heading: 'watch(): run side effects when specific data changes',
      content:
        'Watchers run a **callback** in reaction to a change. Use them for **side effects**: calling an API when a search term changes, saving to localStorage, logging, changing the document title.\n\n`watch(source, (newValue, oldValue) => { ... }, options)`\n\nThe **source** can be:\n\n1. a ref or computed: `watch(count, ...)`\n2. a reactive object (automatically deep): `watch(state, ...)`\n3. a **getter** function for a property: `watch(() => state.count, ...)` (you cannot pass `state.count` directly, that is just a number)\n4. an array of sources: `watch([a, b], ([newA, newB]) => ...)`\n\nOptions:\n\n- `immediate: true`: run the callback once right away\n- `deep: true`: also fire on nested mutations when watching a ref/getter of an object (Vue 3.5: `deep: 2` limits depth)\n- `once: true`: fire only once (3.4+)\n- `flush: "post"`: run after the DOM has updated',
      syntax: `watch(query, async (newQ, oldQ) => {
  console.log('changed from', oldQ, 'to', newQ)
  results.value = await search(newQ)
})

watch(() => user.address.city, city => { ... })
watch(settings, s => localStorage.setItem('s', JSON.stringify(s)), { deep: true })`,
    },
    {
      heading: 'watchEffect(): automatic dependency tracking',
      content:
        '`watchEffect(fn)` runs the function **immediately** and automatically tracks every reactive value it reads. Whenever any of them changes, it runs again. You do not list the sources and you do not get old values.\n\n- **watch**: explicit source, lazy by default, gives old and new values, precise.\n- **watchEffect**: implicit sources (whatever you read), eager, concise when the effect uses many values.\n\nNote: only values read **synchronously** are tracked. Anything read after the first `await` is not a dependency.\n\n**Stopping and cleanup**: both return a stop function (`const stop = watch(...); stop()`). Watchers created synchronously in setup are stopped automatically when the component unmounts. For cancelling stale async work (e.g. an old fetch), Vue 3.5 provides `onWatcherCleanup(fn)`; earlier versions pass an `onCleanup` function as the third callback argument.',
      syntax: `import { watchEffect, onWatcherCleanup } from 'vue'

watchEffect(() => {
  document.title = cart.value.length + ' items | Shop'
})

watch(id, (newId) => {
  const controller = new AbortController()
  fetch('/api/user/' + newId, { signal: controller.signal })
  onWatcherCleanup(() => controller.abort()) // cancel if id changes again
})`,
    },
    {
      heading: 'Choosing: computed vs watch vs watchEffect',
      content:
        '- Need a **value** to display or use? → **computed**.\n- Need to **do something** (API call, storage, navigation, timer) when a specific thing changes, maybe with old value? → **watch**.\n- Need to do something that depends on several values and should run immediately? → **watchEffect**.\n\nA classic anti-pattern is using a watcher to keep another ref in sync:\n\n`watch(firstName, v => fullName.value = v + " " + lastName.value)` (and another for lastName). This is longer and buggy; `const fullName = computed(() => ...)` is the correct tool.',
      tip: 'Interview phrase: "computed for derived state, watchers for side effects".',
    },
  ],
  examples: [
    {
      title: 'Shopping cart totals with computed',
      scenario: 'An e-commerce cart must show subtotal, GST (18%), a discount when subtotal exceeds ₹1000, and the grand total, all updating as quantities change.',
      steps: [
        'Store cart items in a ref array',
        'Create computed subtotal using reduce',
        'Create computed gst, discount and grandTotal that depend on subtotal',
        'Bind quantity inputs with v-model.number',
        'Change quantities and watch every value update; check the console to see caching',
      ],
      code: `<script setup>
import { ref, computed } from 'vue'

const cart = ref([
  { id: 1, name: 'Keyboard', price: 799, qty: 1 },
  { id: 2, name: 'Mouse', price: 349, qty: 1 },
])

const subtotal = computed(() => {
  console.log('subtotal recalculated')
  return cart.value.reduce((s, i) => s + i.price * i.qty, 0)
})
const gst = computed(() => subtotal.value * 0.18)
const discount = computed(() => (subtotal.value > 1000 ? 100 : 0))
const grandTotal = computed(() => subtotal.value + gst.value - discount.value)
</script>

<template>
  <div v-for="item in cart" :key="item.id">
    {{ item.name }} ₹{{ item.price }} × <input type="number" min="0" v-model.number="item.qty">
  </div>
  <p>Subtotal: ₹{{ subtotal }}</p>
  <p>GST 18%: ₹{{ gst.toFixed(2) }}</p>
  <p v-if="discount">Discount: -₹{{ discount }}</p>
  <h3>Total: ₹{{ grandTotal.toFixed(2) }}</h3>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="row" v-for="item in cart" :key="item.id">
    <span>{{ item.name }} ₹{{ item.price }}</span>
    <input type="number" min="0" v-model.number="item.qty">
  </div>
  <p>Subtotal: ₹{{ subtotal }}</p>
  <p>GST 18%: ₹{{ gst.toFixed(2) }}</p>
  <p v-if="discount" class="disc">Discount: -₹{{ discount }}</p>
  <h3>Total: ₹{{ grandTotal.toFixed(2) }}</h3>
  <button @click="note = note + '!'">Unrelated re-render {{ note }}</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
.row input { width: 60px; }
.disc { color: #16a34a; }`,
        js: `const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const cart = ref([
      { id: 1, name: 'Keyboard', price: 799, qty: 1 },
      { id: 2, name: 'Mouse', price: 349, qty: 1 },
    ]);
    const note = ref('');
    const subtotal = computed(() => {
      console.log('subtotal recalculated');
      return cart.value.reduce((s, i) => s + i.price * i.qty, 0);
    });
    const gst = computed(() => subtotal.value * 0.18);
    const discount = computed(() => (subtotal.value > 1000 ? 100 : 0));
    const grandTotal = computed(() => subtotal.value + gst.value - discount.value);
    return { cart, note, subtotal, gst, discount, grandTotal };
  }
}).mount('#app');`,
      },
      result: 'Subtotal ₹1148, GST ₹206.64, Discount -₹100, Total ₹1254.64. Changing a quantity recalculates everything. Clicking "Unrelated re-render" re-renders the component but the console does NOT log "subtotal recalculated" again.',
      explanation:
        'Computed values depend on each other in a chain: grandTotal → gst/discount → subtotal → cart. Vue tracks these dependencies and recomputes only when cart changes. The unrelated button proves caching: the template re-renders, but subtotal returns its cached value.',
    },
    {
      title: 'Writable computed: full name editor',
      scenario: 'A profile form shows separate first/last name fields and a single "full name" field; editing either side keeps both in sync.',
      steps: [
        'Create firstName and lastName refs',
        'Create fullName = computed({ get, set })',
        'Bind three inputs: first, last and full name (v-model works with writable computed)',
        'Type in the full-name box; the setter splits it into first and last',
      ],
      code: `<script setup>
import { ref, computed } from 'vue'

const firstName = ref('Asha')
const lastName = ref('Patil')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    const parts = newValue.trim().split(' ')
    firstName.value = parts[0] || ''
    lastName.value = parts.slice(1).join(' ')
  }
})
</script>

<template>
  <input v-model="firstName"> <input v-model="lastName">
  <input v-model="fullName">
  <p>Hello, {{ fullName }}</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p><label>First <input v-model="firstName"></label></p>
  <p><label>Last <input v-model="lastName"></label></p>
  <p><label>Full name (writable computed) <input v-model="fullName"></label></p>
  <h3>Hello, {{ fullName }}</h3>
  <button @click="fullName = 'Ravi Kumar Sharma'">Set full name in code</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
label { display: inline-flex; gap: 8px; }`,
        js: `const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const firstName = ref('Asha');
    const lastName = ref('Patil');
    const fullName = computed({
      get() { return firstName.value + ' ' + lastName.value; },
      set(newValue) {
        const parts = newValue.trim().split(' ');
        firstName.value = parts[0] || '';
        lastName.value = parts.slice(1).join(' ');
      }
    });
    return { firstName, lastName, fullName };
  }
}).mount('#app');`,
      },
      result: 'Typing in First/Last updates the full name; typing "Neha Joshi" in the full-name box splits it into First = Neha, Last = Joshi. The button sets First = Ravi, Last = Kumar Sharma.',
      explanation:
        'Assigning fullName.value calls set(), which updates the source refs; get() then recomputes from them. The computed itself never stores data; the refs are the single source of truth.',
    },
    {
      title: 'watch: search with debounce, old/new values and cleanup',
      scenario: 'Filter a list of cities as the user types, but only after they stop typing for 400 ms, and log old and new values.',
      steps: [
        'Create query ref bound to an input and a results ref',
        'watch(query, (newQ, oldQ) => ...) and log both values',
        'Inside the watcher start a 400 ms timer that filters the data',
        'Register onWatcherCleanup to clear the previous timer when query changes again',
        'Type quickly and see only one search per pause in the console',
      ],
      code: `<script setup>
import { ref, watch, onWatcherCleanup } from 'vue'

const cities = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Delhi', 'Bengaluru', 'Chennai']
const query = ref('')
const results = ref(cities)
const searching = ref(false)

watch(query, (newQ, oldQ) => {
  console.log('query:', oldQ, '→', newQ)
  searching.value = true
  const timer = setTimeout(() => {
    results.value = cities.filter(c => c.toLowerCase().includes(newQ.toLowerCase()))
    searching.value = false
    console.log('searched for', newQ)
  }, 400)
  onWatcherCleanup(() => clearTimeout(timer)) // Vue 3.5+
})
</script>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <input v-model="query" placeholder="Search city...">
  <span v-if="searching"> ⏳ waiting...</span>
  <ul><li v-for="c in results" :key="c">{{ c }}</li></ul>
  <p v-if="!results.length">No match</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input { padding: 6px; width: 200px; }`,
        js: `const { createApp, ref, watch, onWatcherCleanup } = Vue;

createApp({
  setup() {
    const cities = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Delhi', 'Bengaluru', 'Chennai'];
    const query = ref('');
    const results = ref(cities);
    const searching = ref(false);

    watch(query, (newQ, oldQ) => {
      console.log('query:', JSON.stringify(oldQ), '->', JSON.stringify(newQ));
      searching.value = true;
      const timer = setTimeout(() => {
        results.value = cities.filter(c => c.toLowerCase().includes(newQ.toLowerCase()));
        searching.value = false;
        console.log('searched for', newQ);
      }, 400);
      onWatcherCleanup(() => clearTimeout(timer));
    });
    return { query, results, searching };
  }
}).mount('#app');`,
      },
      result: 'Typing "na" quickly logs two "query:" lines but only one "searched for na" after you pause; the list shows Nagpur, Nashik and Chennai.',
      explanation:
        'The watcher fires on every change with new and old values. Before the callback runs again, Vue calls the registered cleanup, which clears the pending timer, so only the last keystroke actually searches (a debounce). For pure filtering, computed would be enough; the watcher is justified here because the work is asynchronous (like an API call).',
    },
    {
      title: 'watchEffect and deep watch: auto-saving settings',
      scenario: 'A settings panel saves to localStorage whenever anything changes, and updates the document title automatically.',
      steps: [
        'Create settings = ref({ theme, fontSize, notifications }) loaded from localStorage',
        'Use watch(settings, save, { deep: true }) so nested changes are detected',
        'Use watchEffect to set a status text from theme and fontSize (auto-tracked)',
        'Change the controls and reload the playground: values persist',
      ],
      code: `<script setup>
import { ref, watch, watchEffect } from 'vue'

const saved = JSON.parse(localStorage.getItem('settings') || 'null')
const settings = ref(saved || { theme: 'light', fontSize: 16, notifications: true })
const status = ref('')

watch(settings, (val) => {
  localStorage.setItem('settings', JSON.stringify(val))
  console.log('saved', val)
}, { deep: true })

watchEffect(() => {
  // reads theme and fontSize → both tracked automatically
  status.value = 'Theme ' + settings.value.theme + ', ' + settings.value.fontSize + 'px'
  document.title = status.value
})
</script>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div :class="['panel', settings.theme]" :style="{ fontSize: settings.fontSize + 'px' }">
    <p><label>Theme
      <select v-model="settings.theme"><option>light</option><option>dark</option></select></label></p>
    <p><label>Font size <input type="range" min="12" max="24" v-model.number="settings.fontSize"></label></p>
    <p><label><input type="checkbox" v-model="settings.notifications"> Notifications</label></p>
    <p><em>{{ status }}</em></p>
    <p>Saves so far: {{ saves }}</p>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.panel { padding: 16px; border-radius: 10px; border: 1px solid #ccc; }
.panel.dark { background: #1f2937; color: #f9fafb; }`,
        js: `const { createApp, ref, watch, watchEffect } = Vue;

createApp({
  setup() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('vue-day4-settings') || 'null'); } catch (e) {}
    const settings = ref(saved || { theme: 'light', fontSize: 16, notifications: true });
    const status = ref('');
    const saves = ref(0);

    watch(settings, (val) => {
      try { localStorage.setItem('vue-day4-settings', JSON.stringify(val)); } catch (e) {}
      saves.value++;
      console.log('saved', JSON.stringify(val));
    }, { deep: true });

    watchEffect(() => {
      status.value = 'Theme ' + settings.value.theme + ', ' + settings.value.fontSize + 'px';
      document.title = status.value;
    });
    return { settings, status, saves };
  }
}).mount('#app');`,
      },
      result: 'Changing theme, font size or the checkbox increments "Saves so far" and logs the saved JSON; the status text updates immediately (watchEffect ran once at start too). Settings survive a re-run of the playground.',
      explanation:
        'watch on a ref holding an object only fires when .value is replaced unless deep: true, which also tracks nested properties like settings.value.theme. watchEffect runs immediately and tracks exactly the properties it reads. Toggling notifications does not re-run the watchEffect because it does not read notifications.',
    },
  ],
  interview: [
    {
      q: 'What is a computed property and how is it different from a method?',
      a: 'A computed is a cached, lazily-evaluated ref derived from reactive state; it recalculates only when its reactive dependencies change. A method called in a template runs on every re-render. Use computed for derived data, methods for event handlers or when arguments are needed.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between computed and watch?',
      a: 'computed produces a value (derived state) and must be side-effect free. watch performs side effects (API calls, storage, logging) in response to changes and does not return a value used in the template. Rule: computed for derived state, watchers for side effects.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between watch and watchEffect?',
      a: 'watch needs explicit sources, is lazy by default (immediate option to run first), and provides new and old values. watchEffect runs immediately, tracks dependencies automatically from what it reads synchronously, and does not provide old values. watch is more precise; watchEffect is more concise for effects depending on many values.',
      level: 'Medium',
    },
    {
      q: 'How do you watch a single property of a reactive object?',
      a: 'Use a getter: watch(() => state.count, cb). Passing state.count directly passes a number, which is not a valid reactive source. For a nested object property you may add deep: true.',
      level: 'Medium',
    },
    {
      q: 'When do you need deep: true?',
      a: 'When watching a ref or getter that returns an object and you want the callback to fire on nested mutations (e.g. settings.value.theme = "dark"). Watching a reactive() object directly is implicitly deep. Deep watching traverses all nested properties, so it can be expensive on large structures; Vue 3.5 allows a number for max depth.',
      level: 'Medium',
    },
    {
      q: 'Can you have a computed with a setter?',
      a: 'Yes, a writable computed: computed({ get() {...}, set(v) {...} }). The setter should update the underlying source state; the getter then derives the new value. It is useful for v-model on derived values.',
      level: 'Medium',
    },
    {
      q: 'Why should computed getters not have side effects?',
      a: 'Because they may run lazily, be cached, or run at unexpected times; side effects (API calls, mutating other state) would be unpredictable and can cause infinite loops. Use watchers for side effects.',
      level: 'Medium',
    },
    {
      q: 'How do you cancel an outdated async request in a watcher?',
      a: 'Register a cleanup: in Vue 3.5 call onWatcherCleanup(() => controller.abort()) inside the watcher; in earlier versions use the onCleanup third argument of the callback. The cleanup runs before the next invocation and when the watcher stops.',
      level: 'Hard',
    },
    {
      q: 'How do you stop a watcher?',
      a: 'watch and watchEffect return a stop handle: const stop = watch(...); stop(). Watchers created synchronously in setup are automatically stopped on unmount; watchers created asynchronously (after await or in a setTimeout) must be stopped manually to avoid leaks. Vue 3.5 also offers pause() and resume() on the handle.',
      level: 'Hard',
    },
    {
      q: 'What does flush: "post" do?',
      a: 'By default watcher callbacks run before the component DOM updates (flush: "pre"). flush: "post" (or watchPostEffect) runs them after the DOM has been updated, so you can access the updated DOM. flush: "sync" runs synchronously on every change (use rarely).',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Given a list of students with marks, show a computed list of only passed students (>= 35), the class average, and the topper name.',
      hint: 'Three computeds using filter, reduce and a sort copy (or reduce).',
      solution: `<script setup>
import { ref, computed } from 'vue'
const students = ref([
  { name: 'Asha', marks: 88 }, { name: 'Ravi', marks: 32 },
  { name: 'Neha', marks: 67 }, { name: 'Omkar', marks: 91 },
])
const passed = computed(() => students.value.filter(s => s.marks >= 35))
const average = computed(() =>
  (students.value.reduce((s, x) => s + x.marks, 0) / students.value.length).toFixed(1))
const topper = computed(() =>
  students.value.reduce((best, s) => (s.marks > best.marks ? s : best)).name)
</script>
<template>
  <p>Passed: {{ passed.map(s => s.name).join(', ') }}</p>
  <p>Average: {{ average }}</p>
  <p>Topper: {{ topper }}</p>
</template>`,
    },
    {
      task: 'Create a password field and a computed "strength" (Weak / Medium / Strong) based on length and whether it contains a number and an uppercase letter.',
      hint: 'Use regex tests /\\d/ and /[A-Z]/ inside the computed.',
      solution: `<script setup>
import { ref, computed } from 'vue'
const password = ref('')
const strength = computed(() => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (/\\d/.test(p)) score++
  if (/[A-Z]/.test(p)) score++
  return ['Weak', 'Weak', 'Medium', 'Strong'][score]
})
</script>
<template>
  <input type="password" v-model="password">
  <p>Strength: {{ strength }}</p>
</template>`,
    },
    {
      task: 'Use watch to save a notes textarea to localStorage and restore it on load. Also show "Last saved at HH:MM:SS".',
      hint: 'Read localStorage in the ref initial value; in the watcher set lastSaved = new Date().toLocaleTimeString().',
      solution: `<script setup>
import { ref, watch } from 'vue'
const notes = ref(localStorage.getItem('notes') || '')
const lastSaved = ref('')
watch(notes, (val) => {
  localStorage.setItem('notes', val)
  lastSaved.value = new Date().toLocaleTimeString()
})
</script>
<template>
  <textarea v-model="notes" rows="5"></textarea>
  <p v-if="lastSaved">Last saved at {{ lastSaved }}</p>
</template>`,
    },
    {
      task: 'Fetch a user from https://jsonplaceholder.typicode.com/users/{id} whenever a userId ref changes (1-10), using watch with immediate: true and aborting the previous request.',
      hint: 'AbortController + onWatcherCleanup; catch AbortError.',
      solution: `<script setup>
import { ref, watch, onWatcherCleanup } from 'vue'
const userId = ref(1)
const user = ref(null)
const error = ref('')
watch(userId, async (id) => {
  const controller = new AbortController()
  onWatcherCleanup(() => controller.abort())
  try {
    error.value = ''
    const res = await fetch('https://jsonplaceholder.typicode.com/users/' + id, { signal: controller.signal })
    user.value = await res.json()
  } catch (e) {
    if (e.name !== 'AbortError') error.value = e.message
  }
}, { immediate: true })
</script>
<template>
  <input type="number" min="1" max="10" v-model.number="userId">
  <p v-if="error">{{ error }}</p>
  <p v-else-if="user">{{ user.name }} ({{ user.email }})</p>
</template>`,
    },
  ],
  quiz: [
    {
      question: 'What is the main benefit of computed over a method in the template?',
      options: ['It can take arguments', 'It is cached until dependencies change', 'It can be async', 'It runs before setup()'],
      answer: 1,
      explanation: 'Computed values are cached; methods rerun on every render.',
    },
    {
      question: 'Which watcher runs immediately and tracks dependencies automatically?',
      options: ['watch', 'computed', 'watchEffect', 'onMounted'],
      answer: 2,
      explanation: 'watchEffect runs right away and tracks whatever it reads.',
    },
    {
      question: 'How do you watch only state.count of a reactive object?',
      options: ['watch(state.count, cb)', 'watch("count", cb)', 'watchEffect(state.count)', 'watch(() => state.count, cb)'],
      answer: 3,
      explanation: 'Use a getter function as the source.',
    },
    {
      question: 'Where should an API call that runs when a filter changes go?',
      options: ['In a watcher', 'In a computed getter', 'In the template', 'In a CSS file'],
      answer: 0,
      explanation: 'API calls are side effects, which belong in watchers (or event handlers).',
    },
    {
      question: 'watch(settingsRef, cb) does not fire when settingsRef.value.theme changes. What fixes it?',
      options: ['{ immediate: true }', '{ deep: true }', '{ flush: "sync" }', '{ once: true }'],
      answer: 1,
      explanation: 'Watching a ref holding an object is shallow unless deep: true.',
    },
  ],
};
