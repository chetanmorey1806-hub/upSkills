// Builds the iframe document for the Code Playground.
const CONSOLE_HOOK = `<script>
(function(){
  function fmt(v){
    try {
      if (v instanceof Error) return v.name + ': ' + v.message;
      if (typeof v === 'string') return v;
      if (typeof v === 'function') return v.toString().slice(0, 200);
      if (v instanceof Element) return '<' + v.tagName.toLowerCase() + (v.id ? ' id="' + v.id + '"' : '') + (v.className ? ' class="' + v.className + '"' : '') + '>';
      if (v === undefined) return 'undefined';
      var seen = new WeakSet();
      return JSON.stringify(v, function(k, x){
        if (typeof x === 'object' && x !== null) { if (seen.has(x)) return '[Circular]'; seen.add(x); }
        if (x instanceof Map) return { 'Map': Array.from(x.entries()) };
        if (x instanceof Set) return { 'Set': Array.from(x) };
        if (typeof x === 'bigint') return x.toString() + 'n';
        if (x === undefined) return 'undefined';
        return x;
      }, 2);
    } catch (e) { return String(v); }
  }
  function send(level, args){ try { parent.postMessage({ __pg: true, level: level, text: Array.prototype.map.call(args, fmt).join(' ') }, '*'); } catch (e) {} }
  ['log','info','warn','error','debug','table'].forEach(function(l){ var o = console[l]; console[l] = function(){ send(l === 'table' ? 'log' : l, arguments); if (o) o.apply(console, arguments); }; });
  window.addEventListener('error', function(e){ send('error', [ (e.message || 'Error') + (e.lineno ? ' (line ' + e.lineno + ')' : '') ]); });
  window.addEventListener('unhandledrejection', function(e){ send('error', ['Uncaught (in promise) ' + fmt(e.reason)]); });
})();
<\/script>`;

const esc = (s) => String(s || '').replace(/<\/script/gi, '<\\/script');

// CDN libraries a playground can request (versions pinned)
export const LIBS = {
  bootstrap: {
    label: 'Bootstrap 5',
    head: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">',
    body: '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"><\/script>',
  },
  'bootstrap-icons': {
    label: 'Bootstrap Icons',
    head: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">',
    body: '',
  },
  vue: {
    label: 'Vue 3',
    head: '',
    body: '<script src="https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js"><\/script>',
  },
};

export function buildWebDoc({ html = '', css = '', js = '', libs = [] }) {
  const use = (libs || []).filter((l) => LIBS[l]);
  const libHead = use.map((l) => LIBS[l].head).join('');
  const libBody = use.map((l) => LIBS[l].body).join('');
  const style = `${libHead}<style>${css}</style>`;
  const script = `${libBody}<script>\n${esc(js)}\n<\/script>`;
  if (/<html[\s>]/i.test(html)) {
    let doc = html;
    doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, () => `${CONSOLE_HOOK}${style}</head>`) : doc.replace(/<html[^>]*>/i, (m) => `${m}<head>${CONSOLE_HOOK}${style}</head>`);
    doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, () => `${script}</body>`) : doc + script;
    return doc;
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${CONSOLE_HOOK}${style}</head><body>\n${html}\n${script}</body></html>`;
}

export function buildReactDoc({ jsx = '', css = '' }) {
  const code = JSON.stringify(jsx);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${CONSOLE_HOOK}
<style>body{font-family:system-ui,sans-serif;margin:16px;}${css}</style>
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"><\/script>
</head><body><div id="root"></div>
<script>
(function(){
  if (!window.React || !window.Babel) { console.error('Could not load React/Babel from the CDN. Check your internet connection.'); return; }
  var src = ${code};
  try {
    var out = Babel.transform(src + "\\n;window.__App = typeof App !== 'undefined' ? App : null;", { presets: ['react'], filename: 'App.jsx' }).code;
    (0, eval)(out);
    if (!window.__App) { console.error('Define a component named App, e.g. function App() { return <h1>Hello</h1>; }'); return; }
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.__App));
  } catch (e) { console.error(e.message); }
})();
<\/script></body></html>`;
}

