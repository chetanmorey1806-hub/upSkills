export default {
  id: 'day-06-conditional-list-rendering-keys',
  title: 'Conditional and List Rendering, keys',
  module: 'Module 1: Vue Basics',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Go deeper into v-if/v-else-if/v-else, v-show and <template> grouping, then master v-for over arrays, objects and ranges, array mutation detection, filtering and sorting with computed, and why a stable :key is essential.',
  objectives: [
    'Build multi-branch conditions with v-if, v-else-if, v-else and <template>',
    'Choose correctly between v-if and v-show',
    'Render arrays, objects, ranges and nested lists with v-for',
    'Explain what :key does and why the index is a bad key for dynamic lists',
    'Display filtered and sorted lists using computed instead of v-if with v-for',
  ],
  theory: [
    {
      heading: 'Conditional rendering: v-if family and <template>',
      content:
        '`v-if="cond"` renders the block only when `cond` is truthy. `v-else-if` and `v-else` must immediately follow a `v-if`/`v-else-if` element; otherwise Vue will not recognise them.\n\nTo toggle **several elements** without an extra wrapper `<div>`, put the directive on a `<template>` element. `<template>` is an invisible wrapper: its children are rendered, the tag itself is not.\n\nv-if is **real** conditional rendering: when the condition becomes false, the element is destroyed, its child components are unmounted and their event listeners removed. When it becomes true again, everything is recreated from scratch (component state resets).\n\nAnalogy: v-if is like building and demolishing a tent each time; v-show is like keeping the tent up and just closing the flap.',
      syntax: `<template v-if="user">
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
</template>
<p v-else-if="loading">Loading...</p>
<p v-else>Please log in.</p>`,
    },
    {
      heading: 'v-show vs v-if (performance trade-off)',
      content:
        '- **v-if**: lazy. If the condition is false at first, nothing is rendered. Toggling costs more because elements and components are created/destroyed. Supports `v-else`, `<template>`.\n- **v-show**: always renders once and toggles `display: none`. Initial cost is higher, toggling is very cheap. No `v-else`, does not work on `<template>`.\n\nGuideline: use **v-show** for things that toggle very frequently (dropdown menus, tabs, accordions with heavy content) and **v-if** when the condition rarely changes or when you want child state reset / not rendered at all (e.g. admin-only sections).',
      tip: 'v-if on a component unmounts it and loses its internal state (e.g. text typed in a form). v-show keeps the state. Choose deliberately.',
    },
    {
      heading: 'v-for in depth',
      content:
        '- **Arrays**: `v-for="(item, index) in items"`. You may use `of` instead of `in`.\n- **Destructuring**: `v-for="({ id, name }, i) in users"`\n- **Objects**: `v-for="(value, key, index) in obj"` iterates in `Object.keys()` order.\n- **Ranges**: `v-for="n in 10"` gives 1 to 10 (starts at 1!).\n- **Nested loops**: inner loops can access outer variables.\n- **<template v-for>** renders a group of elements per item.\n- **Components**: `<user-card v-for="u in users" :key="u.id" :user="u">`; data must be passed via props, the loop variable is not injected automatically.\n\n**Array change detection**: Vue 3 detects all mutation methods (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`) and index assignment `arr[0] = x`. Non-mutating methods (`filter`, `map`, `concat`, `slice`) return a new array, so assign the result: `items.value = items.value.filter(...)`.',
      syntax: `<li v-for="(student, index) in students" :key="student.id">
  {{ index + 1 }}. {{ student.name }}
</li>

<p v-for="(value, key) in product" :key="key">{{ key }}: {{ value }}</p>
<span v-for="n in 5" :key="n">⭐</span>`,
      tip: 'sort() and reverse() mutate the original array. In a computed, copy first: [...items.value].sort(...) or items.value.toSorted(...).',
    },
    {
      heading: 'The key attribute: why it matters',
      content:
        'When a list changes, Vue must decide which old DOM element corresponds to which new item. By default it uses an **"in-place patch"** strategy: it reuses elements by **position** and just updates their content. That is fast but wrong whenever elements hold **their own state**: input text, checkbox state, focus, component state, CSS transitions.\n\nA `:key` gives each item a stable **identity**. Vue then moves, creates or removes elements based on the key, so each DOM element stays attached to the same data item.\n\n- Use a unique, stable id from the data: `:key="todo.id"`.\n- **Do not use the index** when items can be inserted, removed or reordered: the index of each item changes, so the "identity" moves to another item.\n- Keys must be primitives (string/number), not objects.\n- Always use `:key` with v-for on components (the official style guide makes it essential).\n- With `<template v-for>`, put the key on the `<template>` tag (Vue 3).\n\nAnalogy: students in a classroom. Without keys, the teacher identifies students by seat number; if someone new sits in seat 1, everyone\'s marks shift to the wrong person. With keys (roll numbers), marks follow the student wherever they sit.',
      points: [
        'key can also force re-creation: changing :key on a component destroys it and mounts a fresh one (useful to reset state)',
      ],
    },
    {
      heading: 'Filtering and sorting: computed + v-for (not v-if + v-for)',
      content:
        'Displaying a subset of a list is extremely common: completed todos, products under a price, search results.\n\n**Do not** write `<li v-for="t in todos" v-if="t.done">`. In Vue 3, v-if has higher priority than v-for on the same element, so `t` is undefined there; it also mixes logic into the template.\n\n**Do** create a computed property and loop over it. It is cached, readable and testable. If you need the condition per item for display (not filtering), put v-if on an inner element or use `<template v-for>` with v-if inside.\n\nAlso handle the **empty state**: `<p v-if="!filtered.length">No results</p>`.',
      syntax: `const visibleTodos = computed(() =>
  todos.value.filter(t => filter.value === 'all' || (filter.value === 'done') === t.done)
)

<li v-for="t in visibleTodos" :key="t.id">{{ t.text }}</li>
<p v-if="!visibleTodos.length">Nothing here</p>`,
    },
  ],
  examples: [
    {
      title: 'Order status with v-if / v-else-if / v-else and <template>',
      scenario: 'A delivery app shows a different block of UI for each order status.',
      steps: [
        'Create a status ref with values placed, shipped, delivered or cancelled',
        'Use <template v-if> to group several elements for a status',
        'Chain v-else-if blocks for other statuses and a final v-else',
        'Add buttons to switch status and see the matching block',
      ],
      code: `<script setup>
import { ref } from 'vue'
const status = ref('placed')
const statuses = ['placed', 'shipped', 'delivered', 'cancelled', 'unknown']
</script>

<template>
  <button v-for="s in statuses" :key="s" @click="status = s">{{ s }}</button>

  <template v-if="status === 'placed'">
    <h3>📝 Order placed</h3>
    <p>We are preparing your items.</p>
  </template>
  <template v-else-if="status === 'shipped'">
    <h3>🚚 Shipped</h3>
    <p>Expected in 2 days.</p>
  </template>
  <h3 v-else-if="status === 'delivered'">✅ Delivered</h3>
  <h3 v-else-if="status === 'cancelled'">❌ Cancelled</h3>
  <p v-else>Unknown status</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <button v-for="s in statuses" :key="s" @click="status = s" :class="{ on: s === status }">{{ s }}</button>

  <template v-if="status === 'placed'">
    <h3>📝 Order placed</h3>
    <p>We are preparing your items.</p>
  </template>
  <template v-else-if="status === 'shipped'">
    <h3>🚚 Shipped</h3>
    <p>Expected in 2 days.</p>
  </template>
  <h3 v-else-if="status === 'delivered'">✅ Delivered</h3>
  <h3 v-else-if="status === 'cancelled'">❌ Cancelled</h3>
  <p v-else>Unknown status</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { margin: 2px; padding: 6px 10px; }
button.on { background: #42b883; color: white; border: 0; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const status = ref('placed');
    const statuses = ['placed', 'shipped', 'delivered', 'cancelled', 'unknown'];
    return { status, statuses };
  }
}).mount('#app');`,
      },
      result: 'Initially "📝 Order placed" with a paragraph. Each button switches to the matching block; "unknown" shows "Unknown status".',
      explanation:
        'Only one branch of the chain is rendered at a time. The <template> tags group a heading and a paragraph without adding any wrapper element to the DOM.',
    },
    {
      title: 'Why keys matter: index key vs id key',
      scenario: 'Two identical lists with text inputs. Prepend an item and see the typed text jump to the wrong row when the index is used as the key.',
      steps: [
        'Create people = ref([{ id, name }]) and render it twice',
        'List A uses :key="index", list B uses :key="p.id"',
        'Each row has an uncontrolled <input> (no v-model) to hold DOM state',
        'Type a note next to "Asha" in both lists',
        'Click "Add at top" and compare where your text went',
      ],
      code: `<script setup>
import { ref } from 'vue'
let nextId = 4
const people = ref([
  { id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }, { id: 3, name: 'Neha' },
])
function addTop() {
  people.value.unshift({ id: nextId, name: 'New #' + nextId })
  nextId++
}
</script>

<template>
  <button @click="addTop">Add at top</button>
  <h4>❌ :key="index"</h4>
  <div v-for="(p, index) in people" :key="index">{{ p.name }} <input placeholder="note"></div>
  <h4>✅ :key="p.id"</h4>
  <div v-for="p in people" :key="p.id">{{ p.name }} <input placeholder="note"></div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>Type a note next to <b>Asha</b> in both lists, then click the button.</p>
  <button @click="addTop">Add at top</button>
  <div class="cols">
    <div>
      <h4>❌ :key="index"</h4>
      <div class="row" v-for="(p, index) in people" :key="index">{{ p.name }} <input placeholder="note"></div>
    </div>
    <div>
      <h4>✅ :key="p.id"</h4>
      <div class="row" v-for="p in people" :key="p.id">{{ p.name }} <input placeholder="note"></div>
    </div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.cols { display: flex; gap: 24px; flex-wrap: wrap; }
.row { margin: 4px 0; display: flex; justify-content: space-between; gap: 8px; width: 220px; }
input { width: 110px; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    let nextId = 4;
    const people = ref([
      { id: 1, name: 'Asha' }, { id: 2, name: 'Ravi' }, { id: 3, name: 'Neha' },
    ]);
    function addTop() {
      people.value.unshift({ id: nextId, name: 'New #' + nextId });
      nextId++;
    }
    return { people, addTop };
  }
}).mount('#app');`,
      },
      result: 'In the index-key list, your note stays in the FIRST row, which is now "New #4", so it appears next to the wrong person. In the id-key list, the note moves down with Asha.',
      explanation:
        'With index keys, the first element keeps key 0 and Vue patches it in place by just changing the text from "Asha" to "New #4", while the input DOM (and its typed value) stays. With id keys, Vue sees a new key 4, creates a new row at the top and moves the existing elements, preserving their state.',
    },
    {
      title: 'Product catalogue: filter, sort, empty state and object iteration',
      scenario: 'An online shop lists products with a category filter, price sorting and a details panel that iterates over the product object.',
      steps: [
        'Store products, category and sortBy refs',
        'Create a computed visibleProducts that filters, then sorts a copy',
        'Render cards with v-for over the computed and :key="p.id"',
        'Show an empty-state message with v-if',
        'Use v-for="(value, key) in selected" to render a details table, and v-for="n in p.rating" for stars',
      ],
      code: `<script setup>
import { ref, computed } from 'vue'
const products = ref([
  { id: 1, name: 'Laptop', category: 'electronics', price: 54999, rating: 4 },
  { id: 2, name: 'Headphones', category: 'electronics', price: 1999, rating: 5 },
  { id: 3, name: 'T-shirt', category: 'fashion', price: 499, rating: 3 },
  { id: 4, name: 'Sneakers', category: 'fashion', price: 2999, rating: 4 },
])
const category = ref('all')
const sortBy = ref('none')
const selected = ref(null)

const visibleProducts = computed(() => {
  let list = products.value.filter(p => category.value === 'all' || p.category === category.value)
  if (sortBy.value === 'low') list = [...list].sort((a, b) => a.price - b.price)
  if (sortBy.value === 'high') list = [...list].sort((a, b) => b.price - a.price)
  return list
})
</script>

<template>
  <select v-model="category">...</select> <select v-model="sortBy">...</select>
  <div v-for="p in visibleProducts" :key="p.id" @click="selected = p">
    {{ p.name }} ₹{{ p.price }} <span v-for="n in p.rating" :key="n">⭐</span>
  </div>
  <p v-if="!visibleProducts.length">No products found</p>
  <table v-if="selected">
    <tr v-for="(value, key) in selected" :key="key"><th>{{ key }}</th><td>{{ value }}</td></tr>
  </table>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <select v-model="category">
    <option value="all">All</option><option value="electronics">Electronics</option>
    <option value="fashion">Fashion</option><option value="books">Books</option>
  </select>
  <select v-model="sortBy">
    <option value="none">No sort</option><option value="low">Price: low → high</option><option value="high">Price: high → low</option>
  </select>
  <div class="grid">
    <div class="card" v-for="p in visibleProducts" :key="p.id" @click="selected = p">
      <strong>{{ p.name }}</strong><br>₹{{ p.price.toLocaleString('en-IN') }}<br>
      <span v-for="n in p.rating" :key="n">⭐</span>
    </div>
  </div>
  <p v-if="!visibleProducts.length">No products found in "{{ category }}".</p>
  <table v-if="selected">
    <tr v-for="(value, key, i) in selected" :key="key"><td>{{ i + 1 }}</td><th>{{ key }}</th><td>{{ value }}</td></tr>
  </table>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin: 12px 0; }
.card { border: 1px solid #ddd; padding: 10px; border-radius: 8px; cursor: pointer; }
.card:hover { border-color: #42b883; }
th, td { text-align: left; padding: 2px 10px; border-bottom: 1px solid #eee; }`,
        js: `const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const products = ref([
      { id: 1, name: 'Laptop', category: 'electronics', price: 54999, rating: 4 },
      { id: 2, name: 'Headphones', category: 'electronics', price: 1999, rating: 5 },
      { id: 3, name: 'T-shirt', category: 'fashion', price: 499, rating: 3 },
      { id: 4, name: 'Sneakers', category: 'fashion', price: 2999, rating: 4 },
    ]);
    const category = ref('all');
    const sortBy = ref('none');
    const selected = ref(null);
    const visibleProducts = computed(() => {
      let list = products.value.filter(p => category.value === 'all' || p.category === category.value);
      if (sortBy.value === 'low') list = [...list].sort((a, b) => a.price - b.price);
      if (sortBy.value === 'high') list = [...list].sort((a, b) => b.price - a.price);
      return list;
    });
    return { products, category, sortBy, selected, visibleProducts };
  }
}).mount('#app');`,
      },
      result: 'Four product cards with star ratings. Filtering by Fashion shows two; Books shows "No products found in "books"". Sorting reorders the cards. Clicking a card shows a numbered table of its properties (id, name, category, price, rating).',
      explanation:
        'Filtering/sorting happen in a computed, so the template only loops. [...list].sort() sorts a copy to avoid mutating the source array inside a computed. v-for="n in p.rating" renders a range starting at 1, and v-for over an object gives (value, key, index).',
    },
    {
      title: 'v-if vs v-show: component state and render count',
      scenario: 'Compare how v-if and v-show treat a child component that has its own typed state.',
      steps: [
        'Register a NotePad component with an internal text ref and a "created" log',
        'Render one NotePad with v-if and one with v-show',
        'Type in both, then toggle both off and on',
        'Observe which keeps its text and check the console logs',
      ],
      code: `<script setup>
import { ref } from 'vue'
import NotePad from './NotePad.vue'
const showA = ref(true)
const showB = ref(true)
</script>

<template>
  <button @click="showA = !showA">Toggle v-if</button>
  <NotePad v-if="showA" label="v-if pad" />

  <button @click="showB = !showB">Toggle v-show</button>
  <NotePad v-show="showB" label="v-show pad" />
</template>

<!-- NotePad.vue -->
<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({ label: String })
const text = ref('')
onMounted(() => console.log(props.label, 'created'))
</script>
<template><textarea v-model="text" :placeholder="label"></textarea></template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p><button @click="showA = !showA">Toggle v-if ({{ showA }})</button></p>
  <note-pad v-if="showA" label="v-if pad"></note-pad>
  <p><button @click="showB = !showB">Toggle v-show ({{ showB }})</button></p>
  <note-pad v-show="showB" label="v-show pad"></note-pad>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
textarea { width: 260px; height: 50px; }`,
        js: `const { createApp, ref, onMounted, onUnmounted } = Vue;

const app = createApp({
  setup() {
    return { showA: ref(true), showB: ref(true) };
  }
});

app.component('NotePad', {
  props: { label: String },
  setup(props) {
    const text = ref('');
    onMounted(() => console.log(props.label, 'created'));
    onUnmounted(() => console.log(props.label, 'destroyed'));
    return { text };
  },
  template: '<textarea v-model="text" :placeholder="label"></textarea>'
});

app.mount('#app');`,
      },
      result: 'After typing and toggling twice, the v-if pad is empty again (console: "v-if pad destroyed" then "v-if pad created"), while the v-show pad keeps its text and logs nothing new.',
      explanation:
        'v-if unmounts the component (state lost) and mounts a new instance later. v-show only sets display: none on the component\'s root element, so the same instance and its state survive.',
    },
  ],
  interview: [
    {
      q: 'What is the purpose of the key attribute in v-for?',
      a: 'It gives each rendered node a stable identity so Vue\'s diff algorithm can match old and new nodes correctly: reusing, moving, creating or removing them per item instead of patching in place by position. This preserves element/component state and makes transitions work correctly.',
      level: 'Easy',
    },
    {
      q: 'Why is using the array index as key problematic?',
      a: 'When items are inserted, removed or reordered, the index of each item changes, so the key no longer identifies the same data. Vue then reuses the wrong DOM/component instances, causing bugs such as input values or component state appearing on the wrong row. Index keys are only acceptable for static lists that never change order and have no stateful children.',
      level: 'Medium',
    },
    {
      q: 'What is the precedence of v-if and v-for in Vue 3, and how does it differ from Vue 2?',
      a: 'In Vue 3, v-if has higher precedence than v-for when used on the same element, so the v-if cannot access the loop variable. In Vue 2 it was the reverse (v-for first). In both versions it is discouraged: use a computed filtered list or wrap with <template v-for>.',
      level: 'Medium',
    },
    {
      q: 'How do you render a group of elements conditionally without a wrapper?',
      a: 'Use v-if (or v-for) on a <template> element. The <template> acts as an invisible wrapper and is not rendered in the final DOM.',
      level: 'Easy',
    },
    {
      q: 'Which array methods trigger updates in Vue 3?',
      a: 'All of them, effectively: mutation methods (push, pop, shift, unshift, splice, sort, reverse) and index/length assignment are detected by the Proxy. Non-mutating methods (filter, map, slice, concat) return new arrays, so you must assign the result back to the ref to update the UI.',
      level: 'Medium',
    },
    {
      q: 'How does v-for over an object work?',
      a: 'v-for="(value, key, index) in obj" iterates the object\'s own enumerable properties in Object.keys() order, providing the value, the key and the position index.',
      level: 'Easy',
    },
    {
      q: 'What does v-for="n in 10" produce?',
      a: 'It repeats the element 10 times with n from 1 to 10 (the range starts at 1, not 0).',
      level: 'Easy',
    },
    {
      q: 'How can you force a component to re-render from scratch?',
      a: 'Change its :key. When the key changes, Vue treats it as a different node: it unmounts the old instance and mounts a new one, resetting all internal state. This is the recommended way to "reset" a component (e.g. a form) or retrigger a transition.',
      level: 'Hard',
    },
    {
      q: 'Why should you not sort the original array inside a computed?',
      a: 'sort() mutates the array in place, which is a side effect inside a computed: it changes the source state, can trigger extra updates or infinite loops, and surprises other consumers. Sort a copy ([...arr].sort() or arr.toSorted()).',
      level: 'Medium',
    },
    {
      q: 'When would you prefer v-show over v-if?',
      a: 'When the element toggles very often and its initial render cost is acceptable, e.g. dropdowns, tabs, modals that open frequently, or when you want child component state to persist across toggles.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Build a todo list with a filter (All / Active / Completed) using a computed, a checkbox per item, unique id keys and an empty-state message.',
      hint: 'Keep filter in a ref; compute visibleTodos.',
      solution: `<script setup>
import { ref, computed } from 'vue'
let id = 3
const todos = ref([{ id: 1, text: 'Read docs', done: true }, { id: 2, text: 'Write code', done: false }])
const filter = ref('all')
const newText = ref('')
const visible = computed(() => todos.value.filter(t =>
  filter.value === 'all' ? true : filter.value === 'done' ? t.done : !t.done))
function add() {
  if (newText.value.trim()) todos.value.push({ id: id++, text: newText.value.trim(), done: false })
  newText.value = ''
}
</script>
<template>
  <input v-model="newText" @keyup.enter="add">
  <button v-for="f in ['all', 'active', 'done']" :key="f" @click="filter = f">{{ f }}</button>
  <ul>
    <li v-for="t in visible" :key="t.id"><input type="checkbox" v-model="t.done"> {{ t.text }}</li>
  </ul>
  <p v-if="!visible.length">Nothing to show</p>
</template>`,
    },
    {
      task: 'Render a timetable from a nested array: days with periods. Show each day as a heading and periods as a list, using nested v-for and <template v-for>.',
      hint: 'v-for="day in timetable" then v-for="p in day.periods".',
      solution: `<div id="app">
  <template v-for="day in timetable" :key="day.name">
    <h4>{{ day.name }}</h4>
    <ol><li v-for="(p, i) in day.periods" :key="day.name + i">{{ p }}</li></ol>
  </template>
</div>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  const timetable = ref([
    { name: 'Monday', periods: ['Maths', 'Physics', 'Vue'] },
    { name: 'Tuesday', periods: ['Chemistry', 'English'] },
  ]);
  return { timetable };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Create a star rating widget with v-for="n in 5" that highlights stars up to the clicked one and shows a text label (Poor..Excellent).',
      hint: ':class="{ on: n <= rating }".',
      solution: `<div id="app">
  <span v-for="n in 5" :key="n" :class="{ on: n <= rating }" @click="rating = n" style="cursor:pointer;font-size:28px">★</span>
  <p>{{ ['Not rated', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating] }}</p>
</div>
<style>span { color: #ccc; } span.on { color: gold; }</style>
<script>
const { createApp, ref } = Vue;
createApp({ setup() { return { rating: ref(0) }; } }).mount('#app');
</script>`,
    },
    {
      task: 'Add a "Reset form" button that resets a form component by changing its :key instead of clearing each field manually.',
      hint: 'const formKey = ref(0); <FormComp :key="formKey" />; reset: formKey.value++.',
      solution: `<script setup>
import { ref } from 'vue'
import ContactForm from './ContactForm.vue'
const formKey = ref(0)
</script>
<template>
  <ContactForm :key="formKey" />
  <button @click="formKey++">Reset form</button>
</template>
<!-- Changing the key unmounts the old ContactForm and mounts a fresh one with initial state. -->`,
    },
  ],
  quiz: [
    {
      question: 'Which directive removes the element from the DOM when the condition is false?',
      options: ['v-show', 'v-if', 'v-cloak', 'v-once'],
      answer: 1,
      explanation: 'v-if destroys/creates; v-show only hides with CSS.',
    },
    {
      question: 'What is the best key for a list of users fetched from an API?',
      options: ['The array index', 'Math.random()', 'user.id', 'The user object itself'],
      answer: 2,
      explanation: 'A stable, unique primitive id from the data.',
    },
    {
      question: 'v-for="n in 3" renders n as:',
      options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', 'Error: number is not iterable'],
      answer: 1,
      explanation: 'Ranges start at 1.',
    },
    {
      question: 'How should you show only completed todos?',
      options: [
        'v-for and v-if="t.done" on the same <li>',
        'A watcher that deletes incomplete todos',
        'v-show on the <ul>',
        'Loop over a computed that filters todos',
      ],
      answer: 3,
      explanation: 'Use a computed filtered list.',
    },
    {
      question: 'Which of these does NOT work with v-show?',
      options: ['<template>', '<div>', '<p>', 'A component with a single root'],
      answer: 0,
      explanation: 'v-show needs a real element to set display on; <template> renders nothing.',
    },
  ],
};
