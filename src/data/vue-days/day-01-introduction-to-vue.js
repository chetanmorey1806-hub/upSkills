export default {
  id: 'day-01-introduction-to-vue',
  title: 'Introduction to Vue.js: Progressive Framework, Vue vs React vs Angular, CDN and Vite',
  module: 'Module 1: Vue Basics',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Meet Vue.js 3: what a "progressive" JavaScript framework is, how Vue compares with React and Angular, and the two ways to start a Vue app: a CDN script tag for quick experiments and Vite for real projects with .vue single-file components.',
  objectives: [
    'Explain what Vue.js is and why it is called a progressive framework',
    'Compare Vue with React and Angular at an interview level',
    'Create a Vue app with createApp and mount it using the CDN global build',
    'Scaffold a Vite project with npm create vue@latest and understand its folder structure',
    'Read and write a basic single-file component (.vue) with <script setup>',
  ],
  theory: [
    {
      heading: 'What is Vue.js?',
      content:
        'Vue (pronounced "view") is an open-source JavaScript framework for building user interfaces. It was created by **Evan You** in 2014 after working with AngularJS at Google; he wanted the good parts of Angular (templates, data binding) in a lighter package. The current major version is **Vue 3** (Vue 2 reached end of life on 31 Dec 2023), and this course uses **Vue 3.5**.\n\nVue is built around two core ideas:\n\n- **Declarative rendering**: you describe *what* the HTML should look like for the current data using a template (`{{ message }}`), and Vue works out *how* to update the DOM.\n- **Reactivity**: Vue tracks which data each part of the page uses. When that data changes, Vue updates only the affected DOM, automatically.\n\nAnalogy: with plain JavaScript you are a painter who must repaint every changed part of the canvas by hand (`document.querySelector(...).textContent = ...`). With Vue you write the recipe once ("this heading shows the user name") and a helper repaints automatically whenever the name changes.',
      points: [
        'Used by Alibaba, GitLab, Nintendo, BMW, Adobe Portfolio, and many Indian startups',
        'Gentle learning curve: valid HTML is already a valid Vue template',
        'Official ecosystem: Vue Router (routing), Pinia (state), Vite (build tool), Vue DevTools, Nuxt (full-stack framework)',
      ],
    },
    {
      heading: 'Why "progressive" framework?',
      content:
        'Vue is **incrementally adoptable**. You can use as little or as much of it as you need:\n\n1. **Enhance static HTML**: drop a `<script>` tag on an existing page and make one widget interactive (no build step).\n2. **Single Page Application (SPA)**: build the whole frontend in Vue with components, Vue Router and Pinia.\n3. **Full-stack / SSR**: use Nuxt for server-side rendering, static site generation and SEO.\n4. **Beyond the web**: desktop (Electron), mobile (Ionic, Capacitor), even custom renderers.\n\nAnalogy: Vue is like a modular kitchen. You can buy just a stove today, add cabinets next month and a full island later, without demolishing anything. Angular is more like buying a complete fitted kitchen on day one.',
      tip: 'In interviews, "progressive" means "you can adopt it step by step"; it does NOT mean "Progressive Web App".',
    },
    {
      heading: 'Vue vs React vs Angular',
      content:
        'All three build component-based UIs, but their philosophy differs:\n\n- **Vue**: framework with official router/state libraries; HTML-based templates (JSX optional); fine-grained reactivity with `ref`/`reactive`; small (~34 KB gzipped runtime + compiler less in builds); very gentle learning curve.\n- **React**: a UI *library* by Meta; uses JSX (HTML inside JavaScript); state changes re-run the component function; routing and state management come from the community (React Router, Redux, Zustand); the largest job market.\n- **Angular**: a full, opinionated *platform* by Google; TypeScript is mandatory; includes router, HTTP client, forms, dependency injection, testing tools; steeper learning curve; popular in large enterprises.\n\nHow they update the UI: React re-renders a component function and diffs the Virtual DOM. Vue also uses a Virtual DOM, but its compiler marks static parts and its reactivity system knows exactly which component depends on which data, so it re-renders only the components that need it, with no `useMemo`/`useCallback` style manual optimisation.',
      points: [
        'Choose Vue: fast onboarding, templates designers can read, progressive adoption in an existing site',
        'Choose React: biggest ecosystem and hiring pool, React Native for mobile',
        'Choose Angular: large enterprise teams who want one opinionated, all-in-one framework',
      ],
    },
    {
      heading: 'Way 1: Vue from a CDN (no build step)',
      content:
        'The fastest way to try Vue is the **global build** from a CDN. It exposes a global `Vue` object. You write the template directly in the page inside a root element, then call `createApp(...)` and `.mount("#app")`.\n\n- `createApp(rootComponent)` creates an **application instance**.\n- The root component here is an options object with a `setup()` function. Whatever `setup()` returns is available in the template.\n- `ref(value)` creates a **reactive variable**. In JavaScript you read/write `count.value`; in the template you just write `count` (Vue unwraps it).\n- `.mount("#app")` takes over the element: its inner HTML becomes the template.\n\nThis is exactly how our Code Playground runs Vue: the template lives in the HTML panel and the `createApp` code lives in the JS panel.',
      syntax: `<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">
  <h1>{{ message }}</h1>
  <button @click="count++">Clicked {{ count }} times</button>
</div>

<script>
  const { createApp, ref } = Vue;
  createApp({
    setup() {
      const message = ref('Hello Vue!');
      const count = ref(0);
      return { message, count };
    }
  }).mount('#app');
</script>`,
      tip: 'Use vue.global.js while learning (it prints helpful warnings) and vue.global.prod.js in production.',
    },
    {
      heading: 'Way 2: Vite project with single-file components (real projects)',
      content:
        'For real applications use **Vite** (also created by Evan You): a very fast dev server with hot module replacement (HMR) and an optimised production build.\n\n1. Install Node.js 20+ (22 LTS recommended).\n2. Run `npm create vue@latest` (the official scaffolding tool, create-vue). It asks about TypeScript, JSX, Router, Pinia, Vitest, ESLint, Prettier: answer "No" to everything for now.\n3. `cd my-vue-app`, `npm install`, `npm run dev`, then open http://localhost:5173.\n\nKey files:\n\n- `index.html`: the single HTML page with `<div id="app"></div>` and a `<script type="module" src="/src/main.js">`\n- `src/main.js`: `createApp(App).mount("#app")`\n- `src/App.vue`: the root **single-file component (SFC)**\n- `src/components/`: your reusable components\n- `vite.config.js`: Vite config with the `@vitejs/plugin-vue` plugin\n- `package.json`: scripts `dev`, `build` (outputs `dist/`), `preview`\n\nA `.vue` SFC keeps one component in one file with three blocks: `<script setup>` (logic), `<template>` (markup) and `<style scoped>` (CSS that applies only to this component). With `<script setup>`, every top-level variable and import is automatically available in the template, so there is no `return`.',
      syntax: `<!-- src/App.vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count is {{ count }}</button>
</template>

<style scoped>
button { padding: 8px 16px; }
</style>`,
      points: [
        'Install Vue DevTools (browser extension or vite-plugin-vue-devtools) to inspect components and state',
        'VS Code: install the official "Vue - Official" extension (formerly Volar)',
      ],
    },
  ],
  examples: [
    {
      title: 'Hello Vue with the CDN build',
      scenario: 'You want to see Vue running in under a minute, without installing anything.',
      steps: [
        'Create index.html and add the Vue global build script from unpkg',
        'Add <div id="app"> containing a heading that uses {{ message }}',
        'In a script, destructure createApp and ref from the global Vue object',
        'Return message from setup() and mount the app on #app',
        'Open the file in a browser (or click Run in the playground)',
      ],
      code: `<!-- index.html -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">
  <h1>{{ message }}</h1>
  <p>Vue version: {{ version }}</p>
</div>

<script>
  const { createApp, ref, version } = Vue;
  createApp({
    setup() {
      const message = ref('Hello Vue 3!');
      return { message, version };
    }
  }).mount('#app');
</script>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <h1>{{ message }}</h1>
  <p>Vue version: <strong>{{ version }}</strong></p>
  <p>Today we start learning {{ course.toUpperCase() }}.</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
h1 { color: #42b883; }`,
        js: `const { createApp, ref, version } = Vue;

createApp({
  setup() {
    const message = ref('Hello Vue 3!');
    const course = ref('Vue.js');
    console.log('Vue app mounted, version', version);
    return { message, course, version };
  }
}).mount('#app');`,
      },
      result: 'A green "Hello Vue 3!" heading, the Vue version (3.5.x) and "Today we start learning VUE.JS." The console logs the version.',
      explanation:
        'createApp creates the application from the root component. Everything returned from setup() becomes available in the template. {{ }} (mustache interpolation) accepts any single JavaScript expression, so course.toUpperCase() works. mount("#app") compiles the inner HTML of #app as the template and replaces it with the rendered result.',
    },
    {
      title: 'Reactivity in action: a counter',
      scenario: 'Show the difference between Vue and manual DOM updates: change data, and the screen updates by itself.',
      steps: [
        'Create a ref called count with initial value 0',
        'Write increment and reset functions that change count.value',
        'Bind them to buttons with @click',
        'Show count and a derived message in the template',
        'Click the buttons and watch the page update without any querySelector code',
      ],
      code: `<!-- src/components/ClickCounter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
function increment() { count.value++ }
function reset() { count.value = 0 }
</script>

<template>
  <div class="counter">
    <h2>{{ count }}</h2>
    <button @click="increment">+1</button>
    <button @click="reset">Reset</button>
    <p v-if="count >= 5">You clicked a lot!</p>
  </div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="counter">
    <h2>{{ count }}</h2>
    <button @click="increment">+1</button>
    <button @click="reset">Reset</button>
    <p v-if="count >= 5">You clicked a lot!</p>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.counter { text-align: center; border: 2px solid #42b883; border-radius: 12px; padding: 16px; max-width: 260px; }
h2 { font-size: 3rem; margin: 0 0 12px; color: #35495e; }
button { margin: 4px; padding: 8px 16px; border: 0; border-radius: 6px; background: #42b883; color: white; cursor: pointer; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const count = ref(0);
    function increment() { count.value++; }
    function reset() { count.value = 0; }
    return { count, increment, reset };
  }
}).mount('#app');`,
      },
      result: 'A big number starting at 0. "+1" increases it, "Reset" sets it back to 0, and from 5 clicks the message "You clicked a lot!" appears.',
      explanation:
        'count is a ref, so Vue tracks every place the template reads it. Changing count.value inside increment() schedules a re-render of only this component. In the SFC version, <script setup> exposes count, increment and reset to the template automatically; in the CDN version we return them from setup().',
    },
    {
      title: 'Progressive enhancement: two small Vue apps on one page',
      scenario: 'An existing company website only needs two interactive widgets: a greeting box and a theme toggle. You do not want to rewrite the whole site.',
      steps: [
        'Keep the normal static HTML of the page',
        'Wrap only the interactive area in <div id="app"> (the rest stays plain HTML)',
        'Inside it, add a name input with v-model and a dark-mode toggle',
        'Mount one Vue app on that area only',
        'Notice the static header outside #app is untouched by Vue',
      ],
      code: `<!-- Existing static page: Vue controls only #app -->
<header><h1>Acme Corp</h1></header>

<div id="app">
  <input v-model="name" placeholder="Your name">
  <p>Welcome, {{ name || 'guest' }}!</p>
  <button @click="dark = !dark">Toggle theme</button>
</div>

<footer>(c) Acme</footer>

<script>
  const { createApp, ref } = Vue;
  createApp({
    setup() {
      const name = ref('');
      const dark = ref(false);
      return { name, dark };
    }
  }).mount('#app');
</script>`,
      playground: {
        libs: ['vue'],
        html: `<header class="static"><h1>Acme Corp (static HTML)</h1></header>

<div id="app">
  <section :class="['widget', { dark }]">
    <label>Your name: <input v-model="name" placeholder="Type here"></label>
    <p>Welcome, <strong>{{ name || 'guest' }}</strong>!</p>
    <button @click="dark = !dark">{{ dark ? 'Light' : 'Dark' }} mode</button>
  </section>
</div>

<footer class="static">Footer is also plain HTML, Vue does not touch it.</footer>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.static { background: #eee; padding: 8px 12px; border-radius: 6px; }
.widget { margin: 12px 0; padding: 16px; border-radius: 10px; border: 1px solid #ccc; transition: background .3s; }
.widget.dark { background: #1e293b; color: #f1f5f9; }
button { margin-top: 8px; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const name = ref('');
    const dark = ref(false);
    return { name, dark };
  }
}).mount('#app');`,
      },
      result: 'Typing a name updates the welcome text instantly; the button switches the widget between light and dark. The header and footer stay plain HTML.',
      explanation:
        'This is the "progressive" idea: Vue manages only the element it is mounted on. v-model (two-way binding) and :class (class binding) are previews of Day 2 and Day 5. You can mount several independent apps on one page, each with its own createApp call.',
    },
    {
      title: 'Anatomy of a Vite project (App.vue + child component)',
      scenario: 'Your team lead runs npm create vue@latest and asks you to explain the generated structure and build your first child component.',
      steps: [
        'Run npm create vue@latest my-vue-app, answer No to all optional features',
        'cd my-vue-app, npm install, npm run dev and open http://localhost:5173',
        'Create src/components/WelcomeCard.vue with a props-free template and scoped style',
        'Import WelcomeCard in App.vue and use it as <WelcomeCard />',
        'Run npm run build to produce the optimised dist/ folder',
        'In the playground, the same component is registered with app.component and an inline template',
      ],
      code: `// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'

createApp(App).mount('#app')

<!-- src/components/WelcomeCard.vue -->
<script setup>
import { ref } from 'vue'
const likes = ref(0)
</script>

<template>
  <div class="card">
    <h2>Welcome to Vue 3</h2>
    <button @click="likes++">Like ({{ likes }})</button>
  </div>
</template>

<style scoped>
.card { border: 1px solid #42b883; padding: 16px; border-radius: 8px; }
</style>

<!-- src/App.vue -->
<script setup>
import WelcomeCard from './components/WelcomeCard.vue'
</script>

<template>
  <h1>My First Vite + Vue App</h1>
  <WelcomeCard />
  <WelcomeCard />
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <h1>My First Vite + Vue App</h1>
  <welcome-card></welcome-card>
  <welcome-card></welcome-card>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { border: 1px solid #42b883; padding: 16px; border-radius: 8px; margin-bottom: 12px; }`,
        js: `const { createApp, ref } = Vue;

const app = createApp({});

// Same component as WelcomeCard.vue, written with an inline template
app.component('WelcomeCard', {
  setup() {
    const likes = ref(0);
    return { likes };
  },
  template: \`
    <div class="card">
      <h2>Welcome to Vue 3</h2>
      <button @click="likes++">Like ({{ likes }})</button>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'Two cards, each with its own Like counter: clicking one card does not change the other.',
      explanation:
        'Each use of a component creates a separate instance with its own state. In a Vite project, Vue SFCs are compiled at build time and imported like modules. In the playground (no build step), we register the same component globally with app.component and give it a template string. Inside in-DOM HTML we must write the tag in kebab-case (<welcome-card>) and with a closing tag, because the browser parses that HTML before Vue sees it.',
    },
  ],
  interview: [
    {
      q: 'What is Vue.js?',
      a: 'Vue is an open-source, progressive JavaScript framework for building user interfaces and single-page applications. It offers declarative template-based rendering and a reactivity system that automatically updates the DOM when data changes. It was created by Evan You and Vue 3 is the current major version.',
      level: 'Easy',
    },
    {
      q: 'Why is Vue called a "progressive" framework?',
      a: 'Because it can be adopted incrementally: you can add it to one part of an existing page via a script tag, then grow to a full SPA with Vue Router and Pinia, and further to SSR/SSG with Nuxt, without rewriting what you already have.',
      level: 'Easy',
    },
    {
      q: 'Compare Vue, React and Angular.',
      a: 'Vue: framework with HTML templates, fine-grained reactivity, official router and state library, gentle learning curve. React: UI library by Meta using JSX, re-runs component functions on state change, ecosystem-driven routing/state, biggest job market. Angular: full opinionated platform by Google, mandatory TypeScript, built-in DI, router, forms and HTTP, steeper learning curve, common in large enterprises.',
      level: 'Medium',
    },
    {
      q: 'What does createApp() do and what does mount() do?',
      a: 'createApp(rootComponent) creates a new application instance with its own config, global components, directives and plugins. mount(selectorOrElement) renders the root component into that DOM element and returns the root component instance. Plugins and global components must be registered before mount.',
      level: 'Easy',
    },
    {
      q: 'What is a Single File Component (SFC)?',
      a: 'A .vue file that groups a component\'s logic (<script> or <script setup>), markup (<template>) and styles (<style>, optionally scoped) in one file. A build tool (Vite with @vitejs/plugin-vue) compiles it into a JavaScript module with a render function.',
      level: 'Easy',
    },
    {
      q: 'What is Vite and why is it preferred over Vue CLI (webpack)?',
      a: 'Vite is a build tool that serves source files as native ES modules during development, so the dev server starts instantly and hot module replacement is very fast regardless of app size. For production it bundles with Rollup. Vue CLI is in maintenance mode; the official scaffold is now npm create vue@latest, which uses Vite.',
      level: 'Medium',
    },
    {
      q: 'Does Vue use a Virtual DOM?',
      a: 'Yes. Templates compile to render functions that produce virtual DOM nodes. Vue 3\'s compiler adds optimisations (static hoisting, patch flags, block tree) so at runtime it only diffs dynamic parts. Combined with dependency tracking, only components whose reactive data changed re-render. (Vue is also developing "Vapor mode", an optional VDOM-free compilation strategy.)',
      level: 'Hard',
    },
    {
      q: 'What is the difference between vue.global.js, vue.runtime.global.js and vue.esm-bundler.js?',
      a: 'vue.global.js is the full build (runtime + template compiler) exposed as a global Vue for <script> tags. The runtime-only builds lack the compiler, so they cannot compile template strings in the browser; they are used when templates are precompiled (as in SFCs with Vite). esm-bundler builds are meant for bundlers like Vite/webpack. .prod.js variants are minified and strip dev warnings.',
      level: 'Hard',
    },
    {
      q: 'What are the main differences between Vue 2 and Vue 3?',
      a: 'Vue 3 adds the Composition API (setup, ref, reactive, <script setup>), a Proxy-based reactivity system (detects property addition and array index changes), createApp instead of new Vue(), multiple root nodes (fragments), Teleport, Suspense, better TypeScript support, smaller and faster runtime. Vue 2 reached end of life on 31 Dec 2023.',
      level: 'Medium',
    },
    {
      q: 'Can you have more than one Vue app on a page?',
      a: 'Yes. Each createApp() call creates an isolated application with its own configuration and global registrations. You can mount them on different elements, which is common when progressively enhancing server-rendered pages.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Using the CDN build, create a page that shows your name, your city and the current year in a card. Store all three in refs.',
      hint: 'new Date().getFullYear() gives the year. Return all refs from setup().',
      solution: `<div id="app">
  <div class="card">
    <h2>{{ name }}</h2>
    <p>City: {{ city }}</p>
    <p>Year: {{ year }}</p>
  </div>
</div>

<script>
  const { createApp, ref } = Vue;
  createApp({
    setup() {
      const name = ref('Asha Patil');
      const city = ref('Pune');
      const year = ref(new Date().getFullYear());
      return { name, city, year };
    }
  }).mount('#app');
</script>`,
    },
    {
      task: 'Build a "Like" button that shows "0 likes" initially, "1 like" after one click (singular) and "N likes" afterwards.',
      hint: 'Use a ternary expression in the interpolation.',
      solution: `<div id="app">
  <button @click="likes++">👍 {{ likes }} {{ likes === 1 ? 'like' : 'likes' }}</button>
</div>

<script>
  const { createApp, ref } = Vue;
  createApp({
    setup() {
      const likes = ref(0);
      return { likes };
    }
  }).mount('#app');
</script>`,
    },
    {
      task: 'Scaffold a Vite project and replace App.vue with a component that shows a heading and a button that toggles a paragraph "Vue is progressive!".',
      hint: 'npm create vue@latest, then use a boolean ref and v-if.',
      solution: `<!-- src/App.vue -->
<script setup>
import { ref } from 'vue'
const show = ref(false)
</script>

<template>
  <h1>Day 1 Practice</h1>
  <button @click="show = !show">{{ show ? 'Hide' : 'Show' }}</button>
  <p v-if="show">Vue is progressive!</p>
</template>

<style scoped>
h1 { color: #42b883; }
</style>`,
    },
    {
      task: 'Mount two separate Vue apps on the same page (#app1 and #app2), each with its own counter, and prove they are independent.',
      hint: 'Call createApp twice with different root components.',
      solution: `<div id="app1"><button @click="n++">App 1: {{ n }}</button></div>
<div id="app2"><button @click="n++">App 2: {{ n }}</button></div>

<script>
  const { createApp, ref } = Vue;
  createApp({ setup() { return { n: ref(0) }; } }).mount('#app1');
  createApp({ setup() { return { n: ref(100) }; } }).mount('#app2');
</script>`,
    },
  ],
  quiz: [
    {
      question: 'Who created Vue.js?',
      options: ['Jordan Walke', 'Evan You', 'Misko Hevery', 'Rich Harris'],
      answer: 1,
      explanation: 'Evan You created Vue in 2014. Jordan Walke created React, Misko Hevery AngularJS, Rich Harris Svelte.',
    },
    {
      question: 'What does "progressive framework" mean for Vue?',
      options: [
        'It only works for Progressive Web Apps',
        'It gets faster the longer the app runs',
        'It can be adopted incrementally, from one widget to a full SPA',
        'It requires TypeScript progressively',
      ],
      answer: 2,
      explanation: 'Progressive = incrementally adoptable.',
    },
    {
      question: 'In a <script setup> SFC, how do you make a variable available to the template?',
      options: [
        'Declare it at the top level of <script setup>',
        'Return it from data()',
        'Add it to window',
        'Export it with export default',
      ],
      answer: 0,
      explanation: 'Top-level bindings in <script setup> (variables, functions, imports) are automatically exposed to the template.',
    },
    {
      question: 'Which command scaffolds the official Vue 3 + Vite project?',
      options: ['npx create-react-app', 'vue init webpack', 'ng new', 'npm create vue@latest'],
      answer: 3,
      explanation: 'npm create vue@latest runs create-vue, the official Vite-based scaffolding tool.',
    },
    {
      question: 'Inside setup(), how do you change a ref named count?',
      options: ['count = 5', 'count.value = 5', 'this.count = 5', 'setCount(5)'],
      answer: 1,
      explanation: 'In JavaScript a ref is an object; its value lives in .value. Templates unwrap it automatically.',
    },
  ],
};
