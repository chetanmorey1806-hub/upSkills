export default {
  id: 'day-05-class-style-bindings',
  title: 'Class and Style Bindings',
  module: 'Module 1: Vue Basics',
  day: 5,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Change the look of elements based on state. Learn Vue\'s enhanced :class and :style bindings with object and array syntax, combining static and dynamic classes, computed class objects, CSS variables with v-bind() in <style>, and how classes pass to child components.',
  objectives: [
    'Toggle classes with the object syntax :class="{ active: isActive }"',
    'Apply lists of classes with the array syntax and mix it with objects',
    'Bind inline styles with :style objects, arrays and automatic prefixing',
    'Move complex class logic into computed properties',
    'Use v-bind() inside <style scoped> for state-driven CSS variables',
  ],
  theory: [
    {
      heading: 'Why special class and style bindings?',
      content:
        '`class` and `style` are attributes, so you could bind them with plain v-bind strings: `:class="isActive ? \'btn active\' : \'btn\'"`. That quickly becomes messy and error-prone (missing spaces, many ternaries).\n\nVue therefore gives `:class` and `:style` special **enhancements**: besides strings, they accept **objects** and **arrays**.\n\nAnalogy: think of classes as switches on a light panel. Instead of building the label text "kitchen-on hall-off" yourself, you just tell Vue which switches should be on: `{ kitchen: true, hall: false }`.',
    },
    {
      heading: ':class object syntax',
      content:
        'Pass an object where each **key is a class name** and each **value is a condition**. A class is added when its value is truthy.\n\n- `<div :class="{ active: isActive, \'text-danger\': hasError }">` (class names with hyphens must be quoted)\n- A static `class` and a dynamic `:class` can live on the same element; Vue merges them: `<div class="card" :class="{ selected: isSelected }">`\n- The object does not have to be inline: bind a reactive object or, better, a **computed** that returns the object. This keeps templates clean when logic grows.',
      syntax: `<button class="btn" :class="{ active: isActive, 'btn-disabled': !enabled }">
  Save
</button>

<!-- with a computed -->
<div :class="alertClasses">...</div>
// const alertClasses = computed(() => ({
//   alert: true,
//   'alert-error': type.value === 'error',
//   'alert-success': type.value === 'success'
// }))`,
    },
    {
      heading: ':class array syntax and mixing',
      content:
        'Pass an **array** to apply a list of classes: `:class="[sizeClass, colorClass]"`, where each item is a class name (string) from state.\n\n- Conditional item with a ternary: `:class="[isActive ? \'active\' : \'\', \'btn\']"`\n- Objects inside arrays (cleaner): `:class="[\'btn\', { active: isActive }, sizeClass]"`\n- Falsy items (`\'\'`, `null`, `undefined`, `false`) are simply ignored.\n\n**Classes on components**: when you add `class` or `:class` to a component that has a single root element, those classes are **merged** onto the root element (attribute fallthrough). With multiple root elements, the child must decide where to put them via `$attrs.class` (Day 8).',
      syntax: `<div :class="['badge', 'badge-' + status, { pill: rounded }]"></div>`,
      tip: 'Common mistake: :class="active" means "apply the class whose name is in the variable active", not "apply class active". Use :class="{ active }" or :class="{ active: active }".',
    },
    {
      heading: ':style bindings',
      content:
        '`:style` accepts a **JavaScript object** of CSS properties.\n\n- Use **camelCase** keys (`fontSize`) or quoted kebab-case keys (`\'font-size\'`).\n- Values need units when CSS needs them: `{ width: progress + \'%\' }`.\n- An array merges several style objects: `:style="[baseStyles, overrideStyles]"`.\n- Vue **auto-prefixes** properties that need vendor prefixes in the current browser.\n- Multiple values: `{ display: [\'-webkit-box\', \'flex\'] }` uses the last one the browser supports.\n- CSS custom properties work too: `:style="{ \'--accent\': color }"`.\n\nPrefer classes for fixed designs (reusable, cacheable CSS) and `:style` for values that are truly dynamic (a width from data, a user-chosen color, a position from mouse coordinates).',
      syntax: `<div :style="{ color: textColor, fontSize: size + 'px' }">Text</div>
<div class="bar" :style="{ width: percent + '%' }"></div>
<div :style="[baseStyle, isWarning && warningStyle]"></div>`,
    },
    {
      heading: 'v-bind() in <style>: state-driven CSS variables',
      content:
        'In a single-file component you can reference component state **inside the CSS** with `v-bind()`. Vue converts it into a CSS custom property set on the component root and keeps it in sync reactively.\n\nThis is great for theming: the CSS stays in the `<style>` block, while the actual value comes from state. It works with `<style scoped>` too.\n\nScoped styles recap: `<style scoped>` adds a unique `data-v-xxxx` attribute to the component\'s elements and rewrites selectors, so styles do not leak into other components. `:deep(.child)` targets elements inside child components.',
      syntax: `<script setup>
import { ref } from 'vue'
const theme = ref({ color: '#42b883', radius: 8 })
</script>

<template><button class="themed">Click</button></template>

<style scoped>
.themed {
  background: v-bind('theme.color');
  border-radius: v-bind('theme.radius + "px"');
}
</style>`,
      tip: 'In the playground (no SFC compiler) you can get the same effect with :style="{ \'--accent\': color }" and use var(--accent) in CSS.',
    },
  ],
  examples: [
    {
      title: 'Navigation tabs with :class object syntax',
      scenario: 'A tab bar highlights the active tab and greys out a disabled tab.',
      steps: [
        'Create tabs array and activeTab ref',
        'Render tabs with v-for, a static class="tab" and a dynamic :class object',
        'Add active when tab.id === activeTab and disabled when tab.disabled',
        'Ignore clicks on disabled tabs',
        'Click tabs to watch classes switch',
      ],
      code: `<script setup>
import { ref } from 'vue'
const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'courses', label: 'Courses' },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'profile', label: 'Profile' },
]
const activeTab = ref('home')
function select(tab) {
  if (!tab.disabled) activeTab.value = tab.id
}
</script>

<template>
  <nav>
    <button v-for="tab in tabs" :key="tab.id"
      class="tab"
      :class="{ active: tab.id === activeTab, disabled: tab.disabled }"
      @click="select(tab)">
      {{ tab.label }}
    </button>
  </nav>
  <p>Showing: {{ activeTab }}</p>
</template>

<style scoped>
.tab { padding: 8px 14px; border: 0; background: none; border-bottom: 3px solid transparent; }
.tab.active { border-color: #42b883; color: #42b883; font-weight: 600; }
.tab.disabled { opacity: .4; cursor: not-allowed; }
</style>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <nav>
    <button v-for="tab in tabs" :key="tab.id"
      class="tab"
      :class="{ active: tab.id === activeTab, disabled: tab.disabled }"
      @click="select(tab)">
      {{ tab.label }}
    </button>
  </nav>
  <p>Showing: <strong>{{ activeTab }}</strong></p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
nav { border-bottom: 1px solid #ddd; }
.tab { padding: 8px 14px; border: 0; background: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 15px; }
.tab.active { border-color: #42b883; color: #42b883; font-weight: 600; }
.tab.disabled { opacity: .4; cursor: not-allowed; }`,
        js: `const { createApp, ref } = Vue;

createApp({
  setup() {
    const tabs = [
      { id: 'home', label: 'Home' },
      { id: 'courses', label: 'Courses' },
      { id: 'billing', label: 'Billing', disabled: true },
      { id: 'profile', label: 'Profile' },
    ];
    const activeTab = ref('home');
    function select(tab) { if (!tab.disabled) activeTab.value = tab.id; }
    return { tabs, activeTab, select };
  }
}).mount('#app');`,
      },
      result: 'Home is underlined in green. Clicking Courses moves the highlight; Billing is faded and cannot be selected.',
      explanation:
        'Vue merges the static class "tab" with the dynamic object. Each key of the object is added only when its value is truthy, so each button gets "tab", "tab active" or "tab disabled".',
    },
    {
      title: 'Alert component with computed class object and array syntax',
      scenario: 'A reusable alert changes color by type (success, error, warning), can be dismissible and has a size.',
      steps: [
        'Register an AppAlert component with type, size and dismissible props',
        'Create a computed classes array: base class, type class, size class and an object for dismissible',
        'Use the component three times with different props',
        'Add a class on the component usage and see it merged onto the root',
      ],
      code: `<!-- AppAlert.vue -->
<script setup>
import { computed } from 'vue'
const props = defineProps({
  type: { type: String, default: 'info' },
  size: { type: String, default: 'md' },
  dismissible: Boolean,
})
const classes = computed(() => [
  'alert',
  'alert-' + props.type,
  props.size === 'sm' ? 'alert-sm' : '',
  { 'alert-dismissible': props.dismissible },
])
</script>

<template>
  <div :class="classes"><slot /></div>
</template>

<!-- Usage in App.vue -->
<AppAlert type="success">Saved!</AppAlert>
<AppAlert type="error" dismissible class="shadow">Payment failed</AppAlert>
<AppAlert type="warning" size="sm">Low balance</AppAlert>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <app-alert type="success">Saved successfully!</app-alert>
  <app-alert type="error" dismissible class="shadow">Payment failed</app-alert>
  <app-alert type="warning" size="sm">Low balance</app-alert>
  <p>Rendered classes of the error alert: <code>{{ errorClasses }}</code></p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; border-left: 5px solid; }
.alert-success { background: #dcfce7; border-color: #16a34a; }
.alert-error { background: #fee2e2; border-color: #dc2626; }
.alert-warning { background: #fef9c3; border-color: #ca8a04; }
.alert-sm { padding: 6px 10px; font-size: 13px; }
.alert-dismissible::after { content: ' ✕'; float: right; cursor: pointer; }
.shadow { box-shadow: 0 4px 10px rgba(0,0,0,.15); }`,
        js: `const { createApp, computed, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const errorClasses = ref('');
    onMounted(() => {
      errorClasses.value = document.querySelectorAll('.alert')[1].className;
    });
    return { errorClasses };
  }
});

app.component('AppAlert', {
  props: {
    type: { type: String, default: 'info' },
    size: { type: String, default: 'md' },
    dismissible: Boolean,
  },
  setup(props) {
    const classes = computed(() => [
      'alert',
      'alert-' + props.type,
      props.size === 'sm' ? 'alert-sm' : '',
      { 'alert-dismissible': props.dismissible },
    ]);
    return { classes };
  },
  template: '<div :class="classes"><slot></slot></div>'
});

app.mount('#app');`,
      },
      result: 'Three alerts: green, red with a shadow and an ✕, and a small yellow one. The text below shows the error alert\'s classes: "alert alert-error alert-dismissible shadow".',
      explanation:
        'The computed returns an array mixing strings and an object; empty strings are ignored. The "shadow" class written on <app-alert> falls through and is merged with the root element\'s classes. Props and slots are covered in detail on Days 8 and 10.',
    },
    {
      title: 'Progress bar and color picker with :style',
      scenario: 'Upload progress shows a bar whose width and color depend on the percentage, plus a text preview whose color and size the user picks.',
      steps: [
        'Create percent, color and size refs',
        'Bind the bar width with :style="{ width: percent + \'%\' }" and pick a background by range',
        'Bind a preview paragraph with color and fontSize (camelCase)',
        'Use an array of style objects for base + override styles',
        'Move the sliders and see styles update',
      ],
      code: `<script setup>
import { ref, computed } from 'vue'
const percent = ref(35)
const color = ref('#7c3aed')
const size = ref(18)

const barStyle = computed(() => ({
  width: percent.value + '%',
  background: percent.value < 40 ? '#ef4444' : percent.value < 80 ? '#f59e0b' : '#22c55e',
}))
const base = { padding: '8px', borderRadius: '6px' }
</script>

<template>
  <input type="range" v-model.number="percent">
  <div class="track"><div class="bar" :style="barStyle">{{ percent }}%</div></div>

  <input type="color" v-model="color"> <input type="range" min="12" max="40" v-model.number="size">
  <p :style="[base, { color, fontSize: size + 'px', border: '2px solid ' + color }]">Preview text</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <label>Progress <input type="range" v-model.number="percent"></label>
  <div class="track"><div class="bar" :style="barStyle">{{ percent }}%</div></div>

  <p><label>Color <input type="color" v-model="color"></label>
  <label>Size <input type="range" min="12" max="40" v-model.number="size"></label></p>
  <p :style="[base, { color, fontSize: size + 'px', border: '2px solid ' + color }]">Preview text</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.track { background: #e5e7eb; border-radius: 999px; overflow: hidden; height: 26px; margin: 8px 0 16px; }
.bar { height: 100%; color: white; font-size: 13px; text-align: right; padding-right: 8px; box-sizing: border-box; line-height: 26px; transition: width .2s, background .2s; }`,
        js: `const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const percent = ref(35);
    const color = ref('#7c3aed');
    const size = ref(18);
    const barStyle = computed(() => ({
      width: percent.value + '%',
      background: percent.value < 40 ? '#ef4444' : percent.value < 80 ? '#f59e0b' : '#22c55e',
    }));
    const base = { padding: '8px', borderRadius: '6px' };
    return { percent, color, size, barStyle, base };
  }
}).mount('#app');`,
      },
      result: 'A red bar at 35%. Dragging it past 40 turns it orange, past 80 green. The preview text changes color, border color and size as you pick.',
      explanation:
        ':style takes an object of camelCase CSS properties; numbers need explicit units. The array form merges base and dynamic style objects (later objects win). { color } is shorthand for { color: color }.',
    },
    {
      title: 'Dark mode theme with CSS variables',
      scenario: 'Implement a theme switch where colors are CSS variables driven by state, the playground equivalent of v-bind() in <style>.',
      steps: [
        'Create a dark ref and an accent ref',
        'Compute a style object with --bg, --text and --accent custom properties',
        'Bind it on the root wrapper with :style',
        'Write the CSS with var(--bg) etc.',
        'Toggle dark mode and change the accent color',
      ],
      code: `<!-- ThemeCard.vue (SFC version using v-bind in CSS) -->
<script setup>
import { ref, computed } from 'vue'
const dark = ref(false)
const accent = ref('#42b883')
const bg = computed(() => (dark.value ? '#111827' : '#ffffff'))
const text = computed(() => (dark.value ? '#f9fafb' : '#111827'))
</script>

<template>
  <div class="card">
    <h2>Theme demo</h2>
    <button @click="dark = !dark">{{ dark ? 'Light' : 'Dark' }} mode</button>
    <input type="color" v-model="accent">
  </div>
</template>

<style scoped>
.card { background: v-bind(bg); color: v-bind(text); border: 3px solid v-bind(accent); }
button { background: v-bind(accent); }
</style>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="card" :class="{ dark }" :style="themeVars">
    <h2>Theme demo</h2>
    <p>The colours come from CSS variables bound with :style.</p>
    <button @click="dark = !dark">{{ dark ? 'Light' : 'Dark' }} mode</button>
    <label> Accent <input type="color" v-model="accent"></label>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { background: var(--bg); color: var(--text); border: 3px solid var(--accent); padding: 20px; border-radius: 12px; transition: background .3s, color .3s; }
.card h2 { color: var(--accent); margin-top: 0; }
.card button { background: var(--accent); color: white; border: 0; padding: 8px 14px; border-radius: 6px; cursor: pointer; }`,
        js: `const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const dark = ref(false);
    const accent = ref('#42b883');
    const themeVars = computed(() => ({
      '--bg': dark.value ? '#111827' : '#ffffff',
      '--text': dark.value ? '#f9fafb' : '#111827',
      '--accent': accent.value,
    }));
    return { dark, accent, themeVars };
  }
}).mount('#app');`,
      },
      result: 'A white card with a green border and heading. "Dark mode" switches to a dark background with light text; the color picker changes the border, heading and button color live.',
      explanation:
        'Setting custom properties via :style lets plain CSS stay in the stylesheet while values come from state. In an SFC, v-bind(accent) inside <style> compiles to exactly this: a hashed CSS variable set inline on the component root and updated reactively.',
    },
  ],
  interview: [
    {
      q: 'What syntaxes does :class support?',
      a: 'String (:class="cls"), object (:class="{ active: isActive }" where keys are class names and values are conditions), and array (:class="[a, b, { c: cond }]") which may contain strings and objects. It can coexist with a static class attribute, and Vue merges them.',
      level: 'Easy',
    },
    {
      q: 'How do you bind inline styles in Vue?',
      a: 'With :style and an object of CSS properties using camelCase or quoted kebab-case keys: :style="{ fontSize: size + \'px\' }". You can pass an array of objects to merge styles. Vue auto-prefixes vendor properties and supports CSS custom properties.',
      level: 'Easy',
    },
    {
      q: 'When should you prefer classes over inline styles?',
      a: 'Use classes for predefined visual states (active, error, disabled): they keep CSS in stylesheets, are reusable, support pseudo-classes and media queries, and are easier to maintain. Use :style for truly dynamic values computed at runtime (widths, positions, user-chosen colors).',
      level: 'Medium',
    },
    {
      q: 'What happens to a class added to a component tag?',
      a: 'If the component has a single root element, class and style are automatically merged with the root element\'s own class/style (attribute fallthrough). With multiple roots, Vue warns unless the component binds $attrs explicitly (v-bind="$attrs" or :class="$attrs.class").',
      level: 'Medium',
    },
    {
      q: 'What is v-bind() in <style>?',
      a: 'A feature of SFC style blocks that lets CSS values reference component state: color: v-bind(themeColor). The compiler turns it into a CSS custom property on the component root that updates reactively. Expressions with dots or operators must be quoted: v-bind(\'theme.color\').',
      level: 'Medium',
    },
    {
      q: 'What does <style scoped> do?',
      a: 'It adds a unique data-v-hash attribute to every element rendered by the component and rewrites the CSS selectors to include it, so styles apply only to this component (and the root element of child components). Use :deep() to style inside children and :slotted() for slot content.',
      level: 'Medium',
    },
    {
      q: 'Why move complex :class logic to a computed property?',
      a: 'It keeps the template readable, can be tested and reused, and benefits from caching. A computed returning an object/array is a common pattern for components with several visual variants.',
      level: 'Easy',
    },
    {
      q: 'What is the bug in :class="isActive"?',
      a: 'It applies the class whose NAME is the value of isActive (e.g. "true"), not a class called isActive. The intended form is :class="{ isActive }" or :class="{ active: isActive }".',
      level: 'Medium',
    },
    {
      q: 'How does Vue handle a style property with an array of values like { display: ["-webkit-box", "flex"] }?',
      a: 'Vue renders only the last value in the array that the browser supports, which helps with legacy vendor-prefixed values.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Build a to-do list where completed items get a "done" class (line-through, grey) and items marked important get an "important" class (red left border). Toggle done on click.',
      hint: ':class="{ done: t.done, important: t.important }".',
      solution: `<div id="app">
  <ul>
    <li v-for="t in todos" :key="t.id" :class="{ done: t.done, important: t.important }" @click="t.done = !t.done">
      {{ t.text }}
    </li>
  </ul>
</div>
<style>
.done { text-decoration: line-through; color: #999; }
.important { border-left: 4px solid red; padding-left: 6px; }
</style>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  const todos = ref([
    { id: 1, text: 'Pay bills', done: false, important: true },
    { id: 2, text: 'Learn :class', done: true, important: false },
  ]);
  return { todos };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Create a button component variant system: size (sm/md/lg) and variant (primary/outline) props mapped to classes using the array syntax.',
      hint: ':class="[\'btn\', \'btn-\' + size, \'btn-\' + variant]".',
      solution: `<!-- AppButton.vue -->
<script setup>
defineProps({
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'primary' },
})
</script>
<template>
  <button :class="['btn', 'btn-' + size, 'btn-' + variant]"><slot /></button>
</template>
<style scoped>
.btn { border-radius: 6px; cursor: pointer; }
.btn-sm { padding: 4px 8px; font-size: 12px; }
.btn-md { padding: 8px 14px; }
.btn-lg { padding: 12px 20px; font-size: 18px; }
.btn-primary { background: #42b883; color: #fff; border: 0; }
.btn-outline { background: none; color: #42b883; border: 2px solid #42b883; }
</style>`,
    },
    {
      task: 'Make a box that follows the mouse inside a container using :style with left/top from mousemove coordinates.',
      hint: '@mousemove on the container, use event.offsetX/offsetY, position: relative/absolute.',
      solution: `<div id="app">
  <div class="area" @mousemove="move">
    <div class="dot" :style="{ left: x + 'px', top: y + 'px' }"></div>
  </div>
</div>
<style>
.area { position: relative; height: 200px; background: #f1f5f9; }
.dot { position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #42b883; transform: translate(-50%, -50%); pointer-events: none; }
</style>
<script>
const { createApp, ref } = Vue;
createApp({ setup() {
  const x = ref(50), y = ref(50);
  function move(e) { x.value = e.offsetX; y.value = e.offsetY; }
  return { x, y, move };
}}).mount('#app');
</script>`,
    },
    {
      task: 'Show a password strength meter: a bar whose width is 33/66/100% and color red/orange/green based on a computed strength level.',
      hint: 'Compute a level 1-3, then a style object from it.',
      solution: `<script setup>
import { ref, computed } from 'vue'
const pwd = ref('')
const level = computed(() => {
  let l = 0
  if (pwd.value.length >= 6) l++
  if (/[0-9]/.test(pwd.value)) l++
  if (/[^A-Za-z0-9]/.test(pwd.value)) l++
  return l
})
const meter = computed(() => ({
  width: (level.value / 3) * 100 + '%',
  background: ['#ddd', '#ef4444', '#f59e0b', '#22c55e'][level.value],
  height: '8px',
}))
</script>
<template>
  <input type="password" v-model="pwd">
  <div style="background:#eee"><div :style="meter"></div></div>
</template>`,
    },
  ],
  quiz: [
    {
      question: 'Which binding adds class "active" only when isActive is true?',
      options: [':class="isActive"', ':class="{ active: isActive }"', 'class="{{ isActive }}"', ':class="[isActive]"'],
      answer: 1,
      explanation: 'Object syntax: key = class name, value = condition.',
    },
    {
      question: 'What happens with class="card" :class="{ selected: true }" on the same element?',
      options: ['Error: duplicate attribute', 'Only "selected" is applied', 'Only "card" is applied', 'Both are merged: "card selected"'],
      answer: 3,
      explanation: 'Vue merges static and dynamic classes.',
    },
    {
      question: 'Which :style key is correct for font size?',
      options: ['fontSize', 'font_size', 'FontSize()', 'size-font'],
      answer: 0,
      explanation: 'Use camelCase (fontSize) or a quoted kebab-case key (\'font-size\').',
    },
    {
      question: 'In :class="[\'btn\', \'\', null, { big: false }]", which classes are applied?',
      options: ['btn big', 'btn null', 'btn', 'none'],
      answer: 2,
      explanation: 'Falsy items and false object values are ignored.',
    },
    {
      question: 'Which SFC feature binds component state into CSS?',
      options: ['@apply', 'v-bind() inside <style>', ':style in <style>', 'scss variables'],
      answer: 1,
      explanation: 'v-bind(expr) in <style> becomes a reactive CSS custom property.',
    },
  ],
};
