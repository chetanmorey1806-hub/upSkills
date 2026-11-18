export default {
  id: 'day-11-provide-inject',
  title: 'Provide / Inject',
  module: 'Module 2: Components',
  day: 11,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary:
    'Avoid "prop drilling" by letting an ancestor provide data that any descendant can inject. Learn provide() and inject() with default values, reactive provides, updating provided state safely with readonly and provided functions, app-level provide, and Symbol injection keys.',
  objectives: [
    'Explain prop drilling and how provide/inject solves it',
    'Provide values from a component and inject them in any descendant',
    'Make injected data reactive and keep mutations inside the provider',
    'Use default values, app.provide and Symbol keys',
    'Decide between props, provide/inject and a global store',
  ],
  theory: [
    {
      heading: 'The problem: prop drilling',
      content:
        'Props work well between parent and child. But imagine a deeply nested tree: `App → Layout → Sidebar → Menu → MenuItem`, and `MenuItem` needs the current user\'s **theme**. With props alone you must pass `theme` through Layout, Sidebar and Menu, even though none of them use it. This is called **prop drilling**.\n\nProblems: lots of boilerplate, intermediate components get props they do not care about, and refactoring the tree becomes painful.\n\n**Provide / inject** solves it: an ancestor **provides** a value once, and **any descendant** at any depth can **inject** it directly.\n\nAnalogy: a building\'s Wi-Fi. Instead of running a separate cable from the router through every room to reach your laptop (prop drilling), the router broadcasts and any device inside the building connects directly (inject). Devices outside the building (components not in that subtree) cannot connect.',
    },
    {
      heading: 'provide() and inject() basics',
      content:
        '**provide(key, value)** is called in the provider\'s `setup` / `<script setup>`. The key is a string or a Symbol; the value can be anything: primitives, refs, reactive objects, functions.\n\n**inject(key, defaultValue)** is called in a descendant\'s setup. It looks up the parent chain and returns the closest provided value for that key.\n\n- If no ancestor provided the key, inject returns the **default value** (or `undefined` with a warning when no default is given).\n- Default can be computed lazily with a factory: `inject(\'config\', () => new Config(), true)` (third argument `true` means "treat default as a factory").\n- Both must be called **synchronously during setup**, not inside event handlers or after `await`.\n- A component can provide multiple keys, and a nearer provider **overrides** an outer one with the same key for its subtree.',
      syntax: `<!-- Ancestor.vue -->
<script setup>
import { provide } from 'vue'
provide('appName', 'Vue Academy')
</script>

<!-- DeepChild.vue (any depth below) -->
<script setup>
import { inject } from 'vue'
const appName = inject('appName')                 // 'Vue Academy'
const lang = inject('lang', 'en')                 // default if not provided
</script>`,
    },
    {
      heading: 'Reactivity with provide/inject',
      content:
        'If you provide a plain value, it is **not** reactive: `provide(\'count\', count.value)` provides the current number only.\n\nProvide the **ref or reactive object itself**: `provide(\'count\', count)`. The injector gets the same ref, so it stays in sync and the template auto-unwraps it.\n\n**Keep mutations in the provider** (same idea as one-way data flow): instead of letting any deep child change the state, provide the state plus **functions** that change it. Wrap the state with `readonly()` to prevent accidental writes from injectors.\n\nThis gives you a small, scoped "store" pattern: perfect for themes, the current user, form context, tabs/accordion groups and component libraries.',
      syntax: `<!-- ThemeProvider.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'
const theme = ref('light')
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
provide('theme', { theme: readonly(theme), toggleTheme })
</script>

<!-- ThemeButton.vue -->
<script setup>
import { inject } from 'vue'
const { theme, toggleTheme } = inject('theme')
</script>
<template>
  <button @click="toggleTheme">Theme: {{ theme }}</button>
</template>`,
    },
    {
      heading: 'App-level provide and Symbol keys',
      content:
        '**app.provide(key, value)** makes a value available to **every** component in the app. Plugins use it heavily (e.g. Vue Router provides the router, Pinia provides the store). Good for configuration: API base URL, feature flags, i18n.\n\n**Symbol keys**: in large apps or libraries, string keys can collide (two libraries both providing \'config\'). Use a unique `Symbol` exported from a shared file. With TypeScript, `InjectionKey<T>` (a typed Symbol) gives type safety:\n\n```\n// keys.js\nexport const userKey = Symbol(\'user\')\n// provider\nprovide(userKey, user)\n// consumer\nconst user = inject(userKey)\n```\n\n`hasInjectionContext()` tells library code whether it can call inject() at that moment.',
      syntax: `// main.js
const app = createApp(App)
app.provide('apiBase', 'https://api.example.com')
app.provide('features', { darkMode: true, beta: false })
app.mount('#app')`,
    },
    {
      heading: 'When to use what: props vs provide/inject vs Pinia',
      content:
        '- **Props / emits**: direct parent ↔ child communication. Explicit and easy to follow. Default choice.\n- **Provide / inject**: an ancestor shares data with a **subtree** without drilling: themes, a form shares validation context with its fields, Tabs share the active tab with Tab children, component libraries.\n- **Pinia store (Day 18)**: truly **global** application state used by unrelated parts of the app (cart, auth user, notifications), with DevTools support, actions and plugins.\n\nDownside of provide/inject: dependencies are less explicit (the component silently relies on an ancestor). Document the keys, use Symbols and provide sensible defaults.',
      tip: 'Do not use provide/inject for everything. If only one level separates the components, props are clearer.',
    },
  ],
  examples: [
    {
      title: 'Removing prop drilling: user info deep in the tree',
      scenario: 'App → Dashboard → Sidebar → UserBadge. Only UserBadge needs the user; the middle components should not have to pass it along.',
      steps: [
        'In the root, create a reactive user and provide("user", user)',
        'Create Dashboard and Sidebar components that know nothing about the user',
        'In UserBadge, inject("user") and display name and role',
        'Change the user in the root and see the deep badge update',
        'Render a second UserBadge outside any provider (with a default) to compare',
      ],
      code: `<!-- App.vue -->
<script setup>
import { reactive, provide } from 'vue'
import Dashboard from './Dashboard.vue'
const user = reactive({ name: 'Asha', role: 'Admin' })
provide('user', user)
</script>
<template>
  <input v-model="user.name">
  <Dashboard />
</template>

<!-- Dashboard.vue: no user prop! -->
<template><div class="dashboard"><Sidebar /></div></template>

<!-- Sidebar.vue: no user prop! -->
<template><aside><UserBadge /></aside></template>

<!-- UserBadge.vue -->
<script setup>
import { inject } from 'vue'
const user = inject('user', { name: 'Guest', role: 'Visitor' })
</script>
<template>
  <div class="badge">👤 {{ user.name }} ({{ user.role }})</div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <label>User name (root state): <input v-model="user.name"></label>
  <button @click="user.role = user.role === 'Admin' ? 'Editor' : 'Admin'">Toggle role</button>
  <dashboard-panel></dashboard-panel>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { border: 2px dashed #94a3b8; padding: 10px; margin-top: 10px; border-radius: 8px; }
.box > small { color: #64748b; }
.badge { background: #42b883; color: white; display: inline-block; padding: 6px 12px; border-radius: 999px; margin-top: 6px; }`,
        js: `const { createApp, reactive, provide, inject } = Vue;

const app = createApp({
  setup() {
    const user = reactive({ name: 'Asha', role: 'Admin' });
    provide('user', user);
    return { user };
  }
});

app.component('DashboardPanel', {
  template: '<div class="box"><small>Dashboard (no user prop)</small><side-bar></side-bar></div>'
});
app.component('SideBar', {
  template: '<div class="box"><small>Sidebar (no user prop)</small><br><user-badge></user-badge></div>'
});
app.component('UserBadge', {
  setup() {
    const user = inject('user', { name: 'Guest', role: 'Visitor' });
    return { user };
  },
  template: '<div class="badge">👤 {{ user.name }} ({{ user.role }})</div>'
});

app.mount('#app');`,
      },
      result: 'Nested dashed boxes (Dashboard → Sidebar) with a green "👤 Asha (Admin)" badge inside. Typing a new name or toggling the role updates the deep badge instantly; the middle components never receive a prop.',
      explanation:
        'Because we provided the reactive object itself, the injected value is the same proxy, so changes propagate. Dashboard and Sidebar are completely unaware of the user, which is the point: no prop drilling. The default { Guest } would only be used if no ancestor provided "user".',
    },
    {
      title: 'Theme provider with readonly state and an update function',
      scenario: 'A ThemeProvider component wraps part of the page; any nested button can toggle the theme, but nobody can set the theme to an invalid value directly.',
      steps: [
        'Create ThemeProvider with a theme ref and toggleTheme function',
        'provide("theme", { theme: readonly(theme), toggleTheme })',
        'Render its content through a default slot with a themed wrapper',
        'Create ThemeToggle and ThemedCard components that inject the theme',
        'Try to write theme.value directly in a child (it fails with a warning)',
      ],
      code: `<!-- ThemeProvider.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'
const theme = ref('light')
const toggleTheme = () => { theme.value = theme.value === 'light' ? 'dark' : 'light' }
provide('theme', { theme: readonly(theme), toggleTheme })
</script>
<template>
  <div :class="['theme-root', theme]"><slot /></div>
</template>

<!-- ThemeToggle.vue -->
<script setup>
import { inject } from 'vue'
const { theme, toggleTheme } = inject('theme')
</script>
<template>
  <button @click="toggleTheme">{{ theme === 'light' ? '🌙 Dark' : '☀️ Light' }}</button>
</template>

<!-- Usage -->
<ThemeProvider>
  <ThemedCard title="Inbox" />
  <ThemeToggle />
</ThemeProvider>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <theme-provider>
    <themed-card title="Inbox">You have 3 new messages.</themed-card>
    <themed-card title="Calendar">Meeting at 4 PM.</themed-card>
    <theme-toggle></theme-toggle>
    <hacker-button></hacker-button>
  </theme-provider>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.theme-root { padding: 14px; border-radius: 10px; transition: background .3s; }
.theme-root.light { background: #f8fafc; color: #0f172a; }
.theme-root.dark { background: #0f172a; color: #e2e8f0; }
.card { border: 1px solid currentColor; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; }
button { margin-right: 6px; }`,
        js: `const { createApp, ref, provide, inject, readonly } = Vue;

const app = createApp({});

app.component('ThemeProvider', {
  setup() {
    const theme = ref('light');
    const toggleTheme = () => { theme.value = theme.value === 'light' ? 'dark' : 'light'; };
    provide('theme', { theme: readonly(theme), toggleTheme });
    return { theme };
  },
  template: '<div :class="[\\'theme-root\\', theme]"><slot></slot></div>'
});

app.component('ThemedCard', {
  props: { title: String },
  setup() {
    const { theme } = inject('theme');
    return { theme };
  },
  template: '<div class="card"><strong>{{ title }}</strong> <small>({{ theme }})</small><div><slot></slot></div></div>'
});

app.component('ThemeToggle', {
  setup() {
    const { theme, toggleTheme } = inject('theme');
    return { theme, toggleTheme };
  },
  template: '<button @click="toggleTheme">{{ theme === \\'light\\' ? \\'🌙 Dark\\' : \\'☀️ Light\\' }}</button>'
});

app.component('HackerButton', {
  setup() {
    const { theme } = inject('theme');
    function hack() {
      theme.value = 'purple'; // readonly: warning, ignored
      console.log('theme is still', theme.value);
    }
    return { hack };
  },
  template: '<button @click="hack">Try theme.value = "purple"</button>'
});

app.mount('#app');`,
      },
      result: 'Two light cards labelled (light). "🌙 Dark" switches the whole provider area and both card labels to dark. "Try theme.value = purple" logs a Vue warning (target is readonly) and "theme is still light/dark".',
      explanation:
        'The provider exposes state read-only plus a function to change it, so all mutations go through one place. Slot content (cards and buttons) is rendered inside ThemeProvider\'s subtree, so it can inject what ThemeProvider provides.',
    },
    {
      title: 'App-level provide, Symbol keys and overriding providers',
      scenario: 'Provide an app-wide config with app.provide, use a Symbol key for a "locale" value, and override the locale for one section of the page.',
      steps: [
        'Create const LocaleKey = Symbol("locale") in a shared keys file',
        'app.provide("config", { currency: "INR" }) and app.provide(LocaleKey, "en-IN")',
        'A PriceTag component injects both and formats a price with Intl.NumberFormat',
        'A LocaleSection component re-provides LocaleKey with a different locale for its subtree',
        'Compare the formatting inside and outside the section',
      ],
      code: `// keys.js
export const LocaleKey = Symbol('locale')

// main.js
import { LocaleKey } from './keys'
const app = createApp(App)
app.provide('config', { currency: 'INR' })
app.provide(LocaleKey, 'en-IN')

<!-- PriceTag.vue -->
<script setup>
import { inject, computed } from 'vue'
import { LocaleKey } from './keys'
const props = defineProps({ amount: Number })
const config = inject('config')
const locale = inject(LocaleKey, 'en-US')
const text = computed(() =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: config.currency }).format(props.amount))
</script>
<template><span class="price">{{ text }}</span></template>

<!-- LocaleSection.vue: overrides the locale for its children -->
<script setup>
import { provide } from 'vue'
import { LocaleKey } from './keys'
const props = defineProps({ locale: String })
provide(LocaleKey, props.locale)
</script>
<template><section><slot /></section></template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>App locale: <price-tag :amount="1234567.5"></price-tag></p>
  <locale-section locale="de-DE">
    <p>Inside de-DE section: <price-tag :amount="1234567.5"></price-tag></p>
  </locale-section>
  <locale-section locale="en-US">
    <p>Inside en-US section: <price-tag :amount="1234567.5"></price-tag></p>
  </locale-section>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
section { border-left: 4px solid #42b883; padding-left: 10px; margin: 8px 0; }
.price { font-weight: 700; color: #0f766e; }`,
        js: `const { createApp, inject, provide, computed } = Vue;

const LocaleKey = Symbol('locale');   // would be exported from keys.js

const app = createApp({});
app.provide('config', { currency: 'INR' });
app.provide(LocaleKey, 'en-IN');

app.component('PriceTag', {
  props: { amount: Number },
  setup(props) {
    const config = inject('config');
    const locale = inject(LocaleKey, 'en-US');
    const text = computed(() =>
      new Intl.NumberFormat(locale, { style: 'currency', currency: config.currency }).format(props.amount));
    return { text, locale };
  },
  template: '<span class="price" :title="locale">{{ text }}</span>'
});

app.component('LocaleSection', {
  props: { locale: String },
  setup(props) {
    provide(LocaleKey, props.locale);
  },
  template: '<section><slot></slot></section>'
});

app.mount('#app');`,
      },
      result: 'App locale: ₹12,34,567.50 (Indian grouping). de-DE section: 1.234.567,50 ₹. en-US section: ₹1,234,567.50.',
      explanation:
        'app.provide makes values available to all components. inject finds the nearest provider up the tree, so LocaleSection overrides the Symbol key for its own subtree only. The Symbol guarantees no other library can accidentally use or overwrite the same key.',
    },
  ],
  interview: [
    {
      q: 'What is prop drilling and how does provide/inject help?',
      a: 'Prop drilling is passing props through intermediate components that do not need them, just to reach a deep descendant. With provide/inject an ancestor provides a value once and any descendant injects it directly, regardless of depth.',
      level: 'Easy',
    },
    {
      q: 'Is provided data reactive?',
      a: 'Only if you provide a reactive source (ref, reactive, computed). provide("count", count) is reactive; provide("count", count.value) provides a static snapshot. Injectors receive the same ref/proxy and stay in sync.',
      level: 'Medium',
    },
    {
      q: 'Where should mutations of provided state happen?',
      a: 'Preferably inside the provider. Provide the state (often wrapped with readonly) plus functions that update it. This keeps the data flow traceable, like one-way props.',
      level: 'Medium',
    },
    {
      q: 'What happens if inject() is called for a key that no ancestor provides?',
      a: 'It returns the default value if one is given; otherwise it returns undefined and Vue logs a warning in development ("injection not found").',
      level: 'Easy',
    },
    {
      q: 'Why use Symbols as injection keys?',
      a: 'To avoid name collisions between different parts of a large app or between libraries. A Symbol is unique, so only code that imports it can provide or inject that value. In TypeScript, InjectionKey<T> also adds type safety.',
      level: 'Medium',
    },
    {
      q: 'What is app.provide used for?',
      a: 'Providing values at the application level so every component can inject them, for example configuration, API clients or i18n. Plugins like Vue Router and Pinia use it internally.',
      level: 'Easy',
    },
    {
      q: 'Can a component inject a value provided by a sibling?',
      a: 'No. inject only looks up the ancestor chain (parent, grandparent, ... app). Siblings must share state through a common ancestor or a store.',
      level: 'Medium',
    },
    {
      q: 'Where can provide() and inject() be called?',
      a: 'Synchronously inside setup() / <script setup> (or functions called from it such as composables), or with app.provide at app level. Not in event handlers or after an await. app.runWithContext() lets you inject outside components (e.g. in router guards).',
      level: 'Hard',
    },
    {
      q: 'Provide/inject vs Pinia: when to use which?',
      a: 'Provide/inject is ideal for state scoped to a subtree (themes, a form context, compound components like Tabs). Pinia is for global, app-wide state shared by unrelated components, with DevTools, actions, plugins and SSR support.',
      level: 'Medium',
    },
    {
      q: 'What happens when two ancestors provide the same key?',
      a: 'The closest ancestor wins. A nearer provide "shadows" the outer one for its own subtree, which enables overriding (e.g. a different locale or theme for one section).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a Tabs/Tab compound component: Tabs provides the active tab name and a select function; each Tab injects them, shows its title button, and renders its slot only when active.',
      hint: 'Tabs: provide("tabs", { active: readonly(active), select }). Tab: v-if="active === name".',
      solution: `<!-- AppTabs.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'
const props = defineProps({ initial: String })
const active = ref(props.initial)
const select = (name) => { active.value = name }
provide('tabs', { active: readonly(active), select })
</script>
<template><div class="tabs"><slot /></div></template>

<!-- AppTab.vue -->
<script setup>
import { inject } from 'vue'
defineProps({ name: String })
const { active, select } = inject('tabs')
</script>
<template>
  <button :class="{ on: active === name }" @click="select(name)">{{ name }}</button>
  <div v-if="active === name"><slot /></div>
</template>

<!-- Usage -->
<AppTabs initial="Home">
  <AppTab name="Home">Welcome!</AppTab>
  <AppTab name="About">About us</AppTab>
</AppTabs>`,
    },
    {
      task: 'Provide a notification service from App (an array of messages and a notify(msg) function). A deeply nested SaveButton calls notify("Saved!") and a Toasts component lists messages, removing each after 3 seconds.',
      hint: 'provide("notify", notify); toasts uses readonly(messages).',
      solution: `<!-- App.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'
const messages = ref([])
let id = 0
function notify(text) {
  const msg = { id: id++, text }
  messages.value.push(msg)
  setTimeout(() => { messages.value = messages.value.filter(m => m.id !== msg.id) }, 3000)
}
provide('notify', notify)
provide('messages', readonly(messages))
</script>

<!-- SaveButton.vue (any depth) -->
<script setup>
import { inject } from 'vue'
const notify = inject('notify')
</script>
<template><button @click="notify('Saved!')">Save</button></template>

<!-- Toasts.vue -->
<script setup>
import { inject } from 'vue'
const messages = inject('messages')
</script>
<template><div class="toasts"><p v-for="m in messages" :key="m.id">{{ m.text }}</p></div></template>`,
    },
    {
      task: 'Create a useTheme() helper that injects the theme with a safe default and throws a clear error if called without a ThemeProvider in strict mode.',
      hint: 'const ctx = inject(ThemeKey, null); if (!ctx) throw new Error(...).',
      solution: `// theme.js
import { inject, provide, ref, readonly } from 'vue'
export const ThemeKey = Symbol('theme')

export function provideTheme() {
  const theme = ref('light')
  const toggle = () => { theme.value = theme.value === 'light' ? 'dark' : 'light' }
  provide(ThemeKey, { theme: readonly(theme), toggle })
}

export function useTheme() {
  const ctx = inject(ThemeKey, null)
  if (!ctx) throw new Error('useTheme() must be used inside a component wrapped by a ThemeProvider')
  return ctx
}`,
    },
    {
      task: 'Build a Form/FormField pair: the Form provides a "disabled" ref and a registerField function; each FormField injects them, disables its input when the form is disabled and registers its name.',
      hint: 'Fields call registerField(props.name) in setup.',
      solution: `<!-- AppForm.vue -->
<script setup>
import { ref, provide, reactive } from 'vue'
const props = defineProps({ disabled: Boolean })
const fields = reactive([])
const disabled = ref(props.disabled)
provide('form', { disabled, registerField: (name) => fields.push(name) })
</script>
<template>
  <form @submit.prevent>
    <slot />
    <label><input type="checkbox" v-model="disabled"> Disable form</label>
    <p>Registered fields: {{ fields.join(', ') }}</p>
  </form>
</template>

<!-- FormField.vue -->
<script setup>
import { inject } from 'vue'
const props = defineProps({ name: String, label: String })
const { disabled, registerField } = inject('form')
registerField(props.name)
</script>
<template><label>{{ label }} <input :name="name" :disabled="disabled"></label></template>`,
    },
  ],
  quiz: [
    {
      question: 'Which components can inject a value provided by component A?',
      options: ['Only A\'s direct children', 'Any descendant of A', 'Any component in the app', 'A\'s siblings'],
      answer: 1,
      explanation: 'Injection looks up the ancestor chain, so all descendants of A can inject.',
    },
    {
      question: 'Which call keeps the injected value reactive?',
      options: ["provide('count', count)", "provide('count', count.value)", "provide('count', +count.value)", "provide('count', String(count.value))"],
      answer: 0,
      explanation: 'Provide the ref itself, not its current value.',
    },
    {
      question: 'What is returned by inject("x", 42) if no ancestor provided "x"?',
      options: ['undefined', 'null', 'An error is thrown', '42'],
      answer: 3,
      explanation: 'The default value is returned.',
    },
    {
      question: 'Why wrap provided state in readonly()?',
      options: ['For performance', 'To make it reactive', 'So injectors cannot mutate it directly', 'It is required by Vue'],
      answer: 2,
      explanation: 'Mutations should go through provided functions.',
    },
    {
      question: 'Which is the best tool for a shopping cart used by unrelated pages across the app?',
      options: ['Props', 'A Pinia store', 'A scoped slot', 'v-model'],
      answer: 1,
      explanation: 'Global app state belongs in a store; provide/inject suits subtree-scoped state.',
    },
  ],
};
