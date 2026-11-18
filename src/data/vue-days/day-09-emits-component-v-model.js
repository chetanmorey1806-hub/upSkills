export default {
  id: 'day-09-emits-component-v-model',
  title: 'Emitting Events and Component v-model (defineModel)',
  module: 'Module 2: Components',
  day: 9,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Props send data down; events send messages up. Learn defineEmits, emitting with payloads, event validation, naming conventions, then build components that support v-model with defineModel (Vue 3.4+), multiple v-model bindings and custom modifiers, and understand the modelValue / update:modelValue contract underneath.',
  objectives: [
    'Declare and emit custom events with defineEmits and $emit, with payloads',
    'Listen to child events in the parent and update parent state',
    'Validate emitted events and follow naming conventions',
    'Implement component v-model with defineModel and with the manual props + emit pattern',
    'Use multiple v-model bindings (v-model:title) and custom v-model modifiers',
  ],
  theory: [
    {
      heading: 'Why emit events? "Props down, events up"',
      content:
        'From Day 8: a child cannot change its props. But a child often needs to tell the parent that something happened: "Add to cart was clicked", "this item should be deleted", "the dialog wants to close".\n\nThe child **emits a custom event**, and the parent **listens** to it with `v-on` exactly like a native DOM event. The parent then updates its own state, and the new value flows back down through props.\n\nAnalogy: a child in a classroom cannot change the marks register (props). They raise their hand and say "I finished my homework" (emit). The teacher (parent) decides to update the register, and the new marks are announced to everyone (props flow down).\n\nThis keeps the **parent as the single owner** of the data, which makes apps predictable.',
    },
    {
      heading: 'defineEmits and emitting with payloads',
      content:
        'In `<script setup>`, declare events with the `defineEmits()` macro. It returns an `emit` function:\n\n`const emit = defineEmits([\'addToCart\', \'remove\'])`\n\n`emit(\'addToCart\', product.id, qty)` sends the event with any number of **payload** arguments. The parent handler receives them as parameters: `@add-to-cart="(id, qty) => ..."` or a method `@add-to-cart="handleAdd"`.\n\nIn the template you can also use `$emit(\'remove\')` directly.\n\nWhy declare emits?\n\n1. Documentation: everyone can see what the component emits.\n2. Declared events are **excluded from fallthrough attributes**, so a native listener is not accidentally attached to the root element as well.\n3. Validation and TypeScript typing.\n\n**Naming**: emit in camelCase (`emit(\'addToCart\')`) and listen in kebab-case (`@add-to-cart`); Vue normalises them. Unlike native DOM events, component events **do not bubble**: only the direct parent can listen. For deep communication use provide/inject (Day 11) or a store (Day 18).',
      syntax: `<!-- TodoItem.vue -->
<script setup>
const props = defineProps({ todo: Object })
const emit = defineEmits(['toggle', 'remove'])
</script>
<template>
  <li>
    <input type="checkbox" :checked="todo.done" @change="emit('toggle', todo.id)">
    {{ todo.text }}
    <button @click="emit('remove', todo.id)">✕</button>
  </li>
</template>

<!-- Parent -->
<TodoItem v-for="t in todos" :key="t.id" :todo="t"
  @toggle="id => toggle(id)" @remove="removeTodo" />`,
    },
    {
      heading: 'Event validation',
      content:
        'Use the **object syntax** to validate payloads. Each key is an event name; the value is `null` (no validation) or a function that receives the emit arguments and returns `true` if valid. Invalid emits produce a console warning in development (the event is still emitted).\n\nWith TypeScript: `const emit = defineEmits<{ (e: \'change\', id: number): void }>()`, or the shorter 3.3+ form `defineEmits<{ change: [id: number] }>()` (Day 22).',
      syntax: `const emit = defineEmits({
  click: null,                       // no validation
  submit: ({ email, password }) => {
    if (email && password) return true
    console.warn('Invalid submit payload!')
    return false
  }
})`,
    },
    {
      heading: 'v-model on components: the contract',
      content:
        'On a native input, `v-model` is sugar for `:value` + `@input`. On a **component**, Vue 3 expands it to a prop and an event:\n\n`<SearchBox v-model="query" />`\n\nbecomes\n\n`<SearchBox :modelValue="query" @update:modelValue="newValue => query = newValue" />`\n\nSo the child must: accept a `modelValue` prop and emit `update:modelValue` with the new value. This is how you build custom inputs, toggles, rating stars, date pickers and so on that work with v-model.\n\n**Manual implementation** (works in every Vue 3 version, and in our playground): use a writable computed:\n\n```\nconst props = defineProps([\'modelValue\'])\nconst emit = defineEmits([\'update:modelValue\'])\nconst value = computed({\n  get: () => props.modelValue,\n  set: (v) => emit(\'update:modelValue\', v)\n})\n```\nThen `<input v-model="value">` inside the child.',
    },
    {
      heading: 'defineModel(): the modern way (Vue 3.4+)',
      content:
        '`defineModel()` is a macro that declares the `modelValue` prop and the `update:modelValue` event for you and returns a **ref**. Reading it gives the parent\'s value; **assigning `.value` emits** the update automatically.\n\n- `const model = defineModel()`: default v-model\n- `const model = defineModel({ type: String, required: true, default: \'\' })`: with prop options\n- **Multiple v-models**: `const title = defineModel(\'title\')` and `const body = defineModel(\'body\')`, used as `<PostEditor v-model:title="t" v-model:body="b" />`\n- **Custom modifiers**: the parent writes `v-model.capitalize="name"`; the child reads them with `const [model, modifiers] = defineModel({ set(v) { return modifiers.capitalize ? v[0].toUpperCase() + v.slice(1) : v } })`\n\nUnder the hood defineModel compiles to the `useModel()` helper, which the global build also exposes, but the classic computed get/set pattern is the clearest to learn first.',
      syntax: `<!-- CustomInput.vue -->
<script setup>
const model = defineModel({ type: String, default: '' })
</script>
<template>
  <input v-model="model" class="fancy">
</template>

<!-- Parent -->
<CustomInput v-model="username" />`,
      tip: 'If you use a default value with defineModel and the parent does not provide a value, parent and child can get out of sync. Prefer required: true or let the parent always pass a value.',
    },
  ],
  examples: [
    {
      title: 'Todo list: child emits toggle and remove with payloads',
      scenario: 'The parent owns the todos array; each TodoItem emits events with the todo id and the parent updates its state.',
      steps: [
        'Create TodoItem with prop todo and emits ["toggle", "remove"]',
        'Emit toggle(id) on checkbox change and remove(id) on the ✕ button',
        'In the parent, listen with @toggle and @remove and update the array',
        'Add an AddTodo child that emits add(text) on submit',
        'Interact and watch the counts update',
      ],
      code: `<!-- AddTodo.vue -->
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add'])
const text = ref('')
function submit() {
  if (!text.value.trim()) return
  emit('add', text.value.trim())
  text.value = ''
}
</script>
<template>
  <form @submit.prevent="submit"><input v-model="text"><button>Add</button></form>
</template>

<!-- TodoItem.vue -->
<script setup>
defineProps({ todo: { type: Object, required: true } })
const emit = defineEmits(['toggle', 'remove'])
</script>
<template>
  <li :class="{ done: todo.done }">
    <input type="checkbox" :checked="todo.done" @change="emit('toggle', todo.id)">
    {{ todo.text }}
    <button @click="emit('remove', todo.id)">✕</button>
  </li>
</template>

<!-- App.vue -->
<script setup>
import { ref, computed } from 'vue'
import AddTodo from './AddTodo.vue'
import TodoItem from './TodoItem.vue'
let nextId = 3
const todos = ref([{ id: 1, text: 'Learn emits', done: false }, { id: 2, text: 'Learn props', done: true }])
const remaining = computed(() => todos.value.filter(t => !t.done).length)
const add = (text) => todos.value.push({ id: nextId++, text, done: false })
const toggle = (id) => { const t = todos.value.find(t => t.id === id); t.done = !t.done }
const remove = (id) => { todos.value = todos.value.filter(t => t.id !== id) }
</script>
<template>
  <AddTodo @add="add" />
  <ul><TodoItem v-for="t in todos" :key="t.id" :todo="t" @toggle="toggle" @remove="remove" /></ul>
  <p>{{ remaining }} remaining</p>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <add-todo @add="add"></add-todo>
  <ul>
    <todo-item v-for="t in todos" :key="t.id" :todo="t" @toggle="toggle" @remove="remove"></todo-item>
  </ul>
  <p>{{ remaining }} of {{ todos.length }} remaining</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
ul { list-style: none; padding: 0; }
li { padding: 6px 0; border-bottom: 1px solid #eee; }
li.done { color: #9ca3af; text-decoration: line-through; }
li button { float: right; border: 0; background: none; color: #dc2626; cursor: pointer; }`,
        js: `const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    let nextId = 3;
    const todos = ref([
      { id: 1, text: 'Learn emits', done: false },
      { id: 2, text: 'Learn props', done: true },
    ]);
    const remaining = computed(() => todos.value.filter(t => !t.done).length);
    const add = (text) => { todos.value.push({ id: nextId++, text, done: false }); };
    const toggle = (id) => { const t = todos.value.find(t => t.id === id); t.done = !t.done; };
    const remove = (id) => { todos.value = todos.value.filter(t => t.id !== id); };
    return { todos, remaining, add, toggle, remove };
  }
});

app.component('AddTodo', {
  emits: ['add'],
  setup(props, { emit }) {
    const text = ref('');
    function submit() {
      if (!text.value.trim()) return;
      emit('add', text.value.trim());
      text.value = '';
    }
    return { text, submit };
  },
  template: '<form @submit.prevent="submit"><input v-model="text" placeholder="New todo"> <button>Add</button></form>'
});

app.component('TodoItem', {
  props: { todo: { type: Object, required: true } },
  emits: ['toggle', 'remove'],
  template: \`
    <li :class="{ done: todo.done }">
      <input type="checkbox" :checked="todo.done" @change="$emit('toggle', todo.id)">
      {{ todo.text }}
      <button @click="$emit('remove', todo.id)">✕</button>
    </li>\`
});

app.mount('#app');`,
      },
      result: 'Two todos, "1 of 2 remaining". Adding, ticking and deleting items updates the list and counter; completed items are struck through.',
      explanation:
        'Children never touch the array: they emit intentions with the id as payload, and the parent (the owner) changes its state. The checkbox uses :checked + @change instead of v-model because todo is a prop. In the options-object form used in the playground, emit comes from the setup context (setup(props, { emit })) and $emit is available in templates.',
    },
    {
      title: 'Custom input with v-model (manual pattern and defineModel)',
      scenario: 'A reusable search box with a clear button and character counter that works with v-model in the parent.',
      steps: [
        'In the child, accept modelValue and emit update:modelValue',
        'Create a writable computed that reads the prop and emits on set',
        'Bind the inner <input> with v-model="value" and add a clear button that sets value to ""',
        'In the parent, use <search-box v-model="query"> and filter a list with it',
        'Compare with the defineModel SFC version in the code panel',
      ],
      code: `<!-- SearchBox.vue (Vue 3.4+ with defineModel) -->
<script setup>
const model = defineModel({ type: String, required: true })
defineProps({ placeholder: { type: String, default: 'Search...' } })
</script>
<template>
  <div class="search">
    <input v-model="model" :placeholder="placeholder">
    <button v-if="model" @click="model = ''">✕</button>
    <small>{{ model.length }} chars</small>
  </div>
</template>

<!-- Equivalent manual version -->
<script setup>
import { computed } from 'vue'
const props = defineProps({ modelValue: { type: String, required: true }, placeholder: String })
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<!-- Parent -->
<SearchBox v-model="query" placeholder="Find a fruit" />`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <search-box v-model="query" placeholder="Find a fruit"></search-box>
  <p>Parent query: "{{ query }}"</p>
  <ul><li v-for="f in filtered" :key="f">{{ f }}</li></ul>
  <button @click="query = 'man'">Set query from parent</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.search { display: inline-flex; gap: 6px; align-items: center; border: 2px solid #42b883; border-radius: 999px; padding: 4px 10px; }
.search input { border: 0; outline: 0; }
.search button { border: 0; background: none; cursor: pointer; }`,
        js: `const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    const query = ref('');
    const fruits = ['Apple', 'Mango', 'Banana', 'Grapes', 'Pineapple', 'Guava'];
    const filtered = computed(() => fruits.filter(f => f.toLowerCase().includes(query.value.toLowerCase())));
    return { query, filtered };
  }
});

