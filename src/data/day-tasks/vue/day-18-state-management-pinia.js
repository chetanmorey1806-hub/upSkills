export default {
  lesson: 'day-18-state-management-pinia',
  minutes: 35,
  intro: 'Practise Pinia concepts (state, getters, actions, storeToRefs, $patch, $reset) and build the same ideas yourself with plain Vue and JavaScript.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a Pinia **options store**, where do you put a function that adds an item to the cart and saves it to the server?',
      options: ['state', 'getters', 'actions', 'plugins'],
      answer: 2,
      explain: '`state` holds data, `getters` are computed values derived from state (no side effects), and **actions** are methods that change state and may be async (API calls). In a setup store these are refs, computeds and functions.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '`const { items } = useCartStore()` loses reactivity; use `storeToRefs(store)` for state and getters',
        'Actions can be destructured directly from the store: `const { addItem } = store`',
        '`store.$patch({ a: 1, b: 2 })` updates several state properties at once',
        '`store.$reset()` works out of the box for setup stores',
        'Pinia stores show up in Vue DevTools',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The store is a reactive object, so destructuring state copies values; `storeToRefs` keeps them reactive. Actions are plain bound functions, so they can be destructured. `$reset()` is built-in only for **options** stores; setup stores must write their own.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'A store is a reactive object. What does this print?',
      code: `const { reactive, toRefs } = Vue;
const store = reactive({ count: 1 });
const { count } = store;                  // plain destructuring
const { count: countRef } = toRefs(store); // like storeToRefs
store.count = 5;
console.log(count, countRef.value);`,
      expected: '1 5',
      explain: 'Plain destructuring copied the number 1 once. The ref from `toRefs` (what `storeToRefs` uses) stays linked to the store and reads 5. This is the most common Pinia bug in interviews and real projects.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 10,
      q: 'Build a mini store factory like Pinia\'s options store: `createStore({ state, getters, actions })` where `state` is a function returning the initial object. The returned `store`:\n- has every state property directly on it (`store.items`)\n- has each getter as a property that is computed on read (`store.total`) with the getter receiving the store\n- has each action as a method whose `this` is the store\n- `store.$patch(obj)` copies obj\'s properties into the store\n- `store.$reset()` restores a **fresh** initial state',
      example: { title: 'defining a computed property with a getter', code: "Object.defineProperty(obj, 'full', {\n  get() { return obj.first + ' ' + obj.last; },\n});" },
      starter: 'function createStore({ state, getters = {}, actions = {} }) {\n  const store = {};\n  // TODO\n  return store;\n}\n',
      solution: "function createStore({ state, getters = {}, actions = {} }) {\n  const store = {};\n  Object.assign(store, state());\n  for (const [name, fn] of Object.entries(getters)) {\n    Object.defineProperty(store, name, { get: () => fn(store), enumerable: false });\n  }\n  for (const [name, fn] of Object.entries(actions)) {\n    store[name] = fn.bind(store);\n  }\n  store.$patch = (obj) => Object.assign(store, obj);\n  store.$reset = () => Object.assign(store, state());\n  return store;\n}",
      tests: [
        { call: "(() => { const s = createStore({ state: () => ({ items: [] }), getters: { count: (st) => st.items.length }, actions: { add(name) { this.items.push(name); } } }); s.add('Pen'); s.add('Bag'); return [s.items, s.count]; })()", expect: [['Pen', 'Bag'], 2] },
        { call: "(() => { const s = createStore({ state: () => ({ a: 1, b: 2 }) }); s.$patch({ a: 10, b: 20 }); return [s.a, s.b]; })()", expect: [10, 20] },
        { call: "(() => { const s = createStore({ state: () => ({ items: [] }), actions: { add(x) { this.items.push(x); } } }); s.add('Pen'); s.$reset(); s.add('Bag'); return s.items; })()", expect: ['Bag'], msg: '$reset must create a fresh state (call state() again)' },
      ],
      explain: 'Pinia does the same with real reactivity: state becomes `reactive`, getters become `computed`, actions get `this` bound to the store. Calling `state()` again for `$reset` is why state must be a **function**: sharing one initial object would let old items leak back in.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 9,
      q: 'Without Pinia, share state between unrelated components with a module-level **reactive store**. Write:\n- `cartStore = reactive({ items: [], add(name) {...} })` plus a computed-like `count` (use a getter `get count() { return this.items.length; }`)\n- global `AddButton` (prop `product`): `<button class="add">` that calls `cartStore.add(product)`\n- global `CartBadge`: `<span id="badge">Cart ({{ cart.count }})</span>` using the same store\n\nThe root template is given; the checks click both add buttons.',
      html: '<div id="app">\n  <cart-badge></cart-badge>\n  <add-button product="Pen"></add-button>\n  <add-button product="Bag"></add-button>\n</div>',
      example: { title: 'shared reactive module', code: "// store.js\nexport const counter = reactive({ n: 0, inc() { this.n++; } });\n// any component\nsetup() { return { counter }; }" },
      starter: "const { createApp, reactive } = Vue;\n\n// TODO: cartStore\n\nconst app = createApp({});\n// TODO: AddButton and CartBadge\napp.mount('#app');\n",
      solution: "const { createApp, reactive } = Vue;\n\nconst cartStore = reactive({\n  items: [],\n  get count() { return this.items.length; },\n  add(name) { this.items.push(name); },\n});\n\nconst app = createApp({});\napp.component('AddButton', {\n  props: { product: String },\n  setup(props) {\n    return { add: () => cartStore.add(props.product) };\n  },\n  template: `<button class=\"add\" @click=\"add\">Add {{ product }}</button>`,\n});\napp.component('CartBadge', {\n  setup() { return { cart: cartStore }; },\n  template: `<span id=\"badge\">Cart ({{ cart.count }})</span>`,\n});\napp.mount('#app');",
      actions: [{ click: 'button.add:nth-of-type(1)' }, { click: 'button.add:nth-of-type(2)' }],
      checks: [
        { sel: 'button.add', count: 2, msg: 'Render two AddButton components (button.add)' },
        { sel: '#badge', textEq: 'Cart (2)', msg: 'After two adds the badge must show "Cart (2)" (both components must use the same store)' },
      ],
      explain: 'Because both components import the **same** reactive object, a change in one shows in the other without props or events. Pinia formalises this pattern and adds DevTools, plugins, SSR safety and `storeToRefs`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the Pinia store definition:\n\n`export const useCartStore = ___________(\'cart\', { state: () => ({ items: [] }) })`',
      accept: ['defineStore'],
      explain: '`defineStore(id, options)` (or `defineStore(id, setupFn)`) returns a `useXxxStore` function. The id must be unique; it is used in DevTools and for plugins like persistence.',
    },
  ],
};
