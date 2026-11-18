export default {
  lesson: 'day-14-composables-reusable-logic',
  minutes: 35,
  intro: 'Write your own composables: functions that return refs and functions, keep state per call, and react to changing input with toValue().',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is a **composable**?',
      options: [
        'A component without a template',
        'A function (named useXxx) that uses Composition API features to encapsulate and reuse stateful logic',
        'A Vue plugin installed with app.use',
        'A mixin written in TypeScript',
      ],
      answer: 1,
      explain: 'A composable is just a function like `useCounter()` or `useFetch(url)` that creates refs, computed values, watchers and lifecycle hooks and returns what the component needs. It replaced mixins in Vue 3.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why are composables better than Vue 2 **mixins**? (choose all that apply)',
      options: [
        'It is clear where each returned value comes from (explicit destructuring)',
        'No name collisions: you can rename returned values',
        'You can pass arguments to configure each use',
        'They make components render faster by default',
      ],
      answers: [0, 1, 2],
      explain: 'Mixins merged properties invisibly into `this`, so you could not tell which mixin a property came from and two mixins could overwrite each other. Composables are plain function calls with explicit inputs and outputs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Inside a composable, which Vue 3.3+ helper turns an argument that may be a ref, a getter or a plain value into its current value? (`const url = ______(urlArg)`)',
      accept: ['toValue', 'toValue()'],
      explain: '`toValue(x)` returns `x.value` for refs, calls getters, and returns plain values unchanged. Using it inside `watchEffect` makes the composable re-run automatically when a ref/getter argument changes.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this print?',
      code: `const { ref } = Vue;
function useCounter(start = 0) {
  const count = ref(start);
  const inc = () => count.value++;
  return { count, inc };
}
const a = useCounter();
const b = useCounter(10);
a.inc(); a.inc(); b.inc();
console.log(a.count.value, b.count.value);`,
      expected: '2 11',
      explain: 'Each call creates **new** refs, so `a` and `b` have independent state. (If the ref were created outside the function, every caller would share it, which is how you build simple shared state on purpose.)',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 8,
      q: 'Write a composable `useToggle(initial = false)` that returns `{ on, toggle }` (`on` is a ref). Use it **twice** in the root setup: `menu` and `darkMode`, and return them. The template is given. The checks click only the menu button.',
      html: '<div id="app">\n  <button id="menu" @click="menu.toggle">Menu: {{ menu.on.value ? \'open\' : \'closed\' }}</button>\n  <button id="dark" @click="darkMode.toggle">Dark: {{ darkMode.on.value ? \'on\' : \'off\' }}</button>\n</div>',
      example: { title: 'a tiny composable', code: "function useCounter(start = 0) {\n  const count = ref(start);\n  function inc() { count.value++; }\n  return { count, inc };\n}" },
      starter: "const { createApp, ref } = Vue;\n\nfunction useToggle(initial = false) {\n  // TODO\n}\n\ncreateApp({\n  setup() {\n    // TODO: menu and darkMode\n    return {};\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref } = Vue;\n\nfunction useToggle(initial = false) {\n  const on = ref(initial);\n  function toggle() { on.value = !on.value; }\n  return { on, toggle };\n}\n\ncreateApp({\n  setup() {\n    const menu = useToggle();\n    const darkMode = useToggle(false);\n    return { menu, darkMode };\n  },\n}).mount('#app');",
      actions: [{ click: '#menu' }],
      checks: [
        { sel: '#menu', textEq: 'Menu: open', msg: 'After clicking, the menu must be "open"' },
        { sel: '#dark', textEq: 'Dark: off', msg: 'darkMode must stay "off": each useToggle() call needs its own state' },
      ],
      explain: 'Because `menu` is a plain object holding refs, the template needs `menu.on.value` (only top-level refs are auto-unwrapped). In SFCs you usually destructure: `const { on: menuOpen, toggle: toggleMenu } = useToggle()`.',
    },
    {
      type: 'code',
      lang: 'dom',
      libs: ['vue'],
      mins: 9,
      q: 'Write a composable `useFilter(items, query)` where both arguments may be refs or getters. It returns a **computed** `results`: the items whose name includes the query (case-insensitive), using `toValue()` for both inputs. Use it in setup with the given `courses` and `search` refs, returning `results`. The checks type **VU**.',
      html: '<div id="app">\n  <input id="q" v-model="search">\n  <ul id="results"><li v-for="c in results" :key="c">{{ c }}</li></ul>\n</div>',
      example: { title: 'toValue inside computed', code: "function useDouble(n) {\n  return computed(() => toValue(n) * 2);\n}\nuseDouble(ref(4));      // works with a ref\nuseDouble(() => x.value); // and with a getter" },
      starter: "const { createApp, ref, computed, toValue } = Vue;\n\nfunction useFilter(items, query) {\n  // TODO\n}\n\ncreateApp({\n  setup() {\n    const courses = ref(['Vue Basics', 'Vue Router', 'Pinia', 'Nuxt']);\n    const search = ref('');\n    // TODO\n    return { search };\n  },\n}).mount('#app');\n",
      solution: "const { createApp, ref, computed, toValue } = Vue;\n\nfunction useFilter(items, query) {\n  const results = computed(() => {\n    const q = toValue(query).toLowerCase();\n    return toValue(items).filter((name) => name.toLowerCase().includes(q));\n  });\n  return { results };\n}\n\ncreateApp({\n  setup() {\n    const courses = ref(['Vue Basics', 'Vue Router', 'Pinia', 'Nuxt']);\n    const search = ref('');\n    const { results } = useFilter(courses, search);\n    return { search, results };\n  },\n}).mount('#app');",
      actions: [{ input: ['#q', 'VU'] }],
      checks: [
        { sel: '#results li', count: 2, msg: 'Searching "VU" must show 2 courses (case-insensitive)' },
        { sel: '#results li', index: 1, textEq: 'Vue Router', msg: 'The second result must be "Vue Router"' },
      ],
      explain: 'If the composable read `query.value` once outside the computed, it would never update. Reading with `toValue()` **inside** the computed makes Vue track the ref/getter, so the results follow the input.',
    },
  ],
};
