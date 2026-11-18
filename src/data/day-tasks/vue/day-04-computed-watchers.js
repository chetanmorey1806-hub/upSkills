export default {
  lesson: 'day-04-computed-watchers',
  minutes: 30,
  intro: 'Practise computed properties (and their caching), watch with options, and choosing between computed, watch and watchEffect.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the key difference between a **computed** property and a **method** used in the template?',
      options: [
        'Methods are reactive, computed properties are not',
        'A computed value is cached and only re-evaluated when its reactive dependencies change; a method runs on every re-render',
        'Computed properties can take arguments',
        'There is no difference',
      ],
      answer: 1,
      explain: 'Computed values are **cached** by their dependencies, so an expensive filter or total runs only when needed. A method in the template re-runs every time the component re-renders, even if its inputs did not change.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the watch so the callback also runs once immediately when the component is created:\n\n`watch(city, loadWeather, { _________: true })`',
      accept: ['immediate'],
      explain: 'By default `watch` is lazy: it runs only when the source changes. `{ immediate: true }` also runs it at creation. Other options: `deep: true` for nested changes and `once: true` to stop after the first trigger.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'For which jobs is **watch** (not computed) the right tool? (choose all that apply)',
      options: [
        'Saving the cart to localStorage whenever it changes',
        'Showing the full name built from firstName and lastName',
        'Fetching search results from an API when the search text changes',
        'Calculating the cart total',
      ],
      answers: [0, 2],
      explain: 'Use **computed** for derived values (full name, totals) and **watch** for **side effects** (API calls, storage, logging, timers). A computed function must be pure: no fetches and no changing other state.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'How many times does the computed getter run? What is printed?',
      code: `const { ref, computed } = Vue;
let runs = 0;
const price = ref(100);
const withGst = computed(() => { runs++; return price.value * 1.18; });

withGst.value;
withGst.value;
price.value = 200;
console.log(withGst.value, runs);`,
      expected: '236 2',
      explain: 'The first read computes (runs = 1); the second read uses the cache. Changing `price` marks it dirty, and the next read recomputes (runs = 2) giving 236. Computeds are also lazy: they do not run until someone reads them.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 6,
      q: 'A course costs **₹499**. Create `qty` (starts at 1) and a **computed** `total` = `qty × 499`. The template is given. The checks type **3** into the quantity.',
      html: '<div id="app">\n  <input id="qty" type="number" v-model.number="qty">\n  <p id="total">Total: ₹{{ total }}</p>\n</div>',
      example: { title: 'computed from a ref', code: "const km = ref(5);\nconst metres = computed(() => km.value * 1000);\nreturn { km, metres };" },
      starter: "const { createApp, ref, computed } = Vue;\n\ncreateApp({\n  setup() {\n    // TODO: qty + computed total\n    return {};\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref, computed } = Vue;\n\ncreateApp({\n  setup() {\n    const qty = ref(1);\n    const total = computed(() => qty.value * 499);\n    return { qty, total };\n  },\n}).mount('#app');",
      actions: [{ input: ['#qty', '3'] }],
      checks: [
        { sel: '#total', textEq: 'Total: ₹1497', msg: 'With quantity 3 the total must be "Total: ₹1497"' },
      ],
      explain: 'The computed re-evaluates automatically when `qty` changes. `v-model.number` converts the input text to a number, otherwise you could get string surprises with `+`.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 7,
      q: 'Keep a **search history** with `watch`: create `search` (empty string) and `history` (empty array). Whenever `search` changes, push the **new** value into `history`. The checks type **vue** and then **pinia**.',
      html: '<div id="app">\n  <input id="search" v-model="search">\n  <ul id="history"><li v-for="(h, i) in history" :key="i">{{ h }}</li></ul>\n</div>',
      example: { title: 'watch(source, callback)', code: "watch(page, (newPage, oldPage) => {\n  console.log(`moved from ${oldPage} to ${newPage}`);\n});" },
      starter: "const { createApp, ref, watch } = Vue;\n\ncreateApp({\n  setup() {\n    const search = ref('');\n    const history = ref([]);\n    // TODO: watch search\n    return { search, history };\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref, watch } = Vue;\n\ncreateApp({\n  setup() {\n    const search = ref('');\n    const history = ref([]);\n    watch(search, (newValue) => {\n      history.value.push(newValue);\n    });\n    return { search, history };\n  },\n}).mount('#app');",
      actions: [{ input: ['#search', 'vue'] }, { input: ['#search', 'pinia'] }],
      checks: [
        { sel: '#history li', count: 2, msg: 'After two changes the history must contain 2 entries' },
        { sel: '#history li', index: 1, textEq: 'pinia', msg: 'The second entry must be "pinia"' },
      ],
      explain: 'Pass the ref itself (`watch(search, ...)`), not `search.value`, which would be a plain string that never changes. The callback receives `(newValue, oldValue)`; this is the place for side effects such as API calls or saving to storage.',
    },
  ],
};
