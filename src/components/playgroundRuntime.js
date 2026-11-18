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

export const PLAYGROUND_LOAD_KEY = 'xlpbi-playground-load';

export function openInPlayground(navigate, pg, title) {
  try { sessionStorage.setItem(PLAYGROUND_LOAD_KEY, JSON.stringify({ ...pg, title })); } catch { /* ignore */ }
  navigate('/tools/playground');
}
