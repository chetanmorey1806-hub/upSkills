export default {
  lesson: 'day-03-reactivity-ref-reactive',
  minutes: 30,
  intro: 'Practise ref() and reactive(), the .value and unwrapping rules, and the destructuring pitfall.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`const count = ref(0)`. How do you add 1 inside `setup()` / `<script setup>`?',
      options: ['count++', 'count.value++', 'count.set(count + 1)', 'this.count++'],
      answer: 1,
      explain: 'A ref is a wrapper object; in JavaScript you read and write it through **`.value`**. Only in the template is it unwrapped automatically (`{{ count }}`, `@click="count++"`). Writing `count++` in script tries to change the constant itself.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '`ref()` works with any value, including numbers and strings',
        '`reactive()` only works with objects, arrays, Maps and Sets',
        '`const { name } = reactive({ name: "Asha" })` gives a reactive `name` variable',
        'Replacing a reactive object (`state = reactive({...})` again) breaks the connection to the template',
        '`toRefs(state)` lets you destructure a reactive object without losing reactivity',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Destructuring a reactive object copies the **current plain value**, so the variable no longer updates. Use `toRefs()` (or keep `state.name`). Reassigning the variable to a new reactive object leaves the template watching the old one; mutate properties instead, or use a ref.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which Vue function converts every property of a reactive object into a ref, so you can write `const { name, city } = ______(state)` safely?',
      accept: ['toRefs'],
      explain: '`toRefs(state)` returns an object of refs linked to the original properties, so `name.value = "Ravi"` also updates `state.name`. `toRef(state, "name")` does the same for a single property.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `const { ref, reactive, isRef } = Vue;
const count = ref(1);
const state = reactive({ n: count });
state.n++;
console.log(count.value, state.n, isRef(state.n));`,
      expected: '2 2 false',
      explain: 'A ref stored inside a reactive object is **unwrapped**: `state.n` reads/writes `count.value` directly, so both become 2, and `state.n` gives the plain number (not a ref), hence `isRef` is false.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 6,
      q: 'Make the shopping cart work with **`reactive()`**: `cart` has `items` (0) and `total` (0). `addItem(price)` adds one item and the price to the total. The checks click the button twice.',
      html: '<div id="app">\n  <p id="items">Items: {{ cart.items }}</p>\n  <p id="total">Total: ₹{{ cart.total }}</p>\n  <button id="add" @click="addItem(250)">Add notebook (₹250)</button>\n</div>',
      example: { title: 'reactive object', code: "const player = reactive({ score: 0, lives: 3 });\nfunction hit() { player.lives--; }\nreturn { player, hit };" },
      starter: "const { createApp, reactive } = Vue;\n\ncreateApp({\n  setup() {\n    // TODO: cart + addItem\n    return {};\n  },\n}).mount('#app');\n",
      solution: "const { createApp, reactive } = Vue;\n\ncreateApp({\n  setup() {\n    const cart = reactive({ items: 0, total: 0 });\n    function addItem(price) {\n      cart.items++;\n      cart.total += price;\n    }\n    return { cart, addItem };\n  },\n}).mount('#app');",
      actions: [{ click: '#add' }, { click: '#add' }],
      checks: [
        { sel: '#items', textEq: 'Items: 2', msg: 'After 2 clicks: "Items: 2"' },
        { sel: '#total', textEq: 'Total: ₹500', msg: 'After 2 clicks: "Total: ₹500"' },
      ],
      explain: 'With `reactive()` you change properties directly (`cart.items++`, no `.value`). Vue tracks each property access, so both paragraphs update. Returning `cart.items` (a number) from setup instead of `cart` would lose reactivity.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 7,
      q: 'The student profile is a reactive object, but the template uses `name` and `city` directly. In `setup()` create `const student = reactive({ name: "Asha", city: "Pune" })`, return its properties **as refs** (so the template stays reactive), and write `moveTo(newCity)` that changes `student.city`. The checks click **Move**.',
      html: '<div id="app">\n  <p id="info">{{ name }} lives in {{ city }}</p>\n  <button id="move" @click="moveTo(\'Bengaluru\')">Move</button>\n</div>',
      example: { title: 'toRefs in setup', code: "const state = reactive({ a: 1, b: 2 });\nreturn { ...toRefs(state) };   // template can use a and b" },
      starter: "const { createApp, reactive, toRefs } = Vue;\n\ncreateApp({\n  setup() {\n    const student = reactive({ name: 'Asha', city: 'Pune' });\n    function moveTo(newCity) { student.city = newCity; }\n    // TODO: return name and city so they stay reactive\n    return { moveTo };\n  },\n}).mount('#app');\n",
      solution: "const { createApp, reactive, toRefs } = Vue;\n\ncreateApp({\n  setup() {\n    const student = reactive({ name: 'Asha', city: 'Pune' });\n    function moveTo(newCity) { student.city = newCity; }\n    return { ...toRefs(student), moveTo };\n  },\n}).mount('#app');",
      actions: [{ click: '#move' }],
      checks: [
        { sel: '#info', textEq: 'Asha lives in Bengaluru', msg: 'After clicking Move the text must be "Asha lives in Bengaluru" (plain { ...student } would not update)' },
      ],
      explain: '`return { ...student }` would copy the plain values "Asha" and "Pune" once, and the page would never change. `...toRefs(student)` spreads **refs** that stay linked to the reactive object, so changing `student.city` updates the template.',
    },
  ],
};