app.component('SearchBox', {
  props: { modelValue: { type: String, required: true }, placeholder: { type: String, default: 'Search...' } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // same behaviour as: const model = defineModel()
    const model = computed({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    });
    return { model };
  },
  template: \`
    <div class="search">
      <input v-model="model" :placeholder="placeholder">
      <button v-if="model" @click="model = ''">✕</button>
      <small>{{ model.length }} chars</small>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'Typing "ap" filters to Apple, Grapes and Pineapple, and the parent shows the same query. ✕ clears both. "Set query from parent" fills the input with "man" (Mango): data flows both ways through props and events.',
      explanation:
        'v-model="query" on the component passes :modelValue and listens to @update:modelValue. Assigning the writable computed emits the event; the parent updates query, and the new prop value flows back. defineModel generates exactly this prop + emit pair and returns a ref with the same get/set behaviour.',
    },
    {
      title: 'Multiple v-model bindings: v-model:title and v-model:content',
      scenario: 'A blog post editor component edits several fields of the parent\'s post at once.',
      steps: [
        'In the child, declare title and content models (defineModel("title"), defineModel("content"))',
        'In the playground use props title/content with emits update:title / update:content',
        'Bind inner inputs to writable computeds',
        'In the parent, use v-model:title and v-model:content',
        'Preview the post in the parent as you type',
      ],
      code: `<!-- PostEditor.vue -->
<script setup>
const title = defineModel('title', { type: String, required: true })
const content = defineModel('content', { type: String, default: '' })
</script>
<template>
  <input v-model="title" placeholder="Title">
  <textarea v-model="content" placeholder="Write..."></textarea>
</template>

<!-- Parent -->
<PostEditor v-model:title="post.title" v-model:content="post.content" />
<article><h2>{{ post.title }}</h2><p>{{ post.content }}</p></article>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <post-editor v-model:title="post.title" v-model:content="post.content"></post-editor>
  <article>
    <h2>{{ post.title || 'Untitled' }}</h2>
    <p>{{ post.content || 'Nothing written yet.' }}</p>
    <small>{{ wordCount }} words</small>
  </article>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.editor { display: flex; flex-direction: column; gap: 6px; max-width: 360px; }
article { margin-top: 14px; border-left: 4px solid #42b883; padding-left: 12px; }`,
        js: `const { createApp, reactive, computed } = Vue;

const app = createApp({
  setup() {
    const post = reactive({ title: 'Hello Vue', content: 'Multiple v-model bindings are handy.' });
    const wordCount = computed(() => post.content.trim().split(/\\s+/).filter(Boolean).length);
    return { post, wordCount };
  }
});

app.component('PostEditor', {
  props: { title: { type: String, required: true }, content: { type: String, default: '' } },
  emits: ['update:title', 'update:content'],
  setup(props, { emit }) {
    const titleModel = computed({ get: () => props.title, set: v => emit('update:title', v) });
    const contentModel = computed({ get: () => props.content, set: v => emit('update:content', v) });
    return { titleModel, contentModel };
  },
  template: \`
    <div class="editor">
      <input v-model="titleModel" placeholder="Title">
      <textarea v-model="contentModel" rows="4" placeholder="Write..."></textarea>
    </div>\`
});

app.mount('#app');`,
      },
      result: 'Editing the title or content in the editor updates the article preview and word count in the parent instantly.',
      explanation:
        'v-model:title passes :title and listens to @update:title (same for content). Each binding is independent, so one component can sync several parent fields. With defineModel("title") you get a ref that does this automatically.',
    },
    {
      title: 'Event validation and a v-model modifier (capitalize)',
      scenario: 'A rating widget validates its emitted value, and a name input supports a custom .capitalize modifier.',
      steps: [
        'StarRating declares emits with a validator: the value must be 1-5',
        'It emits update:modelValue on star click (works with v-model)',
        'NameInput reads modelModifiers and capitalises the value before emitting',
        'Use v-model.capitalize="name" in the parent',
        'Click stars and type a lowercase name',
      ],
      code: `<!-- StarRating.vue -->
<script setup>
defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits({
  'update:modelValue': (v) => Number.isInteger(v) && v >= 1 && v <= 5,
})
</script>
<template>
  <span v-for="n in 5" :key="n" @click="emit('update:modelValue', n)">{{ n <= modelValue ? '★' : '☆' }}</span>
</template>

<!-- NameInput.vue with a custom modifier -->
<script setup>
const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.capitalize && value) return value.charAt(0).toUpperCase() + value.slice(1)
    return value
  }
})
</script>
<template><input v-model="model"></template>

<!-- Parent -->
<StarRating v-model="rating" />
<NameInput v-model.capitalize="name" />`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <p>Rating: <star-rating v-model="rating"></star-rating> ({{ rating }}/5)
    <button @click="rating = 0">Reset</button></p>
  <p>Name with .capitalize: <name-input v-model.capitalize="name"></name-input> → "{{ name }}"</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.stars span { cursor: pointer; font-size: 26px; color: #f59e0b; }`,
        js: `const { createApp, ref, computed } = Vue;

const app = createApp({
  setup() {
    return { rating: ref(3), name: ref('') };
  }
});

app.component('StarRating', {
  props: { modelValue: { type: Number, default: 0 } },
  emits: {
    'update:modelValue': (v) => Number.isInteger(v) && v >= 1 && v <= 5,
  },
  template: \`<span class="stars"><span v-for="n in 5" :key="n" @click="$emit('update:modelValue', n)">{{ n <= modelValue ? '★' : '☆' }}</span></span>\`
});

app.component('NameInput', {
  props: { modelValue: String, modelModifiers: { default: () => ({}) } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = computed({
      get: () => props.modelValue,
      set: (value) => {
        if (props.modelModifiers.capitalize && value) {
          value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        emit('update:modelValue', value);
      }
    });
    return { model };
  },
  template: '<input v-model="model" placeholder="type lowercase">'
});

app.mount('#app');`,
      },
      result: 'Three of five stars are filled; clicking a star changes the rating. Typing "asha" in the name input becomes "Asha" in both the input and the parent.',
      explanation:
        'The emits object validates each emit call and warns in dev if the validator returns false. Modifiers used with v-model on a component arrive in a modelModifiers prop ({ capitalize: true }); with defineModel they are the second item of the returned tuple, and the set transformer modifies the value before it is emitted.',
    },
  ],
  interview: [
    {
      q: 'How does a child component communicate with its parent?',
      a: 'By emitting custom events: the child calls emit("eventName", payload) (declared via defineEmits), and the parent listens with @event-name="handler". The parent then updates its own state, which flows back down via props.',
      level: 'Easy',
    },
    {
      q: 'Why should you declare emitted events with defineEmits?',
      a: 'It documents the component API, enables payload validation and TypeScript typing, and excludes those events from fallthrough attributes so native listeners are not also bound to the root element (which could cause double firing for events like click).',
      level: 'Medium',
    },
    {
      q: 'Do component events bubble?',
      a: 'No. Unlike native DOM events, custom component events are only received by the direct parent. For distant components use provide/inject, a store like Pinia, or re-emit the event at each level.',
      level: 'Medium',
    },
    {
      q: 'What does v-model expand to on a component in Vue 3?',
      a: ':modelValue="x" plus @update:modelValue="v => x = v". With an argument, v-model:title expands to :title and @update:title. (Vue 2 used value + input by default.)',
      level: 'Medium',
    },
    {
      q: 'What is defineModel?',
      a: 'A <script setup> macro (stable since Vue 3.4) that declares the model prop and its update event and returns a ref. Reading the ref returns the parent value; assigning it emits the update event. It supports named models (defineModel("title")), prop options and modifiers with get/set transformers.',
      level: 'Medium',
    },
    {
      q: 'How do you support multiple v-models on one component?',
      a: 'Use arguments: <UserForm v-model:first-name="first" v-model:last-name="last" />. In the child, defineModel("firstName") and defineModel("lastName"), or props firstName/lastName with emits update:firstName/update:lastName.',
      level: 'Medium',
    },
    {
      q: 'How do custom v-model modifiers work?',
      a: 'Modifiers are passed to the child in a prop named modelModifiers (or titleModifiers for v-model:title) as an object like { capitalize: true }. With defineModel, destructure const [model, modifiers] = defineModel({ get, set }) and transform the value in set (or get).',
      level: 'Hard',
    },
    {
      q: 'How do you validate emitted events?',
      a: 'Use the object syntax of defineEmits / emits: each event maps to a function receiving the emit arguments and returning true or false. If false, Vue logs a warning in development; the event is still emitted.',
      level: 'Medium',
    },
    {
      q: 'Why can\'t you just use v-model="modelValue" directly on an inner input in the child?',
      a: 'Because that would try to assign the modelValue prop, and props are readonly. You must either use a writable computed that emits update:modelValue on set, bind :value + @input and emit manually, or use defineModel which returns a writable ref.',
      level: 'Hard',
    },
    {
      q: 'What is the difference between emit in <script setup> and $emit?',
      a: 'They do the same thing. In <script setup> you get emit from defineEmits() to use in script code; in templates you can use $emit directly. In the setup() function form, emit comes from the second context argument: setup(props, { emit }).',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a Counter child with props count and step, which emits increment(step) and decrement(step). The parent holds the count and updates it.',
      hint: 'emit("increment", props.step).',
      solution: `<!-- CounterControls.vue -->
<script setup>
const props = defineProps({ count: Number, step: { type: Number, default: 1 } })
const emit = defineEmits(['increment', 'decrement'])
</script>
<template>
  <button @click="emit('decrement', props.step)">-{{ step }}</button>
  <strong>{{ count }}</strong>
  <button @click="emit('increment', props.step)">+{{ step }}</button>
</template>

<!-- Parent -->
<script setup>
import { ref } from 'vue'
import CounterControls from './CounterControls.vue'
const count = ref(0)
</script>
<template>
  <CounterControls :count="count" :step="5" @increment="n => count += n" @decrement="n => count -= n" />
</template>`,
    },
    {
      task: 'Build a ToggleSwitch component that works with v-model (boolean) using defineModel, and use it to switch dark mode in the parent.',
      hint: 'const on = defineModel({ type: Boolean, default: false }); @click="on = !on".',
      solution: `<!-- ToggleSwitch.vue -->
<script setup>
const on = defineModel({ type: Boolean, default: false })
defineProps({ label: String })
</script>
<template>
  <button role="switch" :aria-checked="on" class="switch" :class="{ on }" @click="on = !on">
    <span class="knob"></span> {{ label }}
  </button>
</template>

<!-- Parent -->
<ToggleSwitch v-model="dark" label="Dark mode" />
<div :class="{ dark }">Content</div>`,
    },
    {
      task: 'Create a ConfirmDialog component with a visible v-model (v-model:open) and emits confirm/cancel. The parent shows it before deleting an item.',
      hint: 'const open = defineModel("open"); confirm: emit("confirm"); open.value = false.',
      solution: `<!-- ConfirmDialog.vue -->
<script setup>
const open = defineModel('open', { type: Boolean, default: false })
defineProps({ message: String })
const emit = defineEmits(['confirm', 'cancel'])
function confirm() { emit('confirm'); open.value = false }
function cancel() { emit('cancel'); open.value = false }
</script>
<template>
  <div v-if="open" class="backdrop" @click.self="cancel">
    <div class="dialog">
      <p>{{ message }}</p>
      <button @click="confirm">Yes</button> <button @click="cancel">No</button>
    </div>
  </div>
</template>

<!-- Parent -->
<button @click="showConfirm = true">Delete</button>
<ConfirmDialog v-model:open="showConfirm" message="Delete this item?" @confirm="deleteItem" />`,
    },
    {
      task: 'Create a QuantityInput with v-model that never emits values below min or above max props, and supports a .even modifier that rounds to the nearest even number.',
      hint: 'Clamp inside the set transformer; check modifiers.even.',
      solution: `<!-- QuantityInput.vue -->
<script setup>
const props = defineProps({ min: { type: Number, default: 0 }, max: { type: Number, default: 100 } })
const [model, modifiers] = defineModel({
  type: Number,
  set(v) {
    v = Math.min(props.max, Math.max(props.min, Number(v) || 0))
    if (modifiers.even) v = Math.round(v / 2) * 2
    return v
  }
})
</script>
<template>
  <button @click="model--">-</button>
  <input type="number" v-model.number="model">
  <button @click="model++">+</button>
</template>

<!-- Parent -->
<QuantityInput v-model.even="qty" :min="0" :max="20" />`,
    },
  ],
  quiz: [
    {
      question: 'How does a child send data to its parent?',
      options: ['By mutating props', 'By emitting an event', 'By calling the parent\'s data() directly', 'Through v-bind'],
      answer: 1,
      explanation: 'Props down, events up.',
    },
    {
      question: 'On a component, v-model="x" passes which prop and listens to which event (Vue 3)?',
      options: ['value / input', 'model / change', 'modelValue / update:modelValue', 'v / update'],
      answer: 2,
      explanation: 'Vue 3 uses modelValue and update:modelValue.',
    },
    {
      question: 'What does defineModel() return?',
      options: ['A ref that emits an update event when assigned', 'The emit function', 'A readonly prop', 'A computed without setter'],
      answer: 0,
      explanation: 'It returns a ref synced with the parent\'s v-model.',
    },
    {
      question: 'A grandparent listens @save on a grandchild that emits "save". What happens?',
      options: ['The grandparent receives it', 'Vue throws an error', 'It bubbles up like a DOM event', 'Only the direct parent can receive it'],
      answer: 3,
      explanation: 'Component events do not bubble.',
    },
    {
      question: 'Which syntax binds a second v-model named title?',
      options: ['v-model.title="t"', 'v-model:title="t"', ':v-model-title="t"', 'v-title="t"'],
      answer: 1,
      explanation: 'Named models use an argument: v-model:title.',
    },
  ],
};
