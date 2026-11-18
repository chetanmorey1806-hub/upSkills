export default {
  id: 'day-12-lifecycle-hooks',
  title: 'Lifecycle Hooks',
  module: 'Module 2: Components',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Every component is created, mounted into the DOM, updated and finally unmounted. Learn the lifecycle phases, the Composition API hooks (onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onErrorCaptured, onActivated/onDeactivated), their Options API equivalents, and the real-world jobs each one is for: fetching data, DOM access, timers, listeners and cleanup.',
  objectives: [
    'Describe the lifecycle of a Vue component from setup to unmount',
    'Use onMounted for DOM access, third-party libraries and initial data loading',
    'Clean up timers, listeners and subscriptions in onUnmounted / onBeforeUnmount',
    'Know what onBeforeUpdate/onUpdated, onErrorCaptured and KeepAlive hooks do',
    'Map Composition API hooks to Options API hooks (created, mounted, destroyed...)',
  ],
  theory: [
    {
      heading: 'The component lifecycle',
      content:
        'Each component instance goes through a series of steps, and Vue lets you run code at each step with **lifecycle hooks**:\n\n1. **Setup / creation**: `setup()` (or `<script setup>`) runs. Reactive state, computed and watchers are created. The DOM does **not** exist yet.\n2. **Before mount** → `onBeforeMount`: the template is compiled to a render function, about to create DOM nodes.\n3. **Mounted** → `onMounted`: the component\'s DOM is inserted into the document. You can now access elements via template refs.\n4. **Updating** (repeats): reactive data changes → `onBeforeUpdate` (DOM still old) → re-render and patch → `onUpdated` (DOM updated).\n5. **Unmounting** → `onBeforeUnmount` (still fully working) → `onUnmounted` (removed; all effects stopped).\n\nAnalogy: a shop. Setup = renting the space and stocking shelves; mounted = opening the doors to customers; updated = rearranging the displays when new stock arrives; unmounted = closing the shop (switch off lights, cancel subscriptions, return the keys).',
      points: [
        'Hooks are registered synchronously during setup (not inside setTimeout or after await)',
        'Parent onMounted runs AFTER all its children have mounted',
        'Hooks are not called during server-side rendering, except setup and serverPrefetch',
      ],
    },
    {
      heading: 'onMounted: DOM access, libraries and data loading',
      content:
        '`onMounted(callback)` runs once the component and all its children are in the DOM. Common uses:\n\n- **Access DOM elements** through template refs: focus an input, measure size, scroll.\n- **Initialise third-party libraries** that need a real element: charts (Chart.js), maps (Leaflet), editors.\n- **Add global listeners**: `window.addEventListener(\'resize\', onResize)`.\n- **Fetch initial data** (very common). You can also start fetching directly in setup, which begins slightly earlier and also works with SSR; both are fine in client-side apps.\n\nTemplate refs (Day 15 in depth): `<input ref="nameInput">` + `const nameInput = ref(null)` (or `useTemplateRef(\'nameInput\')` in 3.5). The ref is `null` until mounted.',
      syntax: `<script setup>
import { ref, onMounted } from 'vue'
const nameInput = ref(null)
const users = ref([])

onMounted(async () => {
  nameInput.value.focus()
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  users.value = await res.json()
})
</script>
<template><input ref="nameInput"></template>`,
    },
    {
      heading: 'Cleanup: onBeforeUnmount and onUnmounted',
      content:
        'When a component is removed (v-if false, route change, list item deleted), Vue automatically removes its DOM, stops its watchers and computeds. But **Vue does not know** about things you created yourself:\n\n- `setInterval` / `setTimeout`\n- `window` / `document` event listeners\n- WebSocket connections, `IntersectionObserver`, `ResizeObserver`\n- third-party library instances (chart.destroy(), map.remove())\n\nIf you do not clean them up you get **memory leaks** and bugs: timers keep running, handlers update state of a component that no longer exists, duplicates pile up each time the component is shown.\n\nRule: **whatever you start in onMounted, stop in onUnmounted** (or onBeforeUnmount if you still need the DOM, e.g. to save scroll position).',
      syntax: `onMounted(() => {
  timer = setInterval(tick, 1000)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', onResize)
})`,
      tip: 'Do not use onUpdated to change state: modifying reactive state there triggers another update and can cause an infinite loop. Use computed or watchers instead.',
    },
    {
      heading: 'Update hooks, error capturing and KeepAlive hooks',
      content:
        '- **onBeforeUpdate**: data has changed, DOM not yet patched. Use it to read the old DOM state (e.g. remember the scroll position before new chat messages render).\n- **onUpdated**: DOM is patched. Runs after **any** re-render of this component, for any reason; to react to a specific value use `watch(..., { flush: \'post\' })` instead.\n- **onErrorCaptured((err, instance, info) => ...)**: catches errors thrown in **descendant** components (render, setup, hooks, watchers, event handlers). Return `false` to stop the error from propagating further. Used to build "error boundary" components. App-wide: `app.config.errorHandler`.\n- **onActivated / onDeactivated**: for components cached inside `<KeepAlive>`. Instead of being unmounted they are deactivated (state kept) and activated again when shown.\n- Debug hooks: `onRenderTracked`, `onRenderTriggered` (development only) show which dependency caused a re-render.\n- `onServerPrefetch`: SSR data fetching (Nuxt).',
    },
    {
      heading: 'Options API equivalents',
      content:
        'In the Options API (Day 13), hooks are component options. Mapping:\n\n- `beforeCreate`, `created` → just write the code in **setup()** (setup runs at the same time)\n- `beforeMount` → `onBeforeMount`\n- `mounted` → `onMounted`\n- `beforeUpdate` → `onBeforeUpdate`\n- `updated` → `onUpdated`\n- `beforeUnmount` (Vue 2: beforeDestroy) → `onBeforeUnmount`\n- `unmounted` (Vue 2: destroyed) → `onUnmounted`\n- `errorCaptured` → `onErrorCaptured`\n- `activated` / `deactivated` → `onActivated` / `onDeactivated`\n\nComposition hooks have an advantage: you can call the same hook **several times**, so each feature (timer, resize, data) keeps its setup and cleanup together, and you can move them into composables (Day 14).',
      syntax: `// Options API
export default {
  data: () => ({ time: new Date() }),
  mounted() { this.timer = setInterval(() => (this.time = new Date()), 1000) },
  unmounted() { clearInterval(this.timer) },
}`,
    },
  ],
  examples: [
    {
      title: 'Watch the lifecycle happen',
      scenario: 'Log every lifecycle hook of a child component while you mount it, update it and unmount it.',
      steps: [
        'Create a LifecycleDemo child with a count ref and all main hooks logging to a shared list',
        'In setup itself, log "setup" (equivalent of created)',
        'Show/hide the child with v-if from the parent',
        'Click the child\'s +1 button to trigger update hooks',
        'Read the log in order',
      ],
      code: `<!-- LifecycleDemo.vue -->
<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'
const emit = defineEmits(['log'])
const count = ref(0)
const el = ref(null)

emit('log', 'setup (created): el = ' + el.value)
onBeforeMount(() => emit('log', 'onBeforeMount: DOM not created yet'))
onMounted(() => emit('log', 'onMounted: el is <' + el.value.tagName.toLowerCase() + '>'))
onBeforeUpdate(() => emit('log', 'onBeforeUpdate: DOM shows ' + el.value.textContent))
onUpdated(() => emit('log', 'onUpdated: DOM shows ' + el.value.textContent))
onBeforeUnmount(() => emit('log', 'onBeforeUnmount'))
onUnmounted(() => emit('log', 'onUnmounted: cleanup done'))
</script>

<template>
  <div ref="el">Count {{ count }} <button @click="count++">+1</button></div>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <button @click="show = !show">{{ show ? 'Unmount' : 'Mount' }} child</button>
  <button @click="logs = []">Clear log</button>
  <div class="child-area"><lifecycle-demo v-if="show" @log="addLog"></lifecycle-demo></div>
  <ol class="log"><li v-for="(l, i) in logs" :key="i">{{ l }}</li></ol>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.child-area { margin: 10px 0; min-height: 30px; padding: 6px; border: 1px dashed #94a3b8; }
.log { font-family: monospace; font-size: 13px; background: #0f172a; color: #a7f3d0; padding: 10px 10px 10px 30px; border-radius: 6px; }`,
        js: `const { createApp, ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } = Vue;

const app = createApp({
  setup() {
    const show = ref(true);
    const logs = ref([]);
    const addLog = (msg) => logs.value.push(msg);
    return { show, logs, addLog };
  }
});

app.component('LifecycleDemo', {
  emits: ['log'],
  setup(props, { emit }) {
    const count = ref(0);
    const el = ref(null);
    emit('log', 'setup (created): el = ' + el.value);
    onBeforeMount(() => emit('log', 'onBeforeMount: DOM not created yet'));
    onMounted(() => emit('log', 'onMounted: el is <' + el.value.tagName.toLowerCase() + '>'));
    onBeforeUpdate(() => emit('log', 'onBeforeUpdate: DOM shows "' + el.value.firstChild.textContent.trim() + '"'));
    onUpdated(() => emit('log', 'onUpdated: DOM shows "' + el.value.firstChild.textContent.trim() + '"'));
    onBeforeUnmount(() => emit('log', 'onBeforeUnmount: el still exists = ' + !!el.value));
    onUnmounted(() => emit('log', 'onUnmounted: cleanup done'));
    return { count, el };
  },
  template: '<div ref="el"><span>Count {{ count }}</span> <button @click="count++">+1</button></div>'
});

app.mount('#app');`,
      },
      result: 'Initial log: setup (el = null) → onBeforeMount → onMounted (el is <div>). Clicking +1 logs onBeforeUpdate: "Count 0" then onUpdated: "Count 1". Unmount logs onBeforeUnmount then onUnmounted. Mount again repeats the creation hooks with a fresh count 0.',
      explanation:
        'Template refs are null during setup and become available in onMounted. Before-update hooks see the old DOM, updated hooks the new DOM. v-if destroys the instance, so re-mounting creates a brand-new instance with fresh state.',
    },
    {
      title: 'Live clock: start a timer in onMounted, clear it in onUnmounted',
      scenario: 'A clock widget that can be hidden. Show the memory-leak bug of a clock without cleanup and the correct version side by side.',
      steps: [
        'Create GoodClock: setInterval in onMounted, clearInterval in onUnmounted',
        'Create LeakyClock: setInterval in onMounted, no cleanup',
        'Both log each tick to the console with their name',
        'Hide both clocks with the toggle',
        'Watch the console: LeakyClock keeps ticking after being removed',
      ],
      code: `<!-- GoodClock.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
    console.log('GoodClock tick')
  }, 1000)
})
onUnmounted(() => clearInterval(timer))   // ✅ stop the timer
</script>
<template><p>🕒 {{ now.toLocaleTimeString() }}</p></template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <button @click="show = !show">{{ show ? 'Hide' : 'Show' }} clocks</button>
  <div v-if="show">
    <good-clock></good-clock>
    <leaky-clock></leaky-clock>
  </div>
  <p>Ticks after hiding: Good = {{ stats.goodAfterHide }}, Leaky = {{ stats.leakyAfterHide }}</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
p { font-size: 18px; }`,
        js: `const { createApp, ref, reactive, watch, onMounted, onUnmounted } = Vue;

const stats = reactive({ hidden: false, goodAfterHide: 0, leakyAfterHide: 0 });

const app = createApp({
  setup() {
    const show = ref(true);
    watch(show, v => { stats.hidden = !v; });
    return { show, stats };
  }
});

app.component('GoodClock', {
  setup() {
    const now = ref(new Date());
    let timer = null;
    onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date();
        if (stats.hidden) stats.goodAfterHide++;
      }, 1000);
    });
    onUnmounted(() => clearInterval(timer));
    return { now };
  },
  template: '<p>✅ Good clock: {{ now.toLocaleTimeString() }}</p>'
});

app.component('LeakyClock', {
  setup() {
    const now = ref(new Date());
    onMounted(() => {
      setInterval(() => {               // ❌ never cleared
        now.value = new Date();
        if (stats.hidden) { stats.leakyAfterHide++; console.log('LeakyClock still ticking!'); }
      }, 1000);
    });
    return { now };
  },
  template: '<p>⚠️ Leaky clock: {{ now.toLocaleTimeString() }}</p>'
});

app.mount('#app');`,
      },
      result: 'Both clocks tick every second. After clicking Hide, "Good" stays at 0 while "Leaky" keeps counting up and the console prints "LeakyClock still ticking!" every second. Showing/hiding repeatedly creates even more leaked timers.',
      explanation:
        'Vue removes the DOM and stops reactive effects on unmount, but it cannot know about intervals you created. Clearing the interval in onUnmounted is mandatory. Every show/hide cycle of LeakyClock adds another orphan timer, which is a classic memory leak.',
    },
    {
      title: 'Fetch data on mount with loading and error states, plus window listeners',
      scenario: 'A user directory loads data when it appears, focuses the search box, and tracks the window width for a responsive layout, cleaning up the listener when removed.',
      steps: [
        'Create loading, error and users refs',
        'In onMounted, focus the search input via a template ref and fetch users from jsonplaceholder',
        'Handle errors with try/catch/finally',
        'Add a resize listener in onMounted and remove it in onUnmounted',
        'Display the list as a grid or list depending on width',
      ],
      code: `<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const users = ref([])
const loading = ref(true)
const error = ref('')
const search = ref(null)
const width = ref(window.innerWidth)
const onResize = () => { width.value = window.innerWidth }

onMounted(async () => {
  search.value.focus()
  window.addEventListener('resize', onResize)
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    users.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <input ref="search" placeholder="Search...">
  <p v-if="loading">Loading...</p>
  <p v-else-if="error">⚠ {{ error }}</p>
  <ul v-else :class="width > 600 ? 'grid' : 'list'">
    <li v-for="u in users" :key="u.id">{{ u.name }}</li>
  </ul>
</template>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <user-directory v-if="open"></user-directory>
  <button @click="open = !open">{{ open ? 'Close' : 'Open' }} directory</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; padding: 0; list-style: none; }
.grid li { background: #f1f5f9; padding: 6px; border-radius: 6px; }
input { padding: 6px; width: 220px; }`,
        js: `const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const app = createApp({
  setup() { return { open: ref(true) }; }
});

app.component('UserDirectory', {
  setup() {
    const users = ref([]);
    const loading = ref(true);
    const error = ref('');
    const search = ref(null);
    const query = ref('');
    const width = ref(window.innerWidth);
    const onResize = () => { width.value = window.innerWidth; };
    const filtered = computed(() => users.value.filter(u => u.name.toLowerCase().includes(query.value.toLowerCase())));

    onMounted(async () => {
      search.value.focus();
      window.addEventListener('resize', onResize);
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        users.value = await res.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    });
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
      console.log('resize listener removed');
    });
    return { users, loading, error, search, query, width, filtered };
  },
  template: \`
    <section>
      <input ref="search" v-model="query" placeholder="Search users (auto-focused)">
      <small> window width: {{ width }}px</small>
      <p v-if="loading">Loading...</p>
      <p v-else-if="error">⚠ {{ error }}</p>
      <ul v-else :class="width > 600 ? 'grid' : 'list'">
        <li v-for="u in filtered" :key="u.id">{{ u.name }}</li>
      </ul>
    </section>\`
});

app.mount('#app');`,
      },
      result: 'The search box is focused automatically, "Loading..." appears briefly, then 10 user names show in a grid (or a list on narrow screens). Resizing the window updates the width. Closing the directory logs "resize listener removed".',
      explanation:
        'The input only exists after mount, so focusing and DOM work belong in onMounted. Async code inside onMounted is fine; the hook itself does not wait for it. The resize listener is added on mount and removed on unmount, keeping each instance self-contained.',
    },
    {
      title: 'Error boundary with onErrorCaptured',
      scenario: 'A widget sometimes crashes; an ErrorBoundary component catches errors from its children and shows a fallback instead of breaking the whole page.',
      steps: [
        'Create ErrorBoundary with an error ref and onErrorCaptured',
        'Store the error message and return false to stop propagation',
        'Render the default slot normally, or a fallback with a Retry button when error is set',
        'Create a BuggyWidget that throws when a counter reaches 3',
        'Click until it crashes, then click Retry',
      ],
      code: `<!-- ErrorBoundary.vue -->
<script setup>
import { ref, onErrorCaptured } from 'vue'
const error = ref(null)
onErrorCaptured((err, instance, info) => {
  error.value = err.message + ' (in ' + info + ')'
  return false   // do not propagate to parent / app.config.errorHandler
})
</script>
<template>
  <div v-if="error" class="fallback">
    💥 Something went wrong: {{ error }}
    <button @click="error = null">Retry</button>
  </div>
  <slot v-else />
</template>

<!-- Usage -->
<ErrorBoundary><BuggyWidget /></ErrorBoundary>`,
      playground: {
        libs: ['vue'],
        html: `<div id="app">
  <h3>Dashboard</h3>
  <error-boundary><buggy-widget></buggy-widget></error-boundary>
  <p>The rest of the page keeps working ✔</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.fallback { background: #fee2e2; border: 1px solid #fca5a5; padding: 10px; border-radius: 8px; }
.widget { background: #ecfdf5; padding: 10px; border-radius: 8px; }`,
        js: `const { createApp, ref, onErrorCaptured } = Vue;

const app = createApp({});

app.component('ErrorBoundary', {
  setup() {
    const error = ref(null);
    onErrorCaptured((err, instance, info) => {
      error.value = err.message + ' (in ' + info + ')';
      console.log('captured:', err.message);
      return false;
    });
    return { error };
  },
  template: \`
    <div v-if="error" class="fallback">
      💥 Something went wrong: {{ error }}
      <button @click="error = null">Retry</button>
    </div>
    <slot v-else></slot>\`
});

app.component('BuggyWidget', {
  setup() {
    const clicks = ref(0);
    function click() {
      clicks.value++;
      if (clicks.value >= 3) throw new Error('Widget crashed at click ' + clicks.value);
    }
    return { clicks, click };
  },
  template: '<div class="widget">Clicks: {{ clicks }} <button @click="click">Click (crashes at 3)</button></div>'
});

app.mount('#app');`,
      },
      result: 'After the third click the widget is replaced by a red box: "💥 Something went wrong: Widget crashed at click 3 (in native event handler)". The heading and paragraph keep working. Retry mounts a fresh widget with clicks = 0.',
      explanation:
        'onErrorCaptured receives errors from descendants with the error, the component instance and an info string describing where it happened. Returning false stops propagation. Because the fallback uses v-if/v-else, Retry re-creates the child from scratch.',
    },
  ],
  interview: [
    {
      q: 'List the Vue 3 Composition API lifecycle hooks in order.',
      a: 'setup (replaces beforeCreate/created) → onBeforeMount → onMounted → (onBeforeUpdate → onUpdated, repeated on each re-render) → onBeforeUnmount → onUnmounted. Also onErrorCaptured, onActivated/onDeactivated (KeepAlive), onRenderTracked/onRenderTriggered (debug) and onServerPrefetch (SSR).',
      level: 'Easy',
    },
    {
      q: 'Where should you fetch initial data: setup or onMounted?',
      a: 'Both work in client apps. Starting in setup begins the request slightly earlier and also runs on the server in SSR; onMounted runs only in the browser and guarantees the DOM exists. For DOM-dependent work use onMounted. In SSR/Nuxt use useFetch/serverPrefetch.',
      level: 'Medium',
    },
    {
      q: 'Why can\'t you access template refs in setup?',
      a: 'Because the DOM elements are created during mounting, after setup has run. Template refs are null until the component is mounted; access them in onMounted (or after nextTick / in watchers with flush: "post").',
      level: 'Easy',
    },
    {
      q: 'What must be cleaned up in onUnmounted?',
      a: 'Anything created outside Vue\'s reactivity: timers (setInterval/setTimeout), global event listeners (window/document), WebSocket/EventSource connections, observers (Intersection/Resize/Mutation), subscriptions, and third-party library instances. Vue cleans up its own watchers and DOM automatically.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between onBeforeUnmount and onUnmounted?',
      a: 'onBeforeUnmount runs while the component is still fully functional with its DOM in place (useful to read DOM state or save scroll position). onUnmounted runs after it has been removed and all its effects stopped; use it for final cleanup.',
      level: 'Medium',
    },
    {
      q: 'Why should you avoid changing state in onUpdated?',
      a: 'Changing reactive state in onUpdated triggers another render and another onUpdated, which can cause an infinite update loop. Use computed properties or watchers for reacting to data changes.',
      level: 'Medium',
    },
    {
      q: 'In what order do parent and child mounted hooks run?',
      a: 'Parent setup and onBeforeMount run first, then each child\'s setup, beforeMount and mounted, and finally the parent\'s onMounted. So a parent\'s onMounted runs after all its children have mounted. Unmount follows a similar pattern: parent onBeforeUnmount, children unmount, then parent onUnmounted.',
      level: 'Hard',
    },
    {
      q: 'What does onErrorCaptured do?',
      a: 'It registers a hook called when an error from a descendant component is captured (render, setup, lifecycle hooks, watchers, event handlers). It receives (err, instance, info). Returning false stops further propagation to ancestors and app.config.errorHandler. It is used to build error boundaries.',
      level: 'Hard',
    },
    {
      q: 'What are onActivated and onDeactivated?',
      a: 'Hooks for components cached by <KeepAlive>. Instead of unmounting, a cached component is deactivated (kept in memory with its state) and later activated when shown again. They also run on initial mount (activated) and final unmount (deactivated).',
      level: 'Medium',
    },
    {
      q: 'Map Options API hooks to Composition API.',
      a: 'beforeCreate/created → setup(); beforeMount → onBeforeMount; mounted → onMounted; beforeUpdate → onBeforeUpdate; updated → onUpdated; beforeUnmount → onBeforeUnmount; unmounted → onUnmounted; errorCaptured → onErrorCaptured; activated/deactivated → onActivated/onDeactivated. Vue 2 names beforeDestroy/destroyed became beforeUnmount/unmounted.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Build a countdown timer component that takes a seconds prop, starts on mount, emits "done" at 0, and clears its interval on unmount.',
      hint: 'Keep the interval id in a variable; clear it both at 0 and in onUnmounted.',
      solution: `<!-- CountdownTimer.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({ seconds: { type: Number, default: 10 } })
const emit = defineEmits(['done'])
const left = ref(props.seconds)
let id = null
onMounted(() => {
  id = setInterval(() => {
    left.value--
    if (left.value <= 0) { clearInterval(id); emit('done') }
  }, 1000)
})
onUnmounted(() => clearInterval(id))
</script>
<template><p>⏳ {{ left }}s</p></template>`,
    },
    {
      task: 'Create a ScrollProgress component that shows a bar at the top of the page reflecting how far the page has been scrolled. Add the scroll listener on mount and remove it on unmount.',
      hint: 'percent = scrollY / (scrollHeight - innerHeight) * 100; use { passive: true }.',
      solution: `<!-- ScrollProgress.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const percent = ref(0)
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  percent.value = max > 0 ? (window.scrollY / max) * 100 : 0
}
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>
<template>
  <div class="bar" :style="{ width: percent + '%' }"></div>
</template>
<style scoped>
.bar { position: fixed; top: 0; left: 0; height: 4px; background: #42b883; z-index: 10; }
</style>`,
    },
    {
      task: 'Write a chat window that keeps the view scrolled to the bottom when new messages arrive, but only if the user was already near the bottom before the update.',
      hint: 'Measure in onBeforeUpdate (old DOM), scroll in onUpdated (new DOM).',
      solution: `<script setup>
import { ref, onBeforeUpdate, onUpdated } from 'vue'
const props = defineProps({ messages: Array })
const box = ref(null)
let wasAtBottom = true
onBeforeUpdate(() => {
  const el = box.value
  wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30
})
onUpdated(() => {
  if (wasAtBottom) box.value.scrollTop = box.value.scrollHeight
})
</script>
<template>
  <div ref="box" style="height:200px;overflow:auto">
    <p v-for="m in messages" :key="m.id">{{ m.text }}</p>
  </div>
</template>`,
    },
    {
      task: 'Convert this Options API component to <script setup>: data: count 0; mounted: start interval incrementing count every second; beforeUnmount: clear it.',
      hint: 'mounted → onMounted, beforeUnmount → onBeforeUnmount.',
      solution: `<!-- Options API -->
<script>
export default {
  data: () => ({ count: 0 }),
  mounted() { this.id = setInterval(() => this.count++, 1000) },
  beforeUnmount() { clearInterval(this.id) },
}
</script>

<!-- Composition API -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const count = ref(0)
let id
onMounted(() => { id = setInterval(() => count.value++, 1000) })
onBeforeUnmount(() => clearInterval(id))
</script>
<template><p>{{ count }}</p></template>`,
    },
  ],
  quiz: [
    {
      question: 'Which hook is the first place where template refs point to real DOM elements?',
      options: ['setup', 'onBeforeMount', 'onMounted', 'onBeforeUpdate'],
      answer: 2,
      explanation: 'The DOM exists from onMounted onwards.',
    },
    {
      question: 'Which Composition API feature replaces the created hook?',
      options: ['onCreated', 'setup()', 'onMounted', 'onBeforeMount'],
      answer: 1,
      explanation: 'Code in setup runs at the same point as beforeCreate/created.',
    },
    {
      question: 'What happens if you do not clear a setInterval started in onMounted?',
      options: ['Vue clears it automatically', 'It stops when the DOM is removed', 'The app crashes immediately', 'It keeps running after unmount: a memory leak'],
      answer: 3,
      explanation: 'Vue does not track timers you create.',
    },
    {
      question: 'Which hook lets a component catch errors thrown by its descendants?',
      options: ['onErrorCaptured', 'onUnmounted', 'onRenderTriggered', 'onActivated'],
      answer: 0,
      explanation: 'Return false from it to stop propagation.',
    },
    {
      question: 'In Vue 3, the Vue 2 hook "destroyed" was renamed to:',
      options: ['removed', 'onDestroy', 'unmounted', 'deactivated'],
      answer: 2,
      explanation: 'beforeDestroy → beforeUnmount, destroyed → unmounted.',
    },
  ],
};
