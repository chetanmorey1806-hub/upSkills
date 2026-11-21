// Content protection for the whole app (every user, including admin).
//
// Blocks: copy / cut / paste (keyboard, right-click menu, "Copy" buttons that use the clipboard API),
// text selection, dragging text/images, right-click, printing, save-page / view-source shortcuts,
// common DevTools shortcuts, and the PrintScreen key (clipboard is overwritten).
// Screenshots: the page is blurred and covered whenever it loses focus (Snipping Tool / Win+Shift+S,
// switching apps or tabs) and printing shows a blank page.
//
// NOTE: a website cannot stop every screenshot. OS screenshot keys on some systems, phone cameras and screen
// recorders work outside the browser. These measures make copying and capturing much harder, not impossible.
//
// To switch it off (e.g. while developing), set VITE_DISABLE_PROTECTION=true in .env.local.

const OFF = import.meta.env.VITE_DISABLE_PROTECTION === 'true';
const MSG = 'Copying, pasting and screenshots are disabled on UpSkillr.';

let toastEl = null;
let toastTimer = null;
function toast(text = MSG) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'protect-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

let shieldEl = null;
function shield(on) {
  if (!shieldEl) {
    shieldEl = document.createElement('div');
    shieldEl.className = 'protect-shield';
    shieldEl.innerHTML = '<div><b>Content protected</b><span>Screenshots and screen capture are not allowed. Click here to continue.</span></div>';
    shieldEl.addEventListener('click', () => shield(false));
    document.body.appendChild(shieldEl);
  }
  document.documentElement.classList.toggle('protect-blur', on);
  shieldEl.classList.toggle('show', on);
}

function checkFocus() {
  setTimeout(() => { if (!document.hasFocus()) shield(true); }, 60);
}

const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation(); };

// keyboard shortcuts that copy, paste, save, print or open developer tools
function blockedKey(e) {
  const k = (e.key || '').toLowerCase();
  const mod = e.ctrlKey || e.metaKey;
  if (k === 'printscreen' || k === 'f12') return true;
  if (mod && ['c', 'x', 'v', 'p', 's', 'u', 'a'].includes(k) && !(k === 'a' && isEditable(e.target))) return true;
  if (mod && e.shiftKey && ['i', 'j', 'c', 'k', 's'].includes(k)) return true; // DevTools, Firefox screenshot
  if (e.shiftKey && k === 'insert') return true; // paste
  if (mod && k === 'insert') return true; // copy
  return false;
}
function isEditable(el) {
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA)$/.test(el.tagName));
}

function guardDocument(doc, win) {
  if (!doc || doc.__protected) return;
  doc.__protected = true;
  ['copy', 'cut', 'paste'].forEach((t) => doc.addEventListener(t, (e) => { stop(e); toast(); }, true));
  doc.addEventListener('contextmenu', stop, true);
  doc.addEventListener('dragstart', stop, true);
  doc.addEventListener('drop', stop, true);
  doc.addEventListener('selectstart', (e) => { if (!isEditable(e.target)) stop(e); }, true);
  doc.addEventListener('keydown', (e) => {
    if (!blockedKey(e)) return;
    stop(e);
    if ((e.key || '').toLowerCase() === 'printscreen') wipeClipboard(win);
    toast();
  }, true);
  doc.addEventListener('keyup', (e) => {
    if ((e.key || '').toLowerCase() === 'printscreen') { stop(e); wipeClipboard(win); shield(true); toast(); }
  }, true);
  // CSS inside the document (iframes have their own <head>)
  if (doc !== document && doc.head) {
    const st = doc.createElement('style');
    st.textContent = 'html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}input,textarea,[contenteditable="true"]{-webkit-user-select:text;user-select:text}@media print{html,body{display:none!important}}';
    doc.head.appendChild(st);
  }
  patchClipboard(win);
  if (win !== window) {
    win.addEventListener('blur', checkFocus);
    win.addEventListener('focus', () => shield(false));
  }
}

// "Copy" buttons in the app use the clipboard API: make them do nothing
function patchClipboard(win) {
  try {
    const nav = win.navigator;
    if (nav.clipboard && !nav.clipboard.__protected) {
      const deny = () => { toast(); return Promise.reject(new DOMException('Clipboard is disabled', 'NotAllowedError')); };
      ['writeText', 'write', 'readText', 'read'].forEach((m) => {
        try { Object.defineProperty(nav.clipboard, m, { value: deny, configurable: true }); } catch { /* ignore */ }
      });
      nav.clipboard.__protected = true;
    }
    const exec = win.document.execCommand?.bind(win.document);
    if (exec && !win.document.__execPatched) {
      win.document.__execPatched = true;
      win.document.execCommand = (cmd, ...rest) => (/^(copy|cut|paste)$/i.test(cmd) ? (toast(), false) : exec(cmd, ...rest));
    }
  } catch { /* cross-origin or unsupported */ }
}

function wipeClipboard(win) {
  try {
    // the real (unpatched) API is on the prototype
    const proto = Object.getPrototypeOf(win.navigator.clipboard);
    proto.writeText.call(win.navigator.clipboard, MSG).catch(() => {});
  } catch { /* not allowed */ }
}

// same-origin iframes (code playground preview, labs) get the same protection
function guardFrame(frame) {
  const attach = () => {
    try { guardDocument(frame.contentDocument, frame.contentWindow); } catch { /* cross-origin */ }
  };
  frame.addEventListener('load', attach);
  attach();
}

export function installProtection() {
  if (OFF || typeof window === 'undefined' || window.__upskillrProtected) return;
  window.__upskillrProtected = true;
  document.documentElement.classList.add('protect-on');
  guardDocument(document, window);

  document.querySelectorAll('iframe').forEach(guardFrame);
  new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'IFRAME') guardFrame(n);
    n.querySelectorAll?.('iframe').forEach(guardFrame);
  }))).observe(document.documentElement, { childList: true, subtree: true });

  // Hide the content while the page is not focused (Snipping Tool, Win+Shift+S, other apps, tab switch).
  // document.hasFocus() stays true when focus moves into one of our own iframes (code preview).
  window.addEventListener('blur', checkFocus);
  window.addEventListener('focus', () => shield(false));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') shield(true); });
  window.addEventListener('beforeprint', () => { if (!printOk()) shield(true); });
  window.addEventListener('afterprint', () => shield(false));
}

// The one exception to "no printing": the course certificate. Its Print button calls allowPrintOnce(),
// which (only on a /study/certificate/<course> page that contains a .print-allowed element) sets
// html.print-ok for a single print. The protection CSS then prints ONLY the .print-allowed element.
// Ctrl+P and the browser's own Print menu stay blocked everywhere, including on the certificate page.
const printOk = () => document.documentElement.classList.contains('print-ok');
export function allowPrintOnce() {
  if (OFF) { window.print(); return; }
  const route = window.location.hash.replace(/^#/, '').split('?')[0] || window.location.pathname; // HashRouter
  if (!/^\/study\/certificate\/[^/]+\/?$/.test(route) || !document.querySelector('.print-allowed')) { toast('Printing is disabled on UpSkillr.'); return; }
  const root = document.documentElement;
  let timer = null;
  const end = () => { root.classList.remove('print-ok'); window.removeEventListener('afterprint', end); clearTimeout(timer); };
  root.classList.add('print-ok');
  window.addEventListener('afterprint', end);
  timer = setTimeout(end, 120000); // safety net for browsers that never fire afterprint
  window.print();
}
