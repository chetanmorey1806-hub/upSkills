export default {
  lesson: 'day-09-emits-component-v-model',
  minutes: 35,
  intro: 'Practise "props down, events up": emit events with payloads and build components that work with v-model.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A `ProductItem` child has an "Add to cart" button, but the cart total lives in the parent. What is the Vue way to tell the parent?',
      options: [
        'Change the parent\'s data through $parent',
        'Emit a custom event (e.g. emit("add", price)) and let the parent listen with @add',
        'Mutate the total prop',
        'Use a global variable',
      ],
      answer: 1,
      explain: '**Props down, events up**: the child emits `add` with a payload, the parent listens with `@add="addToCart"` and updates its own state. `$parent` couples components tightly and is hard to maintain.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Without `defineModel`, a component that supports `v-model` receives the prop `modelValue`. Which event name must it emit to update the value?',
      accept: ['update:modelValue', "'update:modelValue'", '"update:modelValue"'],
      explain: 'On a component, `v-model="rating"` expands to `:modelValue="rating" @update:modelValue="v => rating = v"`. For `v-model:title` the pair is `title` / `update:title`. `defineModel()` (Vue 3.4+) generates this pair for you.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Declaring emits (defineEmits / emits option) documents the component API and keeps those listeners out of $attrs',
        'In <script setup> you call `const emit = defineEmits(["add"])` and then `emit("add", 5)`',
        'Emitted events bubble up through all ancestors like DOM events',
        'One component can have several v-models, e.g. v-model:first and v-model:last',
      ],
      answers: [0, 1, 3],
      explain: 'Component events do **not** bubble: only the direct parent can listen. For distant components use provide/inject or a store. Multiple named v-models are supported since Vue 3.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 8,
      q: 'The parent template is given. Write:\n- the root app with `total` (0) and `addToCart(price)` that adds the price\n- a global `ProductItem` component with props `name` and `price` (Number) and `emits: ["add"]`; it renders `<div class="product">` with the name and a `<button>` that emits `add` with the price\n\nThe checks click both products\' buttons.',
      html: '<div id="app">\n  <product-item name="Pen" :price="20" @add="addToCart"></product-item>\n  <product-item name="Notebook" :price="60" @add="addToCart"></product-item>\n  <p id="total">Cart: ₹{{ total }}</p>\n</div>',
      example: { title: 'emitting with a payload', code: "app.component('StarButton', {\n  props: ['value'],\n  emits: ['pick'],\n  template: `<button @click=\"$emit('pick', value)\">★</button>`,\n});" },
      starter: "const { createApp, ref } = Vue;\n\nconst app = createApp({\n  setup() {\n    // TODO\n    return {};\n  },\n});\n// TODO: ProductItem\napp.mount('#app');\n",
      solution: "const { createApp, ref } = Vue;\n\nconst app = createApp({\n  setup() {\n    const total = ref(0);\n    function addToCart(price) { total.value += price; }\n    return { total, addToCart };\n  },\n});\napp.component('ProductItem', {\n  props: { name: String, price: Number },\n  emits: ['add'],\n  template: `\n    <div class=\"product\">{{ name }} <button @click=\"$emit('add', price)\">Add</button></div>\n  `,\n});\napp.mount('#app');",
      actions: [{ click: '.product:nth-of-type(1) button' }, { click: '.product:nth-of-type(2) button' }],
      checks: [
        { sel: '.product', count: 2, msg: 'Two .product components must render' },
        { sel: '#total', textEq: 'Cart: ₹80', msg: 'After adding Pen (20) and Notebook (60) the cart must show ₹80' },
      ],
      explain: 'The child does not know anything about the cart; it just announces "add, price". The parent decides what that means. This keeps `ProductItem` reusable on a wishlist page too.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 9,
      q: 'Build a `RatingInput` that works with `v-model` (manual pattern). The parent template is given. Write:\n- root app with `rating` (0)\n- global `RatingInput` with prop `modelValue` (Number) and emits `update:modelValue`; it renders 5 `<button class="star">` (v-for n in 5); clicking star `n` emits `update:modelValue` with `n`; a star gets the class `on` when `n <= modelValue`\n\nThe checks click the 4th star.',
      html: '<div id="app">\n  <rating-input v-model="rating"></rating-input>\n  <p id="rating">Your rating: {{ rating }}</p>\n</div>',
      example: { title: 'v-model contract on a component', code: "props: ['modelValue'],\nemits: ['update:modelValue'],\ntemplate: `<input :value=\"modelValue\" @input=\"$emit('update:modelValue', $event.target.value)\">`" },
      starter: "const { createApp, ref } = Vue;\n\nconst app = createApp({\n  setup() {\n    const rating = ref(0);\n    return { rating };\n  },\n});\n// TODO: RatingInput\napp.mount('#app');\n",
      solution: "const { createApp, ref } = Vue;\n\nconst app = createApp({\n  setup() {\n    const rating = ref(0);\n    return { rating };\n  },\n});\napp.component('RatingInput', {\n  props: { modelValue: { type: Number, default: 0 } },\n  emits: ['update:modelValue'],\n  template: `\n    <div class=\"rating\">\n      <button v-for=\"n in 5\" :key=\"n\" class=\"star\" :class=\"{ on: n <= modelValue }\" @click=\"$emit('update:modelValue', n)\">★</button>\n    </div>\n  `,\n});\napp.mount('#app');",
      actions: [{ click: '.star:nth-of-type(4)' }],
      checks: [
        { sel: '.star', count: 5, msg: 'Render 5 .star buttons' },
        { sel: '#rating', textEq: 'Your rating: 4', msg: 'Clicking the 4th star must update the parent rating to 4 through v-model' },
        { sel: '.star.on', count: 4, msg: 'Stars 1-4 must have the class "on"' },
      ],
      explain: 'The child never stores the rating itself: it shows `modelValue` and asks the parent to change it. In `<script setup>` the same component is just `const model = defineModel()` with `@click="model = n"`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'This plain-JS code imitates what `v-model="city"` on a component does. What is printed?',
      code: `let city = 'Pune';
const props = { modelValue: city };
const emit = (event, value) => { if (event === 'update:modelValue') city = value; };

emit('update:modelValue', 'Nagpur');
console.log(props.modelValue, city);`,
      expected: 'Pune Nagpur',
      explain: 'The emit updates the **parent\'s** variable. The child\'s props object still has the old value until the parent re-renders and passes the new `modelValue` down. That is why a child should never rely on changing its own copy.',
    },
  ],
};