// React Native (Expo-style App.js) rendered in a phone frame through react-native-web.
// Students write normal RN code: import { View, Text, StyleSheet } from 'react-native'; export default function App() {...}
const RN_IMPORTS = {
  react: 'https://esm.sh/react@18.3.1',
  'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime',
  'react-dom': 'https://esm.sh/react-dom@18.3.1?external=react',
  'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client?external=react',
  'react-native': 'https://esm.sh/react-native-web@0.19.13?external=react,react-dom',
  // small stand-ins for common Expo packages so typical Expo snippets run unchanged
  'expo-status-bar': 'data:text/javascript,export const StatusBar = () => null; export default StatusBar;',
  'react-native-safe-area-context': "data:text/javascript,import { View } from 'react-native'; export const SafeAreaView = View; export const SafeAreaProvider = ({ children }) => children; export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });",
  '@expo/vector-icons': "data:text/javascript,import { createElement } from 'react'; import { Text } from 'react-native'; const map = { home: '🏠', cart: '🛒', heart: '❤', star: '★', search: '🔍', person: '👤', settings: '⚙', add: '+', remove: '−', close: '✕', trash: '🗑', sunny: '☀', cloud: '☁', rainy: '🌧', thermometer: '🌡', location: '📍', checkmark: '✓', menu: '☰', 'arrow-back': '←', 'arrow-forward': '→' }; const Icon = ({ name = '', size = 20, color = '#111', style }) => createElement(Text, { style: [{ fontSize: size, color }, style] }, map[String(name).replace(/-outline$/, '')] || '•'); export const Ionicons = Icon; export const MaterialIcons = Icon; export const FontAwesome = Icon; export const Feather = Icon; export const AntDesign = Icon; export default Icon;",
};

export function buildNativeDoc({ rn = '', device = 'android' }) {
  const code = JSON.stringify(rn);
  const importMap = JSON.stringify({ imports: RN_IMPORTS });
  const ios = device === 'ios';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${CONSOLE_HOOK}
<script type="importmap">${importMap}<\/script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"><\/script>
<style>
  html, body { margin: 0; height: 100%; background: #e5e7eb; font-family: system-ui, -apple-system, Roboto, sans-serif; }
  .wrap { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box; }
  .phone { width: 360px; height: 720px; background: #fff; border: 12px solid #111827; border-radius: ${ios ? 48 : 34}px; box-shadow: 0 20px 50px rgba(0,0,0,.35); overflow: hidden; display: flex; flex-direction: column; position: relative; transform-origin: center center; }
  .status { height: 30px; flex: none; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; font-size: 12px; font-weight: 600; color: #111; background: #f8fafc; }
  .notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: ${ios ? 120 : 14}px; height: ${ios ? 26 : 14}px; background: #111827; border-radius: 0 0 16px 16px; ${ios ? '' : 'top: 8px; border-radius: 50%;'} }
  #root { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  #root > div { flex: 1; }
  .navbar { height: 34px; flex: none; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
  .navbar span { width: ${ios ? '120px; height: 5px; border-radius: 3px' : '18px; height: 18px; border-radius: 50%; border: 2px solid #94a3b8; background: none'}; background: #111827; display: block; }
  .load { margin: auto; color: #64748b; font-size: 14px; }
</style>
</head><body><div class="wrap"><div class="phone" id="phone"><div class="notch"></div>
<div class="status"><span>9:41</span><span>${ios ? '▮▮▮ 🔋' : '▼ ◢ 🔋 100%'}</span></div>
<div id="root"><p class="load">Loading React Native…</p></div>
<div class="navbar"><span></span></div></div></div>
<script>
(function fit(){
  var p = document.getElementById('phone');
  function f(){ var s = Math.min(1, (window.innerHeight - 24) / 744, (window.innerWidth - 24) / 384); p.style.transform = 'scale(' + s + ')'; }
  window.addEventListener('resize', f); f();
})();
<\/script>
<script type="module">
  const src = ${code};
  if (!window.Babel) { console.error('Could not load Babel from the CDN. Check your internet connection.'); }
  else {
    let out;
    try {
      out = Babel.transform(src, { presets: [['react', { runtime: 'automatic' }]], sourceType: 'module', filename: 'App.js' }).code;
    } catch (e) { console.error(e.message); }
    if (out) {
      try {
        const url = URL.createObjectURL(new Blob([out], { type: 'text/javascript' }));
        const [{ AppRegistry }, mod] = await Promise.all([import('react-native'), import(url)]);
        const App = mod.default || mod.App;
        if (!App) console.error('Export your root component: export default function App() { ... }');
        else {
          AppRegistry.registerComponent('main', () => App);
          document.getElementById('root').innerHTML = '';
          AppRegistry.runApplication('main', { rootTag: document.getElementById('root') });
        }
      } catch (e) {
        const msg = String(e && e.message || e);
        console.error(/Failed to resolve module specifier "([^"]+)"/.test(msg)
          ? msg + ' — the playground supports react, react-native, expo-status-bar, @expo/vector-icons and react-native-safe-area-context.'
          : msg);
      }
    }
  }
<\/script></body></html>`;
}

export const PLAYGROUND_LOAD_KEY = 'xlpbi-playground-load';

export function openInPlayground(navigate, pg, title) {
  try { sessionStorage.setItem(PLAYGROUND_LOAD_KEY, JSON.stringify({ ...pg, title })); } catch { /* ignore */ }
  navigate('/tools/playground');
}
