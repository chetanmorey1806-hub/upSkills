export default {
  id: 'day-49-i18n-and-accessibility',
  title: 'Internationalization (react-i18next) and Accessibility: ARIA, Keyboard Navigation, Focus Management, Screen Readers',
  module: 'Module 10: Advanced Industry Topics',
  day: 49,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Real products ship to users who speak different languages and use different abilities: keyboard-only users, screen-reader users, people with low vision. Today you set up react-i18next (translations, interpolation, plurals, language switcher, Intl number/date formatting for ₹) and make React components accessible with semantic HTML, ARIA, keyboard navigation, focus management and live regions.',
  objectives: [
    'Set up react-i18next with JSON translation files, namespaces and a language switcher',
    'Use interpolation, plurals and Intl formatting (₹, dates) correctly for Indian and global users',
    'Choose semantic HTML first and add ARIA only where needed (roles, states, labels)',
    'Build keyboard-friendly components: tabs with arrow keys, modals with focus trap and focus return',
    'Announce dynamic changes to screen readers with aria-live and test accessibility with real tools',
  ],
  theory: [
    {
      heading: 'i18n, l10n and why companies care',
      content:
        '**Internationalization (i18n)** means preparing the code so it CAN show any language: no hard-coded text, formats that adapt, layouts that survive longer words and right-to-left scripts. **Localization (l10n)** is the actual work of translating to one locale, e.g. `hi-IN` (Hindi, India) or `mr-IN` (Marathi).\n\nAnalogy: i18n is building a TV with an HDMI port; l10n is plugging in the Hindi channel.\n\nIndian companies like Swiggy, PhonePe, Meesho and IRCTC ship apps in Hindi, Marathi, Tamil, Telugu, Bengali and more because most new internet users prefer their mother tongue. In interviews you will be asked how you would add a new language **without touching component code**: the answer is translation keys.\n\nThe most popular library is **react-i18next** (built on i18next). Alternatives: FormatJS / react-intl, LinguiJS, and next-intl for Next.js.',
      points: [
        'Never write user-visible text directly in JSX: use keys like `t("cart.title")`',
        'Keep one JSON file per language per namespace: `locales/hi/common.json`',
        'Format numbers, currency and dates with the built-in `Intl` API, not string concatenation',
        'Plan for text expansion (German is ~30% longer) and RTL (Arabic, Urdu) with `dir="rtl"`',
      ],
    },
    {
      heading: 'Setting up react-i18next',
      content:
        'Install: `npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend`\n\nCreate `src/i18n.js`, import it once in `main.jsx`, and use the `useTranslation()` hook in components. The hook returns `t` (translate function) and `i18n` (to change language). When the language changes, every component using the hook re-renders.\n\nKey features:\n- **Interpolation**: `"welcome": "Namaste, {{name}}!"` then `t("welcome", { name: "Priya" })`\n- **Plurals**: keys `items_one` and `items_other`, called with `t("items", { count })`. i18next uses `Intl.PluralRules` under the hood\n- **Namespaces**: split big apps into `common`, `cart`, `checkout` files and load them lazily\n- **Trans component**: for translations that contain JSX like links or bold text\n- **Language detector**: reads `localStorage`, the `?lng=` query or the browser language',
      syntax: `// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/common.json";
import hi from "./locales/hi/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { common: en }, hi: { common: hi } },
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "mr"],
    interpolation: { escapeValue: false }, // React already escapes
  });

export default i18n;

// Component
import { useTranslation } from "react-i18next";
function Header() {
  const { t, i18n } = useTranslation();
  return (
    <header>
      <h1>{t("welcome", { name: "Priya" })}</h1>
      <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>
    </header>
  );
}`,
      tip: 'Common mistake: building sentences by joining translated pieces, e.g. t("you_have") + count + t("items"). Word order differs between languages. Translate the WHOLE sentence with interpolation.',
    },
    {
      heading: 'Formatting numbers, currency and dates with Intl',
      content:
        'The browser already knows how each locale writes numbers. `Intl.NumberFormat("en-IN")` uses the Indian lakh/crore grouping: `12,50,000`, while `en-US` gives `1,250,000`.\n\n- Currency: `new Intl.NumberFormat("hi-IN", { style: "currency", currency: "INR" }).format(1250)` gives `₹1,250.00`\n- Dates: `new Intl.DateTimeFormat("hi-IN", { dateStyle: "long" }).format(date)`\n- Relative time: `new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day")` gives "yesterday"\n- Lists: `new Intl.ListFormat("en", { type: "conjunction" }).format(["Pune", "Delhi", "Goa"])` gives "Pune, Delhi, and Goa"\n\nAlso set `<html lang="hi">` when the language changes so screen readers pronounce text correctly, and `dir="rtl"` for Arabic/Urdu.',
      syntax: `const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
inr.format(1250000);   // "₹12,50,000.00"
document.documentElement.lang = i18n.language;  // keep <html lang> in sync`,
    },
    {
      heading: 'Accessibility (a11y): semantic HTML first, ARIA second',
      content:
        'About 1 in 6 people live with a disability. Accessibility is also a **legal requirement** in many countries (ADA in the US, the European Accessibility Act, and India\'s RPwD Act 2016 with GIGW guidelines for government sites). The standard is **WCAG 2.2** level AA.\n\nThe first rule of ARIA: **if a native HTML element does the job, use it.** A `<button>` is focusable, clickable with Enter and Space, and announced as "button" for free. A `<div onClick>` is none of these.\n\nARIA adds three things to elements:\n1. **Roles**: what it is (`role="tablist"`, `role="dialog"`, `role="alert"`)\n2. **States/properties**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-describedby`\n3. **Names**: `aria-label`, `aria-labelledby` for elements without visible text (icon buttons)\n\nIn JSX, ARIA attributes keep their dashes: `aria-label`, `aria-expanded={open}`.',
      points: [
        'Every form input needs a `<label htmlFor>` (or aria-label). Placeholder is NOT a label',
        'Icon-only buttons need `aria-label="Close"`',
        'Images: meaningful `alt`, or `alt=""` for decorative ones',
        'Colour contrast at least 4.5:1 for normal text; never use colour alone to show errors',
        'Use one `<h1>` and logical heading order; landmarks `<header> <nav> <main> <footer>`',
      ],
      tip: 'Bad ARIA is worse than no ARIA. role="button" on a div still needs tabIndex={0} and Enter/Space handlers. Just use <button>.',
    },
    {
      heading: 'Keyboard navigation and focus management',
      content:
        'Many users never touch a mouse. Test every screen with **Tab, Shift+Tab, Enter, Space, Escape and Arrow keys**.\n\n- **Visible focus**: never write `outline: none` without a replacement. Use `:focus-visible` styles\n- **tabIndex**: `0` = reachable in normal order, `-1` = focusable only by code (`ref.current.focus()`), positive numbers = avoid\n- **Roving tabindex**: in a group like tabs or a toolbar, only the active item has `tabIndex=0`; arrow keys move focus inside the group\n- **Modals**: move focus into the dialog on open, **trap** Tab inside it, close with Escape, and **return focus** to the button that opened it\n- **Route changes in SPAs**: after navigation move focus to the new page `<h1>` (with `tabIndex={-1}`) so screen-reader users know the page changed\n- **Skip link**: "Skip to main content" as the first focusable element\n\nIn React, focus management is done with `useRef` + `useEffect`. The native `<dialog>` element with `showModal()` gives you a focus trap and Escape for free in modern browsers.',
      syntax: `const closeRef = useRef(null);
const openerRef = useRef(null);
useEffect(() => {
  if (open) closeRef.current?.focus();      // focus into dialog
  else openerRef.current?.focus();          // return focus
}, [open]);`,
    },
    {
      heading: 'Screen readers, live regions and testing tools',
      content:
        'Screen readers (NVDA and JAWS on Windows, VoiceOver on Mac/iPhone, TalkBack on Android) read the **accessibility tree** that the browser builds from your HTML and ARIA.\n\nDynamic updates (toast messages, "Added to cart", form errors, search result counts) are silent unless you use a **live region**: `<div aria-live="polite">` announces changes when the user is idle; `role="alert"` (assertive) interrupts immediately, use it only for errors. The live region element must exist in the DOM **before** the text changes.\n\nA `.sr-only` CSS class hides text visually but keeps it for screen readers.\n\n**Testing tools used in companies:**\n- `eslint-plugin-jsx-a11y` catches missing alt, labels and bad roles while coding\n- Lighthouse and axe DevTools browser extension for automated audits\n- `jest-axe` / `vitest-axe` in unit tests; `@axe-core/playwright` in E2E\n- React Testing Library queries like `getByRole("button", { name: "Save" })` fail if your markup is not accessible (Day 53)\n- Manual test: unplug the mouse, and turn on NVDA or VoiceOver for 10 minutes',
      tip: 'Automated tools catch only about 30-40% of issues. Keyboard-only and screen-reader testing by a human is still required.',
    },
  ],
  examples: [
    {
      title: 'Mini i18n: language switcher, interpolation, plurals and ₹ formatting',
      scenario: 'A product card for an Indian shopping app that switches between English, Hindi and Marathi. Real code uses react-i18next; the playground uses a small hand-written useTranslation hook with the same API.',
      steps: [
        'Create locales/en/common.json, locales/hi/common.json, locales/mr/common.json with the same keys',
        'Initialise i18next in src/i18n.js and import it in main.jsx',
        'Use const { t, i18n } = useTranslation() in the component',
        'Use t("cart.items", { count }) for plurals and Intl.NumberFormat for prices',
        'Run the playground and switch languages; change the quantity to see plural forms',
      ],
      code: `// locales/en/common.json
{
  "welcome": "Hello, {{name}}!",
  "cart": { "items_one": "{{count}} item in cart", "items_other": "{{count}} items in cart", "add": "Add to cart" },
  "price": "Price: {{value}}"
}
// locales/hi/common.json
{
  "welcome": "नमस्ते, {{name}}!",
  "cart": { "items_one": "कार्ट में {{count}} आइटम", "items_other": "कार्ट में {{count}} आइटम", "add": "कार्ट में जोड़ें" },
  "price": "कीमत: {{value}}"
}

// ProductCard.jsx
import { useTranslation } from "react-i18next";
export function ProductCard({ product, count, onAdd }) {
  const { t, i18n } = useTranslation();
  const price = new Intl.NumberFormat(i18n.language + "-IN", { style: "currency", currency: "INR" }).format(product.price);
  return (
    <article>
      <h2>{product.name}</h2>
      <p>{t("price", { value: price })}</p>
      <button onClick={onAdd}>{t("cart.add")}</button>
      <p>{t("cart.items", { count })}</p>
    </article>
  );
}`,
      playground: {
        jsx: `const { useState, createContext, useContext, useEffect } = React;

// ---- tiny i18next-like setup (plain React version) ----
const resources = {
  en: { welcome: "Hello, {{name}}!", price: "Price: {{value}}", add: "Add to cart",
        items_one: "{{count}} item in cart", items_other: "{{count}} items in cart",
        delivery: "Delivery to {{city}} by {{date}}" },
  hi: { welcome: "नमस्ते, {{name}}!", price: "कीमत: {{value}}", add: "कार्ट में जोड़ें",
        items_one: "कार्ट में {{count}} आइटम", items_other: "कार्ट में {{count}} आइटम",
        delivery: "{{city}} में डिलीवरी {{date}} तक" },
  mr: { welcome: "नमस्कार, {{name}}!", price: "किंमत: {{value}}", add: "कार्टमध्ये टाका",
        items_one: "कार्टमध्ये {{count}} वस्तू", items_other: "कार्टमध्ये {{count}} वस्तू",
        delivery: "{{city}} येथे {{date}} पर्यंत डिलिव्हरी" },
};

const I18nContext = createContext(null);

function I18nProvider({ children }) {
  const [lng, setLng] = useState("en");
  useEffect(() => { document.documentElement.lang = lng; }, [lng]);
  function t(key, vars = {}) {
    let k = key;
    if (typeof vars.count === "number") {
      const form = new Intl.PluralRules(lng).select(vars.count); // "one" | "other"
      k = resources[lng][key + "_" + form] ? key + "_" + form : key + "_other";
    }
    const str = resources[lng][k] ?? resources.en[k] ?? key;  // fallback to English, then key
    return str.replace(/{{(\\w+)}}/g, (_, name) => vars[name] ?? "");
  }
  const i18n = { language: lng, changeLanguage: setLng };
  return <I18nContext.Provider value={{ t, i18n }}>{children}</I18nContext.Provider>;
}
const useTranslation = () => useContext(I18nContext);

// ---- app code: looks exactly like react-i18next code ----
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <label>Language:{" "}
      <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </label>
  );
}

function ProductCard() {
  const { t, i18n } = useTranslation();
  const [count, setCount] = useState(1);
  const locale = i18n.language + "-IN";
  const price = new Intl.NumberFormat(locale, { style: "currency", currency: "INR" }).format(124999);
  const date = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" })
    .format(new Date(Date.now() + 2 * 864e5));
  return (
    <article className="card">
      <h2>{t("welcome", { name: "Priya" })}</h2>
      <h3>Laptop Pro 14</h3>
      <p>{t("price", { value: price })}</p>
      <p>{t("delivery", { city: "Pune", date })}</p>
      <button onClick={() => setCount(c => c + 1)}>{t("add")}</button>
      <button onClick={() => setCount(c => Math.max(0, c - 1))} aria-label="Remove one">−</button>
      <p aria-live="polite">{t("items", { count })}</p>
    </article>
  );
}

function App() {
  return (
    <I18nProvider>
      <LanguageSwitcher />
      <ProductCard />
    </I18nProvider>
  );
}`,
        css: `.card { border: 1px solid #ddd; border-radius: 12px; padding: 14px 18px; margin-top: 12px; max-width: 360px; }
button { margin-right: 6px; padding: 6px 12px; }
select { padding: 4px; }`,
      },
      result: 'Switching the language updates every text, the price shows Indian grouping (₹1,24,999.00), the date is written in the selected language and the item count uses the correct plural form.',
      explanation:
        'This is a plain-React version of react-i18next: a context holds the language, t() looks up keys, replaces {{placeholders}} and picks _one/_other with Intl.PluralRules, exactly like i18next. Missing keys fall back to English. In a real project you delete the provider code and import useTranslation from "react-i18next"; the component code stays the same.',
    },
    {
      title: 'Accessible tabs with roving tabindex and arrow keys',
      scenario: 'A product page has Description / Specifications / Reviews tabs. Keyboard users must move between tabs with arrow keys, and screen readers must announce "tab, 1 of 3, selected".',
      steps: [
        'Use role="tablist" on the wrapper, role="tab" on each button and role="tabpanel" on the content',
        'Connect them with id, aria-controls and aria-labelledby',
        'Only the selected tab gets tabIndex={0}; others get -1 (roving tabindex)',
        'Handle ArrowLeft, ArrowRight, Home and End in onKeyDown and move focus with refs',
        'Press Tab to reach the tabs, then use the arrow keys',
      ],
      code: `function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  function onKeyDown(e) {
    const last = tabs.length - 1;
    let next = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next !== null) { e.preventDefault(); setActive(next); refs.current[next].focus(); }
  }
  return (
    <div>
      <div role="tablist" aria-label="Product details" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button key={tab.id} role="tab" id={"tab-" + tab.id} aria-selected={i === active}
            aria-controls={"panel-" + tab.id} tabIndex={i === active ? 0 : -1}
            ref={el => (refs.current[i] = el)} onClick={() => setActive(i)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={"panel-" + tabs[active].id} aria-labelledby={"tab-" + tabs[active].id} tabIndex={0}>
        {tabs[active].content}
      </div>
    </div>
  );
}`,
      playground: {
        jsx: `const { useState, useRef } = React;

const TABS = [
  { id: "desc", label: "Description", content: "Lightweight 14-inch laptop, 1.3 kg, ideal for students and developers." },
  { id: "spec", label: "Specifications", content: "16 GB RAM · 512 GB SSD · 12-hour battery · Wi-Fi 6E · 2 year warranty" },
  { id: "rev", label: "Reviews (128)", content: "★★★★☆ 4.4 average. 'Great value for money' – Rahul, Nagpur" },
];

function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  function onKeyDown(e) {
    const last = tabs.length - 1;
    let next = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      refs.current[next].focus();
    }
  }

  return (
    <div>
      <div role="tablist" aria-label="Product details" className="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            id={"tab-" + tab.id}
            aria-selected={i === active}
            aria-controls={"panel-" + tab.id}
            tabIndex={i === active ? 0 : -1}
            ref={el => (refs.current[i] = el)}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={"panel-" + tabs[active].id} aria-labelledby={"tab-" + tabs[active].id} tabIndex={0} className="panel">
        {tabs[active].content}
      </div>
    </div>
  );
}

function App() {
  return (
    <main>
      <a href="#after">Link before the tabs (press Tab from here)</a>
      <h1>Laptop Pro 14</h1>
      <Tabs tabs={TABS} />
      <p id="after"><a href="#">Link after the tabs</a></p>
    </main>
  );
}`,
        css: `.tablist { display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; }
[role="tab"] { border: none; background: #f3f4f6; padding: 8px 14px; border-radius: 8px 8px 0 0; cursor: pointer; }
[role="tab"][aria-selected="true"] { background: #4f46e5; color: white; }
[role="tab"]:focus-visible, .panel:focus-visible, a:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
.panel { padding: 14px; border: 1px solid #e5e7eb; border-top: none; }`,
      },
      result: 'Tab moves focus into the tab list once (onto the selected tab); Arrow keys, Home and End switch tabs; the next Tab goes to the panel, then to the next link. The selected tab is styled using the aria-selected attribute.',
      explanation:
        'Roving tabindex keeps the whole tab list as ONE Tab stop, which is what the WAI-ARIA Authoring Practices recommend. Styling with [aria-selected="true"] guarantees the visual state and the announced state never go out of sync. :focus-visible shows a clear focus ring only for keyboard users.',
    },
    {
      title: 'Accessible modal: focus in, focus trap, Escape and focus return',
      scenario: 'A "Delete address" confirm dialog. Keyboard focus must not escape behind the modal, Escape must close it, and focus must go back to the button that opened it.',
      steps: [
        'Render the dialog with role="dialog", aria-modal="true" and aria-labelledby pointing to its heading',
        'On open, focus the first button with a ref inside useEffect',
        'On keydown: Escape closes; Tab on the last element wraps to the first (and Shift+Tab the reverse)',
        'On close, focus the opener button again',
        'Open the dialog and try Tab, Shift+Tab and Escape',
      ],
      code: `// Production tip: the native <dialog> element gives focus trapping and Escape for free
const ref = useRef(null);
useEffect(() => { open ? ref.current.showModal() : ref.current.close(); }, [open]);
return (
  <dialog ref={ref} onClose={onClose} aria-labelledby="dlg-title">
    <h2 id="dlg-title">Delete address?</h2>
    <button onClick={onClose}>Cancel</button>
    <button onClick={onConfirm}>Delete</button>
  </dialog>
);`,
      playground: {
        jsx: `const { useState, useRef, useEffect } = React;

function ConfirmDialog({ open, title, children, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) firstRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function onKeyDown(e) {
    if (e.key === "Escape") { e.stopPropagation(); onCancel(); return; }
    if (e.key !== "Tab") return;
    const focusables = dialogRef.current.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className="backdrop" onMouseDown={onCancel}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-desc"
        className="dialog" onKeyDown={onKeyDown} onMouseDown={e => e.stopPropagation()}>
        <h2 id="dlg-title">{title}</h2>
        <p id="dlg-desc">{children}</p>
        <button ref={firstRef} onClick={onCancel}>Cancel</button>
        <button className="danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const openerRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !open) openerRef.current?.focus(); // return focus
    wasOpen.current = open;
  }, [open]);

  return (
    <main>
      <h1>Saved addresses</h1>
      <p>Flat 302, Shanti Nagar, Pune 411014</p>
      <button ref={openerRef} onClick={() => setOpen(true)}>Delete address</button>
      <button>Edit address</button>
      <p role="status" aria-live="polite">{status}</p>
      <ConfirmDialog
        open={open}
        title="Delete this address?"
        onCancel={() => { setOpen(false); setStatus("Cancelled."); }}
        onConfirm={() => { setOpen(false); setStatus("Address deleted."); }}
      >
        This cannot be undone.
      </ConfirmDialog>
    </main>
  );
}`,
        css: `.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; }
.dialog { background: white; padding: 18px 22px; border-radius: 12px; width: min(90vw, 340px); }
button { margin-right: 8px; padding: 8px 14px; }
.danger { background: #dc2626; color: white; border: none; border-radius: 6px; }
button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }`,
      },
      result: 'Opening the dialog moves focus to Cancel. Tab and Shift+Tab cycle only between Cancel and Delete. Escape or a backdrop click closes it, focus returns to "Delete address", and the status line is announced politely.',
      explanation:
        'Three focus rules make a modal accessible: move focus in, keep it in, give it back. aria-modal and role="dialog" tell screen readers the rest of the page is inert, and aria-labelledby/aria-describedby give the dialog its announced name and description. In production prefer the native <dialog> with showModal() or a tested library (Radix UI, Headless UI, MUI) that already handles this.',
    },
    {
      title: 'Accessible form errors with labels, aria-invalid and a live region',
      scenario: 'A mobile number form for an OTP login. Errors must be announced by screen readers and linked to the input, not shown only in red.',
      steps: [
        'Give the input a real <label htmlFor>',
        'On invalid submit set aria-invalid="true" and aria-describedby to the error id',
        'Render the error with role="alert" so it is announced immediately',
        'Move focus to the invalid field',
        'Submit an empty or 9-digit number to see the error',
      ],
      code: `<label htmlFor="mobile">Mobile number</label>
<input id="mobile" type="tel" inputMode="numeric" autoComplete="tel"
  aria-invalid={!!error} aria-describedby={error ? "mobile-error" : "mobile-hint"} />
<p id="mobile-hint">10 digits, without +91</p>
{error && <p id="mobile-error" role="alert">⚠ {error}</p>}`,
      playground: {
        jsx: `const { useState, useRef } = React;

function App() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef(null);

  function onSubmit(e) {
    e.preventDefault();
    if (!/^[6-9]\\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
      setSent(false);
      inputRef.current.focus();
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1>Login with OTP</h1>
      <label htmlFor="mobile">Mobile number</label>
      <input
        id="mobile" ref={inputRef} type="tel" inputMode="numeric" autoComplete="tel"
        value={mobile} onChange={e => setMobile(e.target.value.replace(/\\D/g, "").slice(0, 10))}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "mobile-error" : "mobile-hint"}
      />
      <p id="mobile-hint" className="hint">10 digits, without +91</p>
      {error && <p id="mobile-error" role="alert" className="error">⚠ {error}</p>}
      <button type="submit">Send OTP</button>
      <p role="status" aria-live="polite">{sent ? "OTP sent to +91 " + mobile : ""}</p>
    </form>
  );
}`,
        css: `label { display: block; font-weight: 600; margin-bottom: 4px; }
input { padding: 8px; font-size: 16px; width: 220px; border: 2px solid #9ca3af; border-radius: 6px; }
input[aria-invalid="true"] { border-color: #dc2626; }
.hint { color: #4b5563; font-size: 14px; margin: 4px 0; }
.error { color: #b91c1c; font-weight: 600; }
button { padding: 8px 14px; margin-top: 6px; }`,
      },
      result: 'An invalid number shows a red border AND an icon + text error that is announced; focus returns to the input. A valid number like 9876543210 shows "OTP sent".',
      explanation:
        'aria-describedby links the input to its hint or error, so a screen reader reads "Mobile number, edit, invalid entry, Enter a valid 10-digit..." when focused. The error uses text and an icon, not only colour. inputMode="numeric" opens the number keypad on phones.',
    },
  ],
  interview: [
    { q: 'What is the difference between i18n and l10n?', a: 'Internationalization (i18n) is engineering the app so it can support any language/region: externalised strings, locale-aware formatting, RTL support. Localization (l10n) is adapting it to a specific locale: translating strings, local formats, images, legal text.', level: 'Easy' },
    { q: 'How does react-i18next work in a React app?', a: 'You initialise i18next with resources (or a backend that loads JSON), plug in initReactI18next, and components call useTranslation() to get t() and i18n. t("key", vars) looks up the current language with fallback; i18n.changeLanguage() triggers a re-render of all components that use the hook.', level: 'Medium' },
    { q: 'How do you handle plurals and why not just use count === 1?', a: 'Use the library plural support (key_one, key_other, plus key_few/key_many for languages that need them), which relies on Intl.PluralRules. Languages have different plural categories (Arabic has six, Russian has few/many), so a simple count === 1 check is wrong for many locales.', level: 'Medium' },
    { q: 'How would you format ₹12,50,000 correctly?', a: 'new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(1250000). The en-IN locale uses lakh/crore grouping. Never build it by hand with string concatenation.', level: 'Easy' },
    { q: 'How do you lazy-load translations in a big app?', a: 'Split translations into namespaces (common, checkout, admin), load them with i18next-http-backend from /locales/{{lng}}/{{ns}}.json, call useTranslation("checkout") in the feature, and wrap with Suspense (react-i18next suspends while loading) so only the needed files are downloaded.', level: 'Hard' },
    { q: 'What is the first rule of ARIA?', a: 'Do not use ARIA if a native HTML element or attribute already gives the semantics and behaviour you need. A <button> beats <div role="button" tabIndex=0 onKeyDown=...>. ARIA changes only what is announced, not behaviour.', level: 'Easy' },
    { q: 'aria-label vs aria-labelledby vs aria-describedby?', a: 'aria-label gives an accessible name as a string (for icon buttons). aria-labelledby points to the id of visible text that names the element (preferred when visible text exists). aria-describedby points to extra descriptive text like hints or errors, read after the name.', level: 'Medium' },
    { q: 'How do you make a custom modal accessible?', a: 'role="dialog" and aria-modal="true", aria-labelledby to its title, move focus into it on open, trap Tab/Shift+Tab inside, close on Escape, make background inert, and return focus to the opener on close. Or use native <dialog> with showModal(), or a library like Radix UI.', level: 'Hard' },
    { q: 'What is roving tabindex?', a: 'A pattern for composite widgets (tabs, menus, toolbars, grids): only one item has tabIndex=0 so the widget is a single Tab stop; the others have -1, and arrow keys move focus and update which item is 0.', level: 'Medium' },
    { q: 'How do you announce dynamic content to screen readers?', a: 'Use live regions: aria-live="polite" (or role="status") for non-urgent updates like "Added to cart", role="alert" / aria-live="assertive" for urgent errors. The region must already exist in the DOM before its text changes.', level: 'Medium' },
    { q: 'How do you handle focus on route changes in a SPA?', a: 'Browsers do not reset focus on client-side navigation, so after the route changes move focus to the main heading (h1 with tabIndex=-1) or a skip target, update document.title, and optionally announce the new page in a live region.', level: 'Hard' },
    { q: 'Which tools do you use to test accessibility?', a: 'eslint-plugin-jsx-a11y during development, axe DevTools and Lighthouse audits, jest-axe/vitest-axe in unit tests, @axe-core/playwright in E2E, React Testing Library getByRole queries, and manual keyboard + screen reader (NVDA, VoiceOver, TalkBack) testing.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a "dir" (RTL) switch: add an Urdu entry to a tiny translation table and set document.documentElement.dir to "rtl" when Urdu is selected.',
      hint: 'Keep a list of RTL languages and update lang and dir in a useEffect.',
      solution: `const { useState, useEffect } = React;
const RES = { en: { hello: "Welcome to our store" }, ur: { hello: "ہمارے اسٹور میں خوش آمدید" } };
const RTL = ["ur", "ar"];
function App() {
  const [lng, setLng] = useState("en");
  useEffect(() => {
    document.documentElement.lang = lng;
    document.documentElement.dir = RTL.includes(lng) ? "rtl" : "ltr";
  }, [lng]);
  return (
    <div>
      <select value={lng} onChange={e => setLng(e.target.value)}>
        <option value="en">English</option>
        <option value="ur">اردو</option>
      </select>
      <h1>{RES[lng].hello}</h1>
    </div>
  );
}`,
    },
    {
      task: 'Write a formatINR(amount, compact) helper and show 1250, 125000, 12500000 in normal and compact form (₹1.25 lakh style).',
      hint: 'Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact" }).',
      solution: `function formatINR(amount, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: compact ? 2 : 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}
function App() {
  const values = [1250, 125000, 12500000];
  return (
    <table>
      <tbody>
        {values.map(v => <tr key={v}><td>{formatINR(v)}</td><td>{formatINR(v, true)}</td></tr>)}
      </tbody>
    </table>
  );
}
// ₹1,250 | ₹1.25K ; ₹1,25,000 | ₹1.25L ; ₹1,25,00,000 | ₹1.25Cr`,
    },
    {
      task: 'Build an accessible accordion (FAQ) where each header is a <button> with aria-expanded and aria-controls, and the panel has role="region".',
      hint: 'Wrap the button inside a heading (h3). Toggle an open id in state.',
      solution: `const { useState } = React;
const FAQ = [
  { id: "ret", q: "What is the return policy?", a: "Return within 7 days of delivery." },
  { id: "cod", q: "Is Cash on Delivery available?", a: "Yes, for orders up to ₹50,000." },
];
function App() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {FAQ.map(item => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button id={"btn-" + item.id} aria-expanded={isOpen} aria-controls={"sec-" + item.id}
                onClick={() => setOpen(isOpen ? null : item.id)}>
                {isOpen ? "▾ " : "▸ "}{item.q}
              </button>
            </h3>
            <div id={"sec-" + item.id} role="region" aria-labelledby={"btn-" + item.id} hidden={!isOpen}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}`,
    },
    {
      task: 'Add a "Skip to main content" link that is hidden until focused, and move focus to the main heading when a fake route changes.',
      hint: 'Use a .skip-link class with a negative top that becomes 0 on :focus; give the h1 tabIndex={-1} and focus it in an effect depending on the page.',
      solution: `const { useState, useEffect, useRef } = React;
function App() {
  const [page, setPage] = useState("Home");
  const h1Ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    document.title = page + " | ShopKart";
    if (first.current) { first.current = false; return; }
    h1Ref.current.focus();
  }, [page]);
  return (
    <div>
      <style>{".skip-link{position:absolute;left:8px;top:-40px;background:#111;color:#fff;padding:6px}.skip-link:focus{top:8px}"}</style>
      <a className="skip-link" href="#main">Skip to main content</a>
      <nav>{["Home", "Orders", "Profile"].map(p => <button key={p} onClick={() => setPage(p)} aria-current={p === page ? "page" : undefined}>{p}</button>)}</nav>
      <main id="main"><h1 ref={h1Ref} tabIndex={-1}>{page}</h1><p>Content of {page}.</p></main>
    </div>
  );
}`,
    },
    {
      task: 'Make a "Copy coupon" icon button accessible and announce "Coupon DIWALI50 copied" in a polite live region.',
      hint: 'aria-label on the icon button; a role="status" element that is always rendered.',
      solution: `const { useState } = React;
function App() {
  const [msg, setMsg] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText("DIWALI50"); } catch {}
    setMsg("Coupon DIWALI50 copied");
    setTimeout(() => setMsg(""), 3000);
  }
  return (
    <div>
      <code>DIWALI50</code>{" "}
      <button aria-label="Copy coupon code DIWALI50" onClick={copy}><span aria-hidden="true">📋</span></button>
      <p role="status" aria-live="polite">{msg}</p>
    </div>
  );
}`,
    },
  ],
  quiz: [
    { question: 'In react-i18next, how do you switch the app to Hindi?', options: ['t.setLanguage("hi")', 'i18n.changeLanguage("hi")', 'useTranslation("hi")', 'document.lang = "hi"'], answer: 1, explanation: 'i18n.changeLanguage() changes the language and re-renders components that use useTranslation.' },
    { question: 'Which Intl call gives the Indian grouping ₹12,50,000?', options: ['Intl.NumberFormat("en-US", { currency: "INR" })', 'Number.toFixed(2)', 'Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })', 'String(1250000).replace(",", "")'], answer: 2, explanation: 'The en-IN locale uses lakh/crore grouping and the currency style adds ₹.' },
    { question: 'Which is the MOST accessible way to make a clickable "Save" control?', options: ['<div onClick={save}>Save</div>', '<span role="button">Save</span>', '<a onClick={save}>Save</a>', '<button onClick={save}>Save</button>'], answer: 3, explanation: 'Native <button> is focusable, keyboard operable and announced correctly with no extra work.' },
    { question: 'A toast says "Added to cart". How should screen readers hear it?', options: ['Put it inside an aria-live="polite" region that already exists in the DOM', 'Use alert() in JavaScript', 'Give it tabIndex={0}', 'Nothing is needed'], answer: 0, explanation: 'Live regions announce content changes; polite waits until the user is idle.' },
    { question: 'What should happen to focus when an accessible modal closes?', options: ['Move to the top of the page', 'Return to the element that opened the modal', 'Stay on the body', 'Move to the browser address bar'], answer: 1, explanation: 'Returning focus to the opener keeps keyboard and screen-reader users in context.' },
  ],
};
