export default {
  id: 'day-08-components-and-props',
  title: 'Components and Props',
  module: 'Module 2: Components',
  day: 8,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Split the UI into reusable components. Learn global vs local registration, naming conventions, defineProps with types, defaults, required and custom validators, one-way data flow, reactive props destructuring (Vue 3.5) and attribute fallthrough.',
  objectives: [
    'Create components and register them globally (app.component) or locally (import in <script setup>)',
    'Declare props with defineProps using array, object and TypeScript-style syntax',
    'Use prop types, required, default values (factory functions for objects) and validators',
    'Explain one-way data flow and why a child must not mutate props',
    'Understand attribute fallthrough ($attrs) and inheritAttrs: false',
  ],
  theory: [
    {
      heading: 'What is a component?',
      content:
        'A **component** is a reusable, self-contained piece of UI with its own template, logic and styles: a button, a product card, a navbar, a whole page. Components are nested to form a **component tree**, with `App` at the root.\n\nAnalogy: LEGO bricks. Each brick (component) has a fixed shape, but you can configure it (props: colour, size) and combine many of them into a house (application).\n\nBenefits: **reuse** (write once, use everywhere), **separation of concerns** (each file does one thing), **easier testing**, and **teamwork** (different developers own different components).\n\nIn a Vite project each component is a `.vue` SFC. In our playground (no build step), we register components with `app.component(\'Name\', { props, setup, template })`, which is the same component definition written as a JavaScript object.',
    },
    {
      heading: 'Registering components: local vs global',
      content:
        '**Local registration** (recommended): import the component in the parent. With `<script setup>` imported components are usable in the template immediately.\n\n**Global registration**: `app.component(\'MyButton\', MyButton)` before `mount()`. The component is available in every template of the app. Convenient for very common base components, but globally registered components cannot be tree-shaken and make dependencies less explicit.\n\n**Naming**:\n\n- Use **PascalCase** for component names and file names: `ProductCard.vue`. Multi-word names avoid clashing with HTML elements (`Card` vs a future `<card>` element); the style guide requires multi-word names except for `App`.\n- In SFC templates use `<ProductCard />` (self-closing allowed).\n- In **in-DOM templates** (HTML written directly in the page, like our playground HTML panel) the browser parses first, so you must use **kebab-case** and explicit closing tags: `<product-card></product-card>`, and kebab-case prop names: `:product-name="..."`.',
      syntax: `<!-- ParentPage.vue (local registration) -->
<script setup>
import ProductCard from './ProductCard.vue'
</script>
<template>
  <ProductCard title="Laptop" :price="54999" />
</template>

// main.js (global registration)
import BaseButton from './components/BaseButton.vue'
const app = createApp(App)
app.component('BaseButton', BaseButton)
app.mount('#app')`,
    },
    {
      heading: 'Props: passing data from parent to child',
      content:
        '**Props** are custom attributes a parent passes to a child, like function arguments for components. The child declares the props it accepts with the `defineProps()` compiler macro (no import needed in `<script setup>`).\n\n- **Static** value (always a string): `<UserCard name="Asha" />`\n- **Dynamic** value with v-bind (any JS type): `<UserCard :age="21" :skills="[\'Vue\']" :active="true" />`\n- Boolean shorthand: `<UserCard active />` means `active: true` for a Boolean prop\n- Pass all properties of an object: `<UserCard v-bind="user" />`\n\nNaming: declare props in camelCase (`greetingMessage`) and pass them in kebab-case in templates (`greeting-message="hi"`) to follow HTML conventions; in SFC templates both work.\n\nIn the template, props are available directly (`{{ name }}`); in script use the object returned from `defineProps`, or **destructure it** (Vue 3.5+: destructured props stay reactive, and you can use JavaScript default values).',
      syntax: `<!-- UserCard.vue -->
<script setup>
const props = defineProps({
  name: { type: String, required: true },
  age: Number,
  skills: { type: Array, default: () => [] },
  active: Boolean,
})
console.log(props.name)
</script>

<!-- Vue 3.5 reactive props destructure -->
<script setup>
const { name, age = 18 } = defineProps({ name: String, age: Number })
</script>`,
    },
    {
      heading: 'Prop validation',
      content:
        'Using the object syntax you can describe each prop:\n\n- `type`: `String`, `Number`, `Boolean`, `Array`, `Object`, `Date`, `Function`, `Symbol`, a custom class, or an array of types `[String, Number]`\n- `required: true`: warns if missing\n- `default`: a value, or a **factory function** for objects/arrays (`default: () => ({ theme: "light" })`) so each instance gets its own copy\n- `validator(value, props)`: returns true/false for custom rules, e.g. `["sm", "md", "lg"].includes(value)`\n\nValidation failures produce **console warnings in development only**; they do not stop the app. With TypeScript you can use type-based declaration: `defineProps<{ title: string; count?: number }>()` (Day 22).\n\nBoolean casting: an absent Boolean prop is `false` (not undefined), and `<Comp disabled />` gives `true`.',
      syntax: `defineProps({
  status: {
    type: String,
    default: 'pending',
    validator: (v) => ['pending', 'paid', 'failed'].includes(v)
  },
  price: { type: Number, required: true },
  tags: { type: Array, default: () => [] },
  id: [String, Number]
})`,
      tip: 'Common mistake: default: [] for an Array prop. Use a factory: default: () => [].',
    },
    {
      heading: 'One-way data flow and attribute fallthrough',
      content:
        '**One-way data flow**: props flow **down** from parent to child. When the parent\'s data changes, the child receives the new value. The child must **never mutate a prop** (`props.count++` gives a warning; props are readonly). Why: if any child could change shared data, it would be very hard to know who changed what.\n\nIf the child needs to change the value:\n\n1. Use the prop as an **initial value** for local state: `const counter = ref(props.initialCount)`\n2. Derive a value with **computed**: `const normalized = computed(() => props.size.trim().toLowerCase())`\n3. Ask the parent to change it by **emitting an event** (Day 9).\n\n(Mutating nested properties of an object prop is technically possible but considered bad practice for the same reason.)\n\n**Fallthrough attributes**: attributes or listeners passed to a component that are **not declared as props or emits** (e.g. `class`, `style`, `id`, `data-*`, `@click`) are automatically added to the component\'s **root element**. `class` and `style` are merged. Access them via `$attrs` in templates or `useAttrs()` in script. Use `defineOptions({ inheritAttrs: false })` and `v-bind="$attrs"` to put them on a different element (e.g. the inner `<input>` of a wrapper).',
      syntax: `<!-- BaseInput.vue -->
<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ label: String })
</script>
<template>
  <label class="field">
    {{ label }}
    <input v-bind="$attrs">   <!-- placeholder, type, maxlength go here -->
  </label>
</template>`,
    },
  ],
  examples: [
    {
      title: 'Reusable ProductCard with typed props',
      scenario: 'An e-commerce listing renders many product cards from data, each configured with props.',
      steps: [
        'Create ProductCard with props title (required), price (Number), image, inStock (Boolean) and tags (Array with factory default)',
        'Use a computed to format the price in Indian rupees',
        'In the parent, loop over products and pass each field with v-bind',
        'Pass one card without tags to see the default, and one with in-stock false',
        'In the playground, register the component with app.component and use kebab-case tags/props',
      ],
      code: `<!-- ProductCard.vue -->
<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: { type: String, required: true },
  price: { type: Number, default: 0 },
  image: String,
  inStock: { type: Boolean, default: true },
  tags: { type: Array, default: () => [] },
})
const formatted = computed(() =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(props.price)
)
</script>

<template>
  <article class="card" :class="{ out: !inStock }">
    <img :src="image" :alt="title">
    <h3>{{ title }}</h3>
    <p>{{ formatted }}</p>
    <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
    <strong v-if="!inStock">Out of stock</strong>
  </article>
</template>

<!-- ProductList.vue -->
<script setup>
import ProductCard from './ProductCard.vue'
const products = [
  { id: 1, title: 'Headphones', price: 1999, image: '...', tags: ['audio', 'sale'] },
  { id: 2, title: 'Smart Watch', price: 4999, image: '...', inStock: false },
]
</script>
<template>
  <ProductCard v-for="p in products" :key="p.id" v-bind="p" />
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="grid">
    <product-card v-for="p in products" :key="p.id"
      :title="p.title" :price="p.price" :image="p.image"
      :in-stock="p.inStock" :tags="p.tags"></product-card>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.card { border: 1px solid #ddd; border-radius: 10px; padding: 10px; }
.card img { width: 100%; border-radius: 6px; }
.card.out { opacity: .55; }
.card h3 { margin: 6px 0; font-size: 16px; }
.tag { display: inline-block; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 4px; }`,
        js: `const { createApp, computed } = Vue;

const app = createApp({
  setup() {
    const products = [
      { id: 1, title: 'Headphones', price: 1999, image: 'https://picsum.photos/id/26/300/180', tags: ['audio', 'sale'] },
      { id: 2, title: 'Smart Watch', price: 4999, image: 'https://picsum.photos/id/175/300/180', inStock: false },
      { id: 3, title: 'Camera', price: 32999, image: 'https://picsum.photos/id/250/300/180', tags: ['new'] },
    ];
    return { products };
  }
});

app.component('ProductCard', {
  props: {
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: String,
    inStock: { type: Boolean, default: true },
    tags: { type: Array, default: () => [] },
  },
  setup(props) {
    const formatted = computed(() =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(props.price));
    return { formatted };
  },
  template: \`
    <article class="card" :class="{ out: !inStock }">
      <img :src="image" :alt="title">
      <h3>{{ title }}</h3>
      <p>{{ formatted }}</p>
      <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
      <strong v-if="!inStock">Out of stock</strong>
    </article>\`
});

app.mount('#app');`,
      },
      result: 'Three cards with images, rupee prices (₹1,999.00 etc.) and tags. The Smart Watch card is faded with "Out of stock" and shows no tags (default empty array). Camera is in stock because inStock is undefined and falls back to the default true.',
      explanation:
        'The parent owns the data and passes it down. Passing undefined for a prop uses its default. In the SFC version v-bind="p" spreads all object properties as props. In-DOM templates require kebab-case (:in-stock), which Vue maps to the camelCase prop inStock.',
    },
    {
      title: 'Prop validation warnings',
      scenario: 'A StatusBadge accepts only certain statuses and sizes; see what Vue reports when the parent passes bad values.',
      steps: [
        'Define props status (validator: pending/paid/failed) and size (validator: sm/md/lg)',
        'Map status to colors with a computed',
        'Render valid badges and one invalid badge (status="shipped") and a missing required prop',
        'Open the console to see the development warnings',
      ],
      code: `<!-- StatusBadge.vue -->
<script setup>
import { computed } from 'vue'
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['pending', 'paid', 'failed'].includes(v),
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
})
const color = computed(() => ({ pending: '#f59e0b', paid: '#16a34a', failed: '#dc2626' })[props.status] || '#6b7280')
</script>
<template>
  <span class="badge" :class="size" :style="{ background: color }">{{ status }}</span>
</template>

<!-- Parent -->
<StatusBadge status="paid" />
<StatusBadge status="pending" size="lg" />
<StatusBadge status="shipped" />   <!-- ⚠ validator fails -->`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>Valid:
    <status-badge status="paid"></status-badge>
    <status-badge status="pending" size="lg"></status-badge>
    <status-badge status="failed" size="sm"></status-badge>
  </p>
  <p>Invalid (check console): <status-badge :status="badStatus"></status-badge></p>
  <p>Warnings captured: {{ warnings.length }}</p>
  <ul><li v-for="(w, i) in warnings" :key="i"><small>{{ w }}</small></li></ul>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.badge { color: white; border-radius: 999px; padding: 3px 10px; margin-right: 6px; text-transform: uppercase; font-size: 12px; }
.badge.sm { font-size: 10px; padding: 2px 6px; }
.badge.lg { font-size: 15px; padding: 5px 14px; }`,
        js: `const { createApp, computed, ref } = Vue;

const warnings = ref([]);
const app = createApp({
  setup() {
    return { badStatus: 'shipped', warnings };
  }
});

// capture dev warnings so we can show them on the page too
app.config.warnHandler = (msg) => {
  console.warn('[Vue warn] ' + msg);
  warnings.value.push(msg);
};

app.component('StatusBadge', {
  props: {
    status: {
      type: String,
      required: true,
      validator: (v) => ['pending', 'paid', 'failed'].includes(v),
    },
    size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  },
  setup(props) {
    const color = computed(() => ({ pending: '#f59e0b', paid: '#16a34a', failed: '#dc2626' })[props.status] || '#6b7280');
    return { color };
  },
  template: '<span class="badge" :class="size" :style="{ background: color }">{{ status }}</span>'
});

app.mount('#app');`,
      },
      result: 'Green PAID, orange large PENDING and small red FAILED badges, plus a grey SHIPPED badge. The page and console show the warning: Invalid prop: custom validator check failed for prop "status".',
      explanation:
        'Prop validation runs only in development builds and only warns: the component still renders. The validator catches typos and wrong values early. app.config.warnHandler is used here just to display the warning in the page.',
    },
    {
      title: 'One-way data flow: initial value vs computed vs mutation',
      scenario: 'A quantity stepper receives a starting quantity from the parent. Show the correct ways to use a prop and what happens if you mutate it.',
      steps: [
        'Pass :initial-qty="parentQty" and a :unit-price prop to QtyStepper',
        'Inside, create local state const qty = ref(props.initialQty)',
        'Create a computed total from qty and props.unitPrice',
        'Add a "Mutate prop (wrong)" button that tries props.initialQty++',
        'Change parentQty from the parent and see that local qty does not reset (it was only the initial value)',
      ],
      code: `<!-- QtyStepper.vue -->
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ initialQty: { type: Number, default: 1 }, unitPrice: Number })

