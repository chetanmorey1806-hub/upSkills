export default {
  id: 'day-10-slots-default-named-scoped',
  title: 'Slots: default, named, scoped',
  module: 'Module 2: Components',
  day: 10,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Props pass data; slots pass template content. Learn the default slot with fallback content, named slots with v-slot / #, render scope rules, conditional slots with $slots, dynamic slot names and scoped slots that let the child hand data back to the parent\'s template, the basis of renderless and highly reusable components.',
  objectives: [
    'Pass markup into a component through the default slot and give fallback content',
    'Build layouts with named slots using v-slot:name and the # shorthand',
    'Explain render scope: what data slot content can access',
    'Use scoped slots to let the parent customise how child data is rendered',
    'Render optional wrappers conditionally with $slots / useSlots()',
  ],
  theory: [
    {
      heading: 'What is a slot?',
      content:
        'Props let a parent pass **values** to a child. But sometimes the parent wants to pass **markup**: a button label with an icon, the body of a card, the rows of a table. A **slot** is a placeholder in the child\'s template that the parent fills with its own content.\n\n- In the child: `<slot></slot>` marks where content goes (the **slot outlet**).\n- In the parent: anything between the component\'s opening and closing tags is the **slot content**.\n\nAnalogy: a photo frame. The frame (component) decides the border, size and style; you decide which photo (slot content) goes inside.\n\nSlot content can be anything: text, HTML elements, other components.',
      syntax: `<!-- FancyButton.vue -->
<template>
  <button class="fancy-btn">
    <slot></slot>        <!-- slot outlet -->
  </button>
</template>

<!-- Parent -->
<FancyButton>
  <span>💾</span> Save changes   <!-- slot content -->
</FancyButton>`,
    },
    {
      heading: 'Fallback content and render scope',
      content:
        '**Fallback content**: put default content inside `<slot>`; it renders only when the parent provides nothing.\n\n`<button><slot>Submit</slot></button>` renders "Submit" for `<SubmitButton />` but "Save" for `<SubmitButton>Save</SubmitButton>`.\n\n**Render scope** (important!): slot content is compiled in the **parent\'s** scope. It can access the parent\'s data, but **not** the child\'s data.\n\nRule: *everything in the parent template is compiled in parent scope; everything in the child template is compiled in child scope.*\n\nSo in `<FancyButton>{{ message }}</FancyButton>`, `message` comes from the parent. If the child wants to share its data with the slot content, it must use a **scoped slot** (below).',
      tip: 'Common confusion: trying to read a child\'s internal variable inside slot content. It will be undefined unless the child exposes it through slot props.',
    },
    {
      heading: 'Named slots',
      content:
        'A component can have several slot outlets, each with a `name` attribute. An outlet without a name is the `default` slot.\n\nIn the parent, target a named slot with a `<template>` element and the `v-slot:name` directive, or its shorthand `#name`.\n\n- Content not wrapped in a `<template #...>` goes to the default slot (you may also write `<template #default>`).\n- **Dynamic slot names**: `<template #[slotName]>`\n- Conditional slots: in the child, `$slots.footer` (template) or `useSlots().footer` (script) tells whether the parent provided that slot, so you can avoid rendering an empty footer wrapper: `<footer v-if="$slots.footer"><slot name="footer" /></footer>`.\n\nTypical use: layout components (header/sidebar/main/footer), cards (title/body/actions), modals (header/body/footer).',
      syntax: `<!-- BaseLayout.vue -->
<div class="layout">
  <header><slot name="header"></slot></header>
  <main><slot></slot></main>
  <footer v-if="$slots.footer"><slot name="footer"></slot></footer>
</div>

<!-- Parent -->
<BaseLayout>
  <template #header><h1>Dashboard</h1></template>
  <p>Main content goes to the default slot.</p>
  <template #footer>© 2026</template>
</BaseLayout>`,
    },
    {
      heading: 'Scoped slots: child data for parent markup',
      content:
        'A **scoped slot** lets the child **pass data to the slot content**. The child binds attributes on the `<slot>` element (**slot props**), and the parent receives them through `v-slot`:\n\n- Child: `<slot :item="item" :index="i"></slot>`\n- Parent (default slot): `<MyList v-slot="{ item, index }">...</MyList>`\n- Parent (named slot): `<template #row="{ item }">...</template>`\n\nThink of a scoped slot as a **function** the parent passes to the child: the child calls it with arguments (slot props) and gets back markup to render. That is exactly how Vue compiles it.\n\nWhy use them? The child owns **logic** (fetching, filtering, pagination, looping, keyboard handling) while the parent controls **presentation**. Examples: a data table where the parent decides how each cell looks, a list with custom item templates, a "mouse tracker" that provides x/y.\n\nWhen mixing a scoped default slot with named slots, use an explicit `<template #default="{ ... }">` for the default.',
      syntax: `<!-- FancyList.vue -->
<ul>
  <li v-for="(item, i) in items" :key="item.id">
    <slot name="item" :item="item" :index="i">{{ item.name }}</slot>
  </li>
</ul>

<!-- Parent -->
<FancyList :items="users">
  <template #item="{ item, index }">
    {{ index + 1 }}. <b>{{ item.name }}</b> ({{ item.role }})
  </template>
</FancyList>`,
    },
    {
      heading: 'Renderless components and when to use slots vs props',
      content:
        'A **renderless component** has no markup of its own; it only provides logic and exposes it through a scoped slot: `<slot :x="x" :y="y" />`. In Vue 3 most such logic is better written as a **composable** (Day 14), which avoids an extra component instance, but scoped slots remain useful when logic and markup are combined (e.g. table libraries, virtual lists, headless UI kits).\n\n**Props vs slots**:\n\n- Use **props** for data and simple configuration (title text, size, variant, items array).\n- Use **slots** when the parent needs to control markup: rich content, icons, custom layouts, item templates.\n- Many real components use both: `<DataTable :rows="rows">` + `<template #cell-status="{ row }">`.',
      points: [
        'Shorthands: v-slot → #, v-slot:default → #default',
        'v-slot can only be used on a component or <template>',
        'Slot content of the default slot can be passed without a <template> if there are no named slots',
      ],
    },
  ],
  examples: [
    {
      title: 'Default slot with fallback: a reusable button and alert box',
      scenario: 'A design system needs a button whose label and icon come from the parent, and an alert that shows a default message if nothing is passed.',
      steps: [
        'Create BaseButton with <slot>Click me</slot> as fallback',
        'Create AlertBox with a type prop and a default slot with fallback text',
        'Use BaseButton with no content, with text, and with an icon + text',
        'Use AlertBox with rich HTML content and with no content',
        'Notice the slot content uses the parent\'s data (user name)',
      ],
      code: `<!-- BaseButton.vue -->
<template>
  <button class="btn"><slot>Click me</slot></button>
</template>

<!-- AlertBox.vue -->
<script setup>
defineProps({ type: { type: String, default: 'info' } })
</script>
<template>
  <div class="alert" :class="type">
    <strong>{{ type.toUpperCase() }}:</strong>
    <slot>Something happened.</slot>
  </div>
</template>

<!-- Parent -->
<script setup>
import { ref } from 'vue'
const user = ref('Asha')
</script>
<template>
  <BaseButton />
  <BaseButton>Save</BaseButton>
  <BaseButton>🗑️ <em>Delete</em></BaseButton>
  <AlertBox type="success">Welcome back, <b>{{ user }}</b>!</AlertBox>
  <AlertBox type="error" />
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <base-button></base-button>
  <base-button>Save</base-button>
  <base-button>🗑️ <em>Delete</em></base-button>
  <alert-box type="success">Welcome back, <b>{{ user }}</b>! (slot content uses parent data)</alert-box>
  <alert-box type="error"></alert-box>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.btn { padding: 8px 14px; margin: 0 6px 12px 0; border-radius: 6px; border: 0; background: #42b883; color: #fff; cursor: pointer; }
.alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; }
.alert.success { background: #dcfce7; }
.alert.error { background: #fee2e2; }`,
        js: `const { createApp, ref } = Vue;

const app = createApp({
  setup() {
    return { user: ref('Asha') };
  }
});

app.component('BaseButton', {
  template: '<button class="btn"><slot>Click me</slot></button>'
});

app.component('AlertBox', {
  props: { type: { type: String, default: 'info' } },
  template: \`
    <div class="alert" :class="type">
      <strong>{{ type.toUpperCase() }}:</strong>
      <slot>Something happened.</slot>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'Buttons: "Click me" (fallback), "Save", "🗑️ Delete" (italic). A green alert "SUCCESS: Welcome back, Asha! ..." and a red alert "ERROR: Something happened." (fallback).',
      explanation:
        '<slot> is replaced by whatever the parent puts between the tags; when empty, the fallback inside <slot> renders. The {{ user }} inside the slot content is resolved in the parent\'s scope, while {{ type }} inside AlertBox\'s own template comes from the child\'s prop.',
    },
    {
      title: 'Named slots: card and page layout',
      scenario: 'Build a Card component with header, default body and optional footer slots; the footer wrapper should not render when no footer is passed.',
      steps: [
        'Create AppCard with <slot name="header">, a default <slot> and <slot name="footer">',
        'Wrap the footer in <footer v-if="$slots.footer">',
        'In the parent use <template #header> and <template #footer>',
        'Render a second card without footer and check there is no empty footer bar',
        'Use a dynamic slot name to choose where a badge goes',
      ],
      code: `<!-- AppCard.vue -->
<template>
  <section class="card">
    <header><slot name="header">Untitled</slot></header>
    <div class="body"><slot /></div>
    <footer v-if="$slots.footer"><slot name="footer" /></footer>
  </section>
</template>

<!-- Parent -->
<AppCard>
  <template #header>📊 Monthly Report</template>
  <p>Revenue grew by 12% this month.</p>
  <template #footer><button>Download PDF</button></template>
</AppCard>

<AppCard>
  <template #header>📝 Notes</template>
  No footer here, so no empty footer bar.
</AppCard>

<AppCard>
  <template #[badgeSlot]><span class="badge">NEW</span></template>
</AppCard>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <app-card>
    <template #header>📊 Monthly Report</template>
    <p>Revenue grew by 12% this month.</p>
    <template #footer><button>Download PDF</button></template>
  </app-card>

  <app-card>
    <template #header>📝 Notes</template>
    No footer here, so no empty footer bar.
  </app-card>

  <p>Dynamic slot name:
    <select v-model="where"><option>header</option><option>default</option><option>footer</option></select></p>
  <app-card>
    <template #[where]><span class="badge">NEW (in {{ where }})</span></template>
  </app-card>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { border: 1px solid #ddd; border-radius: 10px; margin-bottom: 14px; overflow: hidden; max-width: 380px; }
.card header { background: #f1f5f9; padding: 8px 12px; font-weight: 600; }
.card .body { padding: 12px; min-height: 20px; }
.card footer { border-top: 1px solid #eee; padding: 8px 12px; background: #fafafa; }
.badge { background: #ef4444; color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 12px; }`,
        js: `const { createApp, ref } = Vue;

const app = createApp({
  setup() {
    return { where: ref('header') };
  }
});

app.component('AppCard', {
  template: \`
    <section class="card">
      <header><slot name="header">Untitled</slot></header>
      <div class="body"><slot></slot></div>
      <footer v-if="$slots.footer"><slot name="footer"></slot></footer>
    </section>\`
});

app.mount('#app');`,
      },
      result: 'Card 1 has header, body and a footer with a button. Card 2 has no footer bar at all. Card 3 shows the NEW badge in the slot selected in the dropdown; when it is not in the header, the header shows the fallback "Untitled".',
      explanation:
        '#header is shorthand for v-slot:header. Content outside any <template #...> goes to the default slot. $slots.footer is undefined when the parent passes no footer, so v-if removes the wrapper. #[badgeSlot] is a dynamic slot name evaluated from parent state. In the playground\'s in-DOM HTML the variable is called where, because browsers lowercase attribute names, so #[badgeSlot] would look for badgeslot.',
    },
    {
      title: 'Scoped slots: a reusable list where the parent controls item markup',
      scenario: 'A UserList component handles searching and looping; different pages want to display each user differently.',
      steps: [
        'Create UserList with an items prop, a search input and a computed filtered list',
        'Inside v-for, render <slot name="item" :user="u" :index="i"> with fallback {{ u.name }}',
        'Expose the result count through a scoped "empty" and "summary" slot',
        'In the parent, use the list twice: once with the fallback, once with a custom #item template',
        'Destructure slot props: #item="{ user, index }"',
      ],
      code: `<!-- UserList.vue -->
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ items: { type: Array, required: true } })
const q = ref('')
const filtered = computed(() =>
  props.items.filter(u => u.name.toLowerCase().includes(q.value.toLowerCase())))
</script>

<template>
  <input v-model="q" placeholder="Search...">
  <ul>
    <li v-for="(u, i) in filtered" :key="u.id">
      <slot name="item" :user="u" :index="i">{{ u.name }}</slot>
    </li>
  </ul>
  <slot name="summary" :count="filtered.length" :total="items.length" />
</template>

<!-- Parent -->
<UserList :items="users" />

<UserList :items="users">
  <template #item="{ user, index }">
    {{ index + 1 }}. <b>{{ user.name }}</b>
    <span :class="user.role">{{ user.role }}</span>
  </template>
  <template #summary="{ count, total }">Showing {{ count }} of {{ total }}</template>
</UserList>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <div class="cols">
    <div>
      <h4>Fallback rendering</h4>
      <user-list :items="users"></user-list>
    </div>
    <div>
      <h4>Custom scoped slot</h4>
      <user-list :items="users">
        <template #item="{ user, index }">
          {{ index + 1 }}. <b>{{ user.name }}</b> <span class="role" :class="user.role">{{ user.role }}</span>
        </template>
        <template #summary="{ count, total }"><small>Showing {{ count }} of {{ total }} users</small></template>
      </user-list>
    </div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.cols { display: flex; gap: 30px; flex-wrap: wrap; }
ul { padding-left: 0; list-style: none; }
li { padding: 4px 0; }
.role { font-size: 11px; padding: 1px 6px; border-radius: 4px; background: #e5e7eb; }
.role.admin { background: #fde68a; }
.role.editor { background: #bfdbfe; }`,
        js: `const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const users = ref([
      { id: 1, name: 'Asha', role: 'admin' },
      { id: 2, name: 'Ravi', role: 'editor' },
      { id: 3, name: 'Neha', role: 'viewer' },
      { id: 4, name: 'Arjun', role: 'editor' },
    ]);
    return { users };
  }
});

app.component('UserList', {
  props: { items: { type: Array, required: true } },
  setup(props) {
    const q = ref('');
    const filtered = computed(() =>
      props.items.filter(u => u.name.toLowerCase().includes(q.value.toLowerCase())));
    return { q, filtered };
  },
  template: \`
    <div>
      <input v-model="q" placeholder="Search...">
      <ul>
        <li v-for="(u, i) in filtered" :key="u.id">
          <slot name="item" :user="u" :index="i">{{ u.name }}</slot>
        </li>
      </ul>
      <slot name="summary" :count="filtered.length" :total="items.length"></slot>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'Left list shows plain names. Right list shows numbered bold names with coloured role badges and "Showing 4 of 4 users". Searching "a" in the right list updates its items and the summary. Each list keeps its own search state.',
      explanation:
        'The child owns the search and filtering logic and calls the slot for each item with slot props (user, index). The parent receives them by destructuring in #item="{ user, index }" and decides the markup. Without a provided slot, the fallback {{ u.name }} renders.',
    },
    {
      title: 'Data table with scoped cell slots and a renderless mouse tracker',
      scenario: 'A DataTable renders columns generically but lets the parent override any cell by slot name; a renderless MouseTracker provides coordinates through a scoped default slot.',
      steps: [
        'DataTable receives columns and rows props',
        'For each cell, render <slot :name="\'cell-\' + col.key" :row="row" :value="row[col.key]"> with the raw value as fallback',
        'In the parent, override only #cell-status and #cell-price',
        'Create MouseTracker that tracks x/y and renders only <slot :x="x" :y="y">',
        'Use it with v-slot="{ x, y }" on the component itself',
      ],
      code: `<!-- DataTable.vue -->
<script setup>
defineProps({ columns: Array, rows: Array })
</script>
<template>
  <table>
    <thead><tr><th v-for="c in columns" :key="c.key">{{ c.label }}</th></tr></thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td v-for="c in columns" :key="c.key">
          <slot :name="'cell-' + c.key" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<!-- Parent -->
<DataTable :columns="columns" :rows="orders">
  <template #cell-status="{ value }"><span :class="value">{{ value }}</span></template>
  <template #cell-price="{ value }">₹{{ value.toLocaleString('en-IN') }}</template>
</DataTable>

<!-- MouseTracker.vue (renderless) -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const x = ref(0), y = ref(0)
const move = (e) => { x.value = e.pageX; y.value = e.pageY }
onMounted(() => window.addEventListener('mousemove', move))
onUnmounted(() => window.removeEventListener('mousemove', move))
</script>
<template><slot :x="x" :y="y" /></template>

<!-- Usage -->
<MouseTracker v-slot="{ x, y }">Mouse at {{ x }}, {{ y }}</MouseTracker>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <data-table :columns="columns" :rows="orders">
    <template #cell-status="{ value }"><span class="pill" :class="value">{{ value }}</span></template>
    <template #cell-price="{ value }">₹{{ value.toLocaleString('en-IN') }}</template>
  </data-table>

  <mouse-tracker v-slot="{ x, y }">
    <p class="mouse">🖱️ Move the mouse: {{ x }}, {{ y }}</p>
  </mouse-tracker>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
table { border-collapse: collapse; width: 100%; max-width: 420px; }
th, td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
th { background: #f8fafc; }
.pill { padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; }
.pill.paid { background: #16a34a; } .pill.pending { background: #f59e0b; } .pill.failed { background: #dc2626; }
.mouse { margin-top: 16px; background: #eef2ff; padding: 8px; border-radius: 6px; }`,
        js: `const { createApp, ref, onMounted, onUnmounted } = Vue;

const app = createApp({
  setup() {
    const columns = [
      { key: 'id', label: '#' },
      { key: 'customer', label: 'Customer' },
      { key: 'price', label: 'Amount' },
      { key: 'status', label: 'Status' },
    ];
    const orders = [
      { id: 101, customer: 'Asha', price: 12500, status: 'paid' },
      { id: 102, customer: 'Ravi', price: 899, status: 'pending' },
      { id: 103, customer: 'Neha', price: 45999, status: 'failed' },
    ];
    return { columns, orders };
  }
});

app.component('DataTable', {
  props: { columns: Array, rows: Array },
  template: \`
    <table>
      <thead><tr><th v-for="c in columns" :key="c.key">{{ c.label }}</th></tr></thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="c in columns" :key="c.key">
            <slot :name="'cell-' + c.key" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>\`
});

app.component('MouseTracker', {
  setup() {
    const x = ref(0), y = ref(0);
    const move = (e) => { x.value = e.pageX; y.value = e.pageY; };
    onMounted(() => window.addEventListener('mousemove', move));
    onUnmounted(() => window.removeEventListener('mousemove', move));
    return { x, y };
  },
  template: '<slot :x="x" :y="y"></slot>'
});

app.mount('#app');`,
      },
      result: 'A table with # and Customer cells in plain text, the Amount column formatted as ₹12,500 etc., and Status shown as coloured pills. Below it, the mouse coordinates update as you move the mouse.',
      explanation:
        'Slot names can be dynamic in the child (:name="\'cell-\' + c.key"), so a generic table offers one overridable slot per column. Only overridden cells use the parent\'s template; the rest fall back to the raw value. MouseTracker renders nothing itself: it only provides data via slot props (renderless component). On Day 14 the same logic becomes a useMouse() composable.',
    },
  ],
  interview: [
    {
      q: 'What are slots in Vue?',
      a: 'Slots are placeholders in a child component\'s template (<slot>) that the parent fills with template content. They let parents pass markup (not just data) into components, enabling flexible, composable components like cards, layouts and modals.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between props and slots?',
      a: 'Props pass data values (strings, numbers, objects) to configure the child. Slots pass template fragments that the child renders at a given location. Use props for data/configuration, slots when the parent should control markup.',
      level: 'Easy',
    },
    {
      q: 'What is fallback content?',
      a: 'Content placed inside the <slot> element in the child. It renders only if the parent does not provide content for that slot.',
      level: 'Easy',
    },
    {
      q: 'What are named slots and how do you use them?',
      a: 'Slots with a name attribute (<slot name="header">). The parent targets them with <template v-slot:header> or the shorthand <template #header>. Content not wrapped in a named template goes to the default slot.',
      level: 'Easy',
    },
    {
      q: 'Can slot content access the child component\'s data?',
      a: 'Not directly. Slot content is compiled in the parent\'s scope, so it only sees parent data. To access child data, the child must expose it via slot props (scoped slots) and the parent receives it with v-slot="slotProps".',
      level: 'Medium',
    },
    {
      q: 'What is a scoped slot?',
      a: 'A slot where the child passes data to the slot content by binding attributes on <slot> (<slot :item="item">). The parent receives them via v-slot / #name="{ item }". Conceptually the slot is a function the child calls with arguments. It separates logic (child) from presentation (parent).',
      level: 'Medium',
    },
    {
      q: 'How do you check if a slot was provided?',
      a: 'In templates use $slots.name (e.g. v-if="$slots.footer"); in <script setup> use const slots = useSlots() and check slots.footer. This lets you avoid rendering empty wrapper elements.',
      level: 'Medium',
    },
    {
      q: 'What is a renderless component, and what replaced most of them in Vue 3?',
      a: 'A component that renders no markup of its own and exposes logic/state through a scoped slot (e.g. a mouse tracker, a fetch wrapper). In Vue 3, composables usually replace them because they reuse logic without the overhead of an extra component instance, though renderless components are still useful when logic and markup structure are tied together.',
      level: 'Hard',
    },
    {
      q: 'Can you use v-slot on a regular HTML element?',
      a: 'No. v-slot can only be used on a component tag (for its default slot) or on a <template> element inside a component.',
      level: 'Medium',
    },
    {
      q: 'How do you mix a scoped default slot with named slots?',
      a: 'Use an explicit <template #default="{ ... }"> for the default slot instead of putting v-slot on the component tag; otherwise the scope is ambiguous and Vue reports an error.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a Modal component with named slots header, default and footer, a fallback "Close" button in the footer, and a show prop. Use it for a delete confirmation.',
      hint: 'Fallback in footer: <slot name="footer"><button @click="$emit(\'close\')">Close</button></slot>.',
      solution: `<!-- AppModal.vue -->
<script setup>
defineProps({ show: Boolean })
defineEmits(['close'])
</script>
<template>
  <div v-if="show" class="backdrop" @click.self="$emit('close')">
    <div class="modal">
      <header><slot name="header">Notice</slot></header>
      <section><slot /></section>
      <footer><slot name="footer"><button @click="$emit('close')">Close</button></slot></footer>
    </div>
  </div>
</template>

<!-- Parent -->
<AppModal :show="open" @close="open = false">
  <template #header>Delete file?</template>
  This cannot be undone.
  <template #footer>
    <button @click="remove(); open = false">Delete</button>
    <button @click="open = false">Cancel</button>
  </template>
</AppModal>`,
    },
    {
      task: 'Build a Tabs component that receives a tabs array prop and exposes the active tab through a scoped default slot so the parent renders the tab body.',
      hint: '<slot :active="active" />; parent: v-slot="{ active }".',
      solution: `<!-- AppTabs.vue -->
<script setup>
import { ref } from 'vue'
const props = defineProps({ tabs: { type: Array, required: true } })
const active = ref(props.tabs[0])
</script>
<template>
  <nav><button v-for="t in tabs" :key="t" :class="{ on: t === active }" @click="active = t">{{ t }}</button></nav>
  <div class="panel"><slot :active="active" /></div>
</template>

<!-- Parent -->
<AppTabs :tabs="['Profile', 'Orders', 'Settings']" v-slot="{ active }">
  <ProfileForm v-if="active === 'Profile'" />
  <OrdersList v-else-if="active === 'Orders'" />
  <p v-else>Settings coming soon</p>
</AppTabs>`,
    },
    {
      task: 'Create a FetchData renderless component that receives a url prop, fetches JSON and exposes { data, loading, error } via a scoped slot. Use it to list users from https://jsonplaceholder.typicode.com/users.',
      hint: 'Use watchEffect or watch(() => props.url, ..., { immediate: true }).',
      solution: `<!-- FetchData.vue -->
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ url: { type: String, required: true } })
const data = ref(null), loading = ref(false), error = ref(null)
watch(() => props.url, async (url) => {
  loading.value = true; error.value = null
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    data.value = await res.json()
  } catch (e) { error.value = e.message } finally { loading.value = false }
}, { immediate: true })
</script>
<template><slot :data="data" :loading="loading" :error="error" /></template>

<!-- Parent -->
<FetchData url="https://jsonplaceholder.typicode.com/users" v-slot="{ data, loading, error }">
  <p v-if="loading">Loading...</p>
  <p v-else-if="error">{{ error }}</p>
  <ul v-else-if="data"><li v-for="u in data" :key="u.id">{{ u.name }}</li></ul>
</FetchData>`,
    },
    {
      task: 'Make a PricingCard with named slots title, price and features, where features is scoped and exposes each feature plus whether it is included.',
      hint: 'Loop features in the child and call <slot name="feature" :feature="f" :included="f.included">.',
      solution: `<!-- PricingCard.vue -->
<script setup>
defineProps({ features: Array })
</script>
<template>
  <div class="pricing">
    <h3><slot name="title" /></h3>
    <p class="price"><slot name="price" /></p>
    <ul>
      <li v-for="f in features" :key="f.name">
        <slot name="feature" :feature="f" :included="f.included">{{ f.included ? '✔' : '✘' }} {{ f.name }}</slot>
      </li>
    </ul>
  </div>
</template>

<!-- Parent -->
<PricingCard :features="[{ name: 'Projects', included: true }, { name: 'Support', included: false }]">
  <template #title>Pro</template>
  <template #price>₹499/mo</template>
  <template #feature="{ feature, included }">
    <span :style="{ color: included ? 'green' : 'gray' }">{{ feature.name }}</span>
  </template>
</PricingCard>`,
    },
  ],
  quiz: [
    {
      question: 'What is the shorthand for v-slot:footer?',
      options: ['@footer', ':footer', '#footer', '$footer'],
      answer: 2,
      explanation: '# is the v-slot shorthand.',
    },
    {
      question: 'Slot content written in the parent can access:',
      options: ['Only the parent\'s data (plus slot props if scoped)', 'Only the child\'s data', 'Both freely', 'Neither'],
      answer: 0,
      explanation: 'Render scope: parent content is compiled in the parent scope.',
    },
    {
      question: 'How does a child pass data to slot content?',
      options: ['Through emit', 'Through provide', 'By mutating the parent', 'By binding attributes on <slot> (slot props)'],
      answer: 3,
      explanation: 'That is a scoped slot.',
    },
    {
      question: 'When is fallback content inside <slot> shown?',
      options: ['Always', 'When the parent provides no content for that slot', 'Only on server rendering', 'When the slot is named'],
      answer: 1,
      explanation: 'Fallback renders only when the slot is empty.',
    },
    {
      question: 'How can a component avoid rendering an empty footer wrapper?',
      options: ['<footer v-show="footer">', '<footer v-if="props.footer">', '<footer v-if="$slots.footer">', 'It cannot'],
      answer: 2,
      explanation: '$slots.footer is undefined when no footer content is passed.',
    },
  ],
};