const qty = ref(props.initialQty)                  // ✅ local copy
const total = computed(() => qty.value * props.unitPrice) // ✅ derived

function wrong() {
  props.initialQty++ // ❌ [Vue warn] Attempting to mutate prop "initialQty". Props are readonly.
}
</script>

<template>
  <button @click="qty--" :disabled="qty <= 1">-</button> {{ qty }}
  <button @click="qty++">+</button>
  = ₹{{ total }}
  <button @click="wrong">Mutate prop (wrong)</button>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>Parent quantity: {{ parentQty }} <button @click="parentQty++">Parent +1</button>
     Unit price: <input type="number" v-model.number="price" style="width:70px"></p>
  <qty-stepper :initial-qty="parentQty" :unit-price="price"></qty-stepper>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.stepper { border: 1px solid #ccc; padding: 12px; border-radius: 8px; display: inline-flex; gap: 8px; align-items: center; }`,
        js: `const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    return { parentQty: ref(2), price: ref(150) };
  }
});

app.component('QtyStepper', {
  props: { initialQty: { type: Number, default: 1 }, unitPrice: Number },
  setup(props) {
    const qty = ref(props.initialQty);
    const total = computed(() => qty.value * props.unitPrice);
    function wrong() {
      props.initialQty++; // readonly: Vue warns and ignores
      console.log('initialQty is still', props.initialQty);
    }
    return { qty, total, wrong };
  },
  template: \`
    <div class="stepper">
      <button @click="qty--" :disabled="qty <= 1">-</button>
      <b>{{ qty }}</b>
      <button @click="qty++">+</button>
      <span>= ₹{{ total }}</span>
      <small>(prop initialQty = {{ initialQty }})</small>
      <button @click="wrong">Mutate prop (wrong)</button>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'The stepper starts at 2, total ₹300. +/- change only the local qty. Changing the unit price updates the total (computed reacts to the prop). "Parent +1" changes the displayed prop value but not the local qty. "Mutate prop (wrong)" logs a Vue warning and the prop does not change.',
      explanation:
        'ref(props.initialQty) reads the prop once, so it acts only as a starting value. computed reads props.unitPrice reactively. Props objects are shallow readonly proxies: writing to them warns in development. To change parent data, the child must emit an event (next lesson).',
    },
    {
      title: 'Fallthrough attributes and inheritAttrs: false',
      scenario: 'A BaseInput wrapper with a label should forward placeholder, type, maxlength and listeners to the inner <input>, not to the outer <label>.',
      steps: [
        'Create BaseInput with a label prop and inheritAttrs: false',
        'Bind v-bind="$attrs" on the inner <input>',
        'Use it with placeholder, type, maxlength and class attributes from the parent',
        'Inspect the generated HTML printed below the form',
        'Compare with a NaiveInput without inheritAttrs: false',
      ],
      code: `<!-- BaseInput.vue -->
<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ label: String })
</script>
<template>
  <label class="field">
    <span>{{ label }}</span>
    <input v-bind="$attrs">
  </label>
</template>

<!-- Usage -->
<BaseInput label="Email" type="email" placeholder="you@example.com" maxlength="40" />`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <base-input label="Email (inheritAttrs: false)" type="email" placeholder="you@example.com" maxlength="40" class="wide"></base-input>
  <naive-input label="Email (default)" type="email" placeholder="you@example.com" maxlength="40" class="wide"></naive-input>
  <pre>{{ html }}</pre>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.wide { width: 260px; }
pre { background: #f1f5f9; padding: 8px; font-size: 12px; white-space: pre-wrap; }`,
        js: `const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const html = ref('');
    onMounted(() => {
      html.value = Array.from(document.querySelectorAll('.field')).map(el => el.outerHTML).join('\\n\\n');
    });
    return { html };
  }
});

app.component('BaseInput', {
  inheritAttrs: false,          // in an SFC: defineOptions({ inheritAttrs: false })
  props: { label: String },
  template: '<label class="field"><span>{{ label }}</span><input v-bind="$attrs"></label>'
});

app.component('NaiveInput', {
  props: { label: String },
  template: '<label class="field"><span>{{ label }}</span><input></label>'
});

app.mount('#app');`,
      },
      result: 'The first field has a real placeholder, type="email", maxlength and the wide class on the <input>. The second field shows these attributes on the <label> instead, so the input has no placeholder. The printed HTML proves the difference.',
      explanation:
        'Non-prop attributes fall through to the root element by default. inheritAttrs: false disables that, and v-bind="$attrs" applies them exactly where you want. This is the standard pattern for wrapper components around native inputs.',
    },
  ],
  interview: [
    {
      q: 'What are props in Vue?',
      a: 'Props are custom attributes through which a parent passes data to a child component. The child declares them (defineProps / props option), optionally with types, defaults, required flags and validators. They form a one-way downward binding.',
      level: 'Easy',
    },
    {
      q: 'What is one-way data flow? Can a child modify a prop?',
      a: 'Data flows from parent to child via props; parent updates flow down automatically, but the child must not modify props (they are readonly and Vue warns). To change it, the child emits an event and the parent updates its own state, or the child copies the prop into local state or derives a computed.',
      level: 'Easy',
    },
    {
      q: 'Why must object/array prop defaults be factory functions?',
      a: 'A literal object default would be shared by all component instances, so mutating it in one instance would affect others. A factory (default: () => []) returns a fresh value for each instance.',
      level: 'Medium',
    },
    {
      q: 'Global vs local registration: pros and cons?',
      a: 'Global (app.component) makes a component available everywhere without imports, but it cannot be tree-shaken and makes dependencies implicit. Local registration (import in the parent) is explicit, tree-shakable and better for large apps; it is the recommended default.',
      level: 'Medium',
    },
    {
      q: 'What is defineProps and does it need to be imported?',
      a: 'A compiler macro available only in <script setup> to declare props; it is compiled away so it needs no import. It returns the reactive props object. It must be called at the top level, and its argument cannot reference local variables (it is hoisted).',
      level: 'Medium',
    },
    {
      q: 'What are fallthrough attributes?',
      a: 'Attributes and v-on listeners passed to a component that are not declared as props or emits (class, style, id, data-*, @click...). They are automatically applied to the component\'s single root element (class/style merged). They are available in $attrs / useAttrs(). Use inheritAttrs: false plus v-bind="$attrs" to control where they go.',
      level: 'Medium',
    },
    {
      q: 'How do you pass a number or boolean prop correctly?',
      a: 'With v-bind: :count="5", :active="false". A static attribute count="5" always passes the string "5". For Boolean props, simply writing the attribute (<Comp active />) passes true.',
      level: 'Easy',
    },
    {
      q: 'Are destructured props reactive in Vue 3.5?',
      a: 'Yes. Since Vue 3.5, destructuring defineProps in <script setup> (const { count = 0 } = defineProps(...)) is compiled into props.count accesses, so it stays reactive and supports native default values. To pass a destructured prop into watch or a composable you must wrap it in a getter: watch(() => count, ...).',
      level: 'Hard',
    },
    {
      q: 'Why should component names be multi-word?',
      a: 'To avoid conflicts with existing and future HTML elements, which are all single words. The Vue style guide makes multi-word names essential (except the root App and built-ins).',
      level: 'Easy',
    },
    {
      q: 'What are the restrictions of in-DOM templates?',
      a: 'Because the browser parses the HTML before Vue: tag and attribute names are case-insensitive (use kebab-case for components and props), self-closing custom tags are not allowed (use explicit closing tags), and some elements like <ul>, <table>, <select> restrict which children they allow (use is="vue:my-row" as a workaround). SFCs and string templates have none of these restrictions.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a UserAvatar component with props name (required), size (Number, default 48, validator between 24 and 128) and online (Boolean). Show initials when there is no image and a green dot when online.',
      hint: 'Initials: name.split(" ").map(w => w[0]).join("").',
      solution: `<!-- UserAvatar.vue -->
<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true },
  image: String,
  size: { type: Number, default: 48, validator: (v) => v >= 24 && v <= 128 },
  online: Boolean,
})
const initials = computed(() => props.name.split(' ').map(w => w[0]).join('').toUpperCase())
</script>
<template>
  <div class="avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="image" :src="image" :alt="name">
    <span v-else>{{ initials }}</span>
    <i v-if="online" class="dot"></i>
  </div>
</template>
<style scoped>
.avatar { position: relative; border-radius: 50%; background: #42b883; color: #fff; display: grid; place-items: center; }
.avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.dot { position: absolute; right: 0; bottom: 0; width: 25%; height: 25%; background: #22c55e; border: 2px solid #fff; border-radius: 50%; }
</style>`,
    },
    {
      task: 'Build a StudentTable component that receives a students array prop and a passMark prop (default 35) and shows Pass/Fail per row. Use it twice with different passMark values.',
      hint: 'Pass the array with :students and the number with :pass-mark.',
      solution: `<!-- StudentTable.vue -->
<script setup>
defineProps({
  students: { type: Array, required: true },
  passMark: { type: Number, default: 35 },
})
</script>
<template>
  <table>
    <tr v-for="s in students" :key="s.roll">
      <td>{{ s.name }}</td><td>{{ s.marks }}</td>
      <td>{{ s.marks >= passMark ? 'Pass' : 'Fail' }}</td>
    </tr>
  </table>
</template>

<!-- Parent -->
<StudentTable :students="list" />
<StudentTable :students="list" :pass-mark="60" />`,
    },
    {
      task: 'Create an AppButton wrapper around <button> that accepts a variant prop but lets any other attribute (disabled, type, @click, aria-label) fall through to the native button.',
      hint: 'Single root element, so fallthrough works automatically.',
      solution: `<!-- AppButton.vue -->
<script setup>
defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary', 'danger', 'ghost'].includes(v) },
})
</script>
<template>
  <button class="btn" :class="'btn-' + variant"><slot /></button>
</template>

<!-- Usage: disabled, type, aria-label and @click land on the <button> -->
<AppButton variant="danger" type="button" aria-label="Delete" @click="remove">Delete</AppButton>`,
    },
    {
      task: 'Use Vue 3.5 reactive props destructure with defaults in a Greeting component (name default "Guest", times default 1) and watch the name prop.',
      hint: 'watch(() => name, ...) because a destructured prop must be wrapped in a getter.',
      solution: `<!-- Greeting.vue -->
<script setup>
import { watch } from 'vue'
const { name = 'Guest', times = 1 } = defineProps({ name: String, times: Number })
watch(() => name, (n, old) => console.log('name changed', old, '->', n))
</script>
<template>
  <p v-for="i in times" :key="i">Hello, {{ name }}!</p>
</template>`,
    },
  ],
  quiz: [
    {
      question: 'How do you pass the number 10 to a prop called count?',
      options: ['count="10"', ':count="10"', '@count="10"', 'v-model:count="10"'],
      answer: 1,
      explanation: 'Without v-bind, the value is the string "10".',
    },
    {
      question: 'What happens if a child does props.title = "x"?',
      options: ['The parent value changes', 'Vue throws and crashes the app', 'Vue warns that props are readonly and the value does not change', 'It works silently'],
      answer: 2,
      explanation: 'Props are readonly; Vue warns in development.',
    },
    {
      question: 'Correct default for an Array prop?',
      options: ['default: () => []', 'default: []', 'default: Array', 'default: new Array'],
      answer: 0,
      explanation: 'Objects/arrays need a factory function.',
    },
    {
      question: 'In an in-DOM template (HTML in the page), how do you use ProductCard with a prop inStock?',
      options: ['<ProductCard :inStock="x" />', '<productcard :instock="x"/>', '<Product-Card :InStock="x">', '<product-card :in-stock="x"></product-card>'],
      answer: 3,
      explanation: 'Browsers lowercase names and do not allow self-closing custom tags, so use kebab-case with a closing tag.',
    },
    {
      question: 'Which option stops non-prop attributes from being applied to the root element?',
      options: ['emits: []', 'inheritAttrs: false', 'props: false', 'v-pre'],
      answer: 1,
      explanation: 'inheritAttrs: false, then bind $attrs where needed.',
    },
  ],
};
