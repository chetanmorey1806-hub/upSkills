export default {
  id: 'day-48-animations-framer-motion',
  title: 'Animations with Framer Motion: motion Components, Variants, AnimatePresence, Page Transitions and Gestures',
  module: 'Module 10: Advanced Industry Topics',
  day: 48,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Good animation makes an app feel fast and understandable: a cart badge that pops, a list that slides in, a modal that fades out instead of vanishing. You will learn Framer Motion (now published as the `motion` package): motion components, animate/initial/exit, variants with stagger, AnimatePresence for exit animations, route page transitions, and gestures like hover, tap and drag, plus the performance and accessibility rules companies follow.',
  objectives: [
    'Animate elements with motion components using initial, animate, exit and transition',
    'Organise animations with variants and stagger children in lists',
    'Animate components as they leave the DOM with AnimatePresence and keys',
    'Add page transitions to React Router and gestures (whileHover, whileTap, drag)',
    'Follow animation best practices: transform/opacity only, short durations, prefers-reduced-motion',
  ],
  theory: [
    {
      heading: 'Why animate, and what the industry uses',
      content:
        'Animation in product UI is about **communication**, not decoration:\n- **Feedback**: a button shrinks slightly when tapped, a cart icon bounces when an item is added\n- **Continuity**: a modal grows from the card you clicked, a deleted row slides away so you see what changed\n- **Attention**: a toast slides in from the corner\n- **Perceived speed**: skeletons that shimmer, content that fades in smoothly\n\nOptions:\n- **CSS transitions / keyframes**: perfect for hover effects and simple state changes; zero JS\n- **Framer Motion** (`npm install motion`, import from `motion/react`; the older package name `framer-motion` still works): declarative React API, exit animations, layout animations, gestures, springs. Used by Vercel, Stripe-style landing pages and many dashboards\n- **GSAP**: timeline-heavy marketing animations; **Lottie**: designer-made After Effects animations; **React Spring**: physics-based alternative\n\nAnalogy: CSS transitions are a light switch with a dimmer. Framer Motion is a stage director who also controls how actors **enter and leave** the stage.',
      tip: 'Rule of thumb from design systems (Material, Apple HIG): UI animations should be 150-300 ms. Longer feels slow; users repeat these actions hundreds of times a day.',
    },
    {
      heading: 'motion components: initial, animate, transition',
      content:
        'Every HTML/SVG element has a motion version: `motion.div`, `motion.button`, `motion.li`, `motion.svg`. They accept normal props plus animation props:\n\n- `initial`: the starting state (`{ opacity: 0, y: 20 }`), or `false` to skip the first animation\n- `animate`: the target state; whenever its values change, Motion animates to them\n- `transition`: how: `{ duration: 0.3, ease: \'easeOut\' }` (tween) or `{ type: \'spring\', stiffness: 300, damping: 20 }`\n- Shorthand transform keys: `x`, `y`, `scale`, `rotate` (no need to write transform strings)\n\nBy default Motion uses **springs** for physical values like x/scale and tweens for opacity/colour, which feels natural.',
      syntax:
        "import { motion } from 'motion/react';\n\nexport function FadeInCard({ children }) {\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      transition={{ duration: 0.3, ease: 'easeOut' }}\n      className=\"card\"\n    >\n      {children}\n    </motion.div>\n  );\n}\n\n// animate reacts to state\n<motion.div animate={{ rotate: isOpen ? 180 : 0 }} />",
    },
    {
      heading: 'Variants and staggered lists',
      content:
        '**Variants** are named animation states defined in an object, like CSS classes for animation: `{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }`. You then write `initial="hidden" animate="visible"`.\n\nThe power: variant names **propagate to children**. If a parent `motion.ul` animates to "visible", every child `motion.li` with the same variant names animates too, without repeating props. The parent can orchestrate with `transition: { staggerChildren: 0.06, delayChildren: 0.1 }`, so list items appear one after another (the classic product grid entrance).\n\nKeep variants in a separate file (`src/lib/motionVariants.js`) so the whole app shares the same feel: `fadeUp`, `scaleIn`, `listContainer`.',
      syntax:
        "const list = {\n  hidden: {},\n  visible: { transition: { staggerChildren: 0.06 } },\n};\nconst item = {\n  hidden: { opacity: 0, y: 12 },\n  visible: { opacity: 1, y: 0 },\n};\n\n<motion.ul variants={list} initial=\"hidden\" animate=\"visible\">\n  {products.map(p => (\n    <motion.li key={p.id} variants={item}>{p.title}</motion.li>\n  ))}\n</motion.ul>",
    },
    {
      heading: 'AnimatePresence: animating things that leave',
      content:
        'React removes an element from the DOM immediately when it stops rendering, so there is no time for an exit animation. **AnimatePresence** solves this: it keeps the removed child in the DOM until its `exit` animation finishes.\n\nRules:\n1. Wrap the conditional element (or list) in `<AnimatePresence>`\n2. Give the motion child an `exit` prop: `exit={{ opacity: 0, scale: 0.95 }}`\n3. Every direct child needs a **unique, stable `key`** (that is how it detects removal)\n4. `mode="wait"`: wait for the old child to exit before the new one enters (great for page or step transitions); `mode="popLayout"` for lists\n5. `initial={false}` on AnimatePresence skips enter animations on first page load\n\nUse cases: modals, toasts, dropdowns, deleting list items, tab content, wizard steps (Day 47).',
      syntax:
        "import { AnimatePresence, motion } from 'motion/react';\n\n<AnimatePresence>\n  {isOpen && (\n    <motion.div\n      key=\"modal\"\n      className=\"modal\"\n      initial={{ opacity: 0, scale: 0.95 }}\n      animate={{ opacity: 1, scale: 1 }}\n      exit={{ opacity: 0, scale: 0.95 }}\n      transition={{ duration: 0.2 }}\n    />\n  )}\n</AnimatePresence>",
      tip: 'Common bug: putting AnimatePresence INSIDE the conditional ({isOpen && <AnimatePresence>...}). Then AnimatePresence itself is removed and cannot run the exit. It must stay mounted.',
    },
    {
      heading: 'Page transitions and gestures',
      content:
        '**Page transitions** with React Router 7: wrap the routes in `AnimatePresence mode="wait"`, key the animated wrapper by `location.pathname`, and give each page initial/animate/exit. With `<Outlet />` layouts, use `useOutlet()` to grab the element so the old page can stay while exiting.\n\n**Gestures** are built in:\n- `whileHover={{ scale: 1.03 }}`, `whileTap={{ scale: 0.97 }}`: instant tactile feedback on buttons and cards\n- `whileFocus`, `whileInView` (animate when scrolled into view, with `viewport={{ once: true }}`)\n- `drag`, `drag="x"`, `dragConstraints`, `onDragEnd` with `info.offset` / `info.velocity`: swipe-to-delete rows, swipeable cards, bottom sheets\n\n**Layout animations**: add `layout` to a motion element and Motion smoothly animates size/position changes (reordering lists, expanding cards). `layoutId` shares an element between two components (a tab underline sliding between tabs, a product image expanding to a detail view).',
      syntax:
        "// App.jsx\nimport { useLocation, Routes, Route } from 'react-router';\nimport { AnimatePresence, motion } from 'motion/react';\n\nconst page = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };\n\nexport default function AnimatedRoutes() {\n  const location = useLocation();\n  return (\n    <AnimatePresence mode=\"wait\">\n      <motion.main key={location.pathname} {...page} transition={{ duration: 0.25 }}>\n        <Routes location={location}>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/products\" element={<Products />} />\n        </Routes>\n      </motion.main>\n    </AnimatePresence>\n  );\n}",
    },
    {
      heading: 'Performance, accessibility and the playground note',
      content:
        '**Performance**: animate only `transform` (x, y, scale, rotate) and `opacity`. These run on the GPU compositor. Animating `width`, `height`, `top`, `left`, `margin` or `box-shadow` forces layout/paint on every frame and janks on budget Android phones (a big share of Indian users). Use `layout` animations instead of animating width/height manually. Avoid animating hundreds of elements at once; lazy-load the motion library on routes that need it, or use `LazyMotion` + `m` components to cut bundle size.\n\n**Accessibility**: some users get dizzy from motion (vestibular disorders) and set "Reduce motion" in their OS. Respect it:\n- CSS: `@media (prefers-reduced-motion: reduce) { * { animation: none; transition: none; } }`\n- Motion: `<MotionConfig reducedMotion="user">` at the app root, or the `useReducedMotion()` hook to swap slides for fades\n- Never hide important information inside an animation, and avoid flashing more than 3 times per second\n\nThe playground cannot import Motion, so the examples use **CSS transitions, keyframes and small React hooks** that reproduce the same ideas (a mini AnimatePresence, staggered variants, drag with pointer events). The `code` blocks contain the real Motion code.\n\nComing next: Day 49 covers internationalization and accessibility in depth.',
    },
  ],
  examples: [
    {
      title: 'Animated "Add to cart" button and cart badge (initial / animate / whileTap)',
      scenario:
        'On a Myntra-style product card, the button should shrink when tapped and the cart count badge should pop every time an item is added.',
      steps: [
        'npm install motion',
        'Replace <button> with <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>',
        'Render the badge as <motion.span key={count}> so it re-mounts (and re-animates) when count changes',
        'Give the badge initial={{ scale: 0.4 }} animate={{ scale: 1 }} with a spring',
        'Run the playground (CSS keyframes + key trick, same idea)',
      ],
      code: `import { useState } from 'react';
import { motion } from 'motion/react';

export default function AddToCart() {
  const [count, setCount] = useState(0);
  return (
    <div className="row">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCount(c => c + 1)}
      >
        Add to bag
      </motion.button>

      <span className="cart">
        Bag
        <motion.span
          key={count}                         // new key = new element = animation replays
          className="badge"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          aria-live="polite"
        >
          {count}
        </motion.span>
      </span>
    </div>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="card">
      <img src="https://picsum.photos/seed/kurta/320/200" alt="Cotton kurta" width="320" height="200" />
      <h3>Handloom Cotton Kurta</h3>
      <p className="price">{'\\u20B9'}1,299</p>
      <div className="row">
        <button className="add" onClick={() => setCount(c => c + 1)}>Add to bag</button>
        <span className="cart">
          Bag
          {/* key changes on every add, so React re-mounts the span and the CSS animation replays */}
          <span key={count} className="badge" aria-live="polite">{count}</span>
        </span>
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fdf2f8; display: grid; place-items: center; min-height: 100vh; margin: 0; }
.card { background: #fff; border-radius: 14px; padding: 14px; width: 320px; box-shadow: 0 6px 20px rgba(0,0,0,.08); }
img { width: 100%; height: auto; border-radius: 10px; display: block; }
h3 { margin: 10px 0 2px; } .price { margin: 0 0 12px; font-weight: 700; color: #be185d; }
.row { display: flex; justify-content: space-between; align-items: center; }
.add { padding: 10px 18px; border: 0; border-radius: 10px; background: #db2777; color: #fff; font-weight: 600; cursor: pointer;
  transition: transform .15s ease-out; }
.add:hover { transform: scale(1.03); }
.add:active { transform: scale(.95); }
.cart { display: flex; align-items: center; gap: 6px; font-weight: 600; }
.badge { min-width: 22px; height: 22px; border-radius: 11px; background: #111827; color: #fff; display: grid; place-items: center;
  font-size: 12px; animation: pop .35s cubic-bezier(.34,1.56,.64,1); }
@keyframes pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .badge, .add { animation: none; transition: none; } }`,
      },
      result:
        'A product card with a pink "Add to bag" button. Hovering grows it slightly, pressing shrinks it. Each click increases the badge number and the badge pops in with a small overshoot bounce.',
      explanation:
        'Plain-CSS version of whileHover/whileTap (:hover/:active with a transform transition) and of the key trick: changing `key` makes React unmount the old span and mount a new one, so its entry animation runs again. This works identically with motion.span. Only transform and opacity are animated, and reduced-motion users get no animation.',
    },
    {
      title: 'Staggered product grid with variants',
      scenario: 'When the product list loads (or the filter changes), cards should fade up one after another instead of all popping in together.',
      steps: [
        'Define container and item variants in src/lib/motionVariants.js',
        'Use <motion.ul variants={container} initial="hidden" animate="visible">',
        'Give each <motion.li variants={item}> (children inherit the variant names)',
        'Set staggerChildren in the container transition',
        'Key the list by the filter so it replays when the category changes',
        'Run the playground: CSS transition-delay per index reproduces the stagger',
      ],
      code: `// src/lib/motionVariants.js
export const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ProductGrid.jsx
import { motion } from 'motion/react';
import { container, fadeUp } from '@/lib/motionVariants';

export default function ProductGrid({ products, category }) {
  return (
    <motion.ul key={category} className="grid" variants={container} initial="hidden" animate="visible">
      {products.map(p => (
        <motion.li key={p.id} variants={fadeUp} whileHover={{ y: -4 }} className="card">
          <img src={p.thumbnail} alt={p.title} />
          <h3>{p.title}</h3>
          <p>₹{p.price}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}`,
      playground: {
        jsx: `const { useEffect, useState } = React;

const products = [
  { id: 1, title: 'Masala Chai 250g', cat: 'Grocery', price: 220 },
  { id: 2, title: 'Basmati Rice 5kg', cat: 'Grocery', price: 649 },
  { id: 3, title: 'Cotton Kurta', cat: 'Fashion', price: 1299 },
  { id: 4, title: 'Banarasi Saree', cat: 'Fashion', price: 4999 },
  { id: 5, title: 'Wireless Earbuds', cat: 'Electronics', price: 1999 },
  { id: 6, title: 'Power Bank 20000mAh', cat: 'Electronics', price: 1499 },
  { id: 7, title: 'Kolhapuri Chappal', cat: 'Fashion', price: 899 },
  { id: 8, title: 'Smart Watch', cat: 'Electronics', price: 2799 },
];

// mini "variants": the parent switches hidden -> visible after mount, children use the state + their index for stagger
function StaggerList({ items, stagger = 60 }) {
  const [state, setState] = useState('hidden');
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setState('visible')));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <ul className="grid">
      {items.map((p, i) => (
        <li key={p.id} className={'card ' + state} style={{ transitionDelay: state === 'visible' ? i * stagger + 'ms' : '0ms' }}>
          <img src={'https://picsum.photos/seed/p' + p.id + '/200/140'} alt="" width="200" height="140" />
          <h4>{p.title}</h4>
          <p>{'\\u20B9' + p.price.toLocaleString('en-IN')}</p>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? products : products.filter(p => p.cat === cat);
  return (
    <div className="page">
      <div className="tabs">
        {['All', 'Grocery', 'Fashion', 'Electronics'].map(c => (
          <button key={c} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {/* key={cat} remounts the list so the entrance replays, like key on motion.ul */}
      <StaggerList key={cat} items={shown} />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 16px; }
.page { max-width: 720px; margin: auto; }
.tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.tabs button { padding: 6px 14px; border-radius: 999px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
.tabs button[aria-pressed=true] { background: #0f172a; color: #fff; }
.grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.08);
  transition: opacity .3s ease-out, transform .3s ease-out; }
.card.hidden { opacity: 0; transform: translateY(16px); }
.card.visible { opacity: 1; transform: none; }
.card.visible:hover { transform: translateY(-4px); transition-delay: 0s !important; }
.card img { width: 100%; height: auto; border-radius: 8px; display: block; }
h4 { margin: 6px 0 2px; font-size: 14px; } p { margin: 0; font-weight: 700; color: #0f766e; }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } .card.hidden { opacity: 1; transform: none; } }`,
      },
      result:
        'Eight product cards fade up one after another (60 ms apart). Choosing a category replays the staggered entrance with only those products. Hovering a card lifts it slightly.',
      explanation:
        'Plain-React version of variants + staggerChildren: the parent holds a single variant state ("hidden" -> "visible"); each child maps the state to styles and delays by index, which is what Motion computes for you. The double requestAnimationFrame ensures the browser paints the hidden state first so the transition actually runs. key={cat} re-mounts the list to replay the animation.',
    },
    {
      title: 'Exit animations: toasts and a modal with a mini AnimatePresence',
      scenario: 'Toasts should slide out when dismissed and a confirm modal should fade and scale out instead of disappearing instantly.',
      steps: [
        'Wrap the conditional modal and the toast list in <AnimatePresence>',
        'Give each motion child a unique key and an exit prop',
        'Keep AnimatePresence always mounted (the condition goes inside it)',
        'Auto-dismiss toasts after 3 seconds',
        'Run the playground: a small usePresence hook keeps elements mounted until their CSS exit transition ends',
      ],
      code: `import { AnimatePresence, motion } from 'motion/react';

export function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            className="toast"
          >
            {t.text}
            <button onClick={() => onDismiss(t.id)} aria-label="Dismiss">x</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="backdrop" className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog" aria-modal="true" className="modal"
            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            onClick={e => e.stopPropagation()}
          >
            <p>Cancel this order?</p>
            <button onClick={onConfirm}>Yes, cancel</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
      playground: {
        jsx: `const { useEffect, useState } = React;

// mini AnimatePresence for ONE element: stays mounted until the exit transition ends
function usePresence(isOpen, duration = 200) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [isOpen, duration]);
  return { mounted, visible };
}

// mini AnimatePresence for a LIST: removed items are kept with a "leaving" flag
function usePresenceList(items, duration = 250) {
  const [rendered, setRendered] = useState(items.map(i => ({ ...i, state: 'enter' })));
  useEffect(() => {
    setRendered(prev => {
      const ids = new Set(items.map(i => i.id));
      const kept = prev.map(p => (ids.has(p.id) ? p : { ...p, state: 'leaving' }));
      const known = new Set(prev.map(p => p.id));
      const added = items.filter(i => !known.has(i.id)).map(i => ({ ...i, state: 'enter' }));
      return kept.concat(added);
    });
    const t = setTimeout(() => setRendered(prev => prev.filter(p => p.state !== 'leaving')), duration);
    return () => clearTimeout(t);
  }, [items, duration]);
  return rendered;
}

function Toast({ toast, onDismiss }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); return () => cancelAnimationFrame(id); }, []);
  const cls = toast.state === 'leaving' ? 'toast out' : shown ? 'toast in' : 'toast';
  return (
    <div className={cls}>
      {toast.text}
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss">x</button>
    </div>
  );
}

function App() {
  const [toasts, setToasts] = useState([]);
  const [open, setOpen] = useState(false);
  const rendered = usePresenceList(toasts);
  const modal = usePresence(open);

  const notify = text => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  const dismiss = id => setToasts(t => t.filter(x => x.id !== id));

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="page">
      <h2>Order #ORD-2045</h2>
      <button onClick={() => notify('Address updated to Koramangala, Bengaluru')}>Show toast</button>
      <button className="danger" onClick={() => setOpen(true)}>Cancel order</button>

      <div className="toasts" aria-live="polite">
        {rendered.map(t => <Toast key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>

      {modal.mounted && (
        <div className={'backdrop' + (modal.visible ? ' show' : '')} onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="mt" onClick={e => e.stopPropagation()}>
            <h3 id="mt">Cancel this order?</h3>
            <p>Your refund of {'\\u20B9'}2,499 will reach your UPI account in 3-5 days.</p>
            <div className="actions">
              <button className="ghost" onClick={() => setOpen(false)}>Keep order</button>
              <button className="danger" onClick={() => { setOpen(false); notify('Order cancelled'); }}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; min-height: 100vh; }
.page button { padding: 9px 14px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; margin-right: 8px; }
.page .danger { background: #dc2626; } .page .ghost { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
.toasts { position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; width: 280px; }
.toast { background: #0f172a; color: #fff; padding: 10px 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px;
  opacity: 0; transform: translateX(40px); transition: opacity .25s, transform .25s; font-size: 14px; }
.toast.in { opacity: 1; transform: none; }
.toast.out { opacity: 0; transform: translateX(40px); }
.toast button { background: transparent !important; padding: 2px 6px !important; margin: 0 !important; }
.backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: grid; place-items: center; opacity: 0; transition: opacity .2s; }
.backdrop.show { opacity: 1; }
.modal { background: #fff; border-radius: 14px; padding: 20px; width: min(340px, 90vw); transform: scale(.95) translateY(10px); transition: transform .2s; }
.backdrop.show .modal { transform: none; }
.modal h3 { margin-top: 0; }
.actions { display: flex; justify-content: flex-end; }
@media (prefers-reduced-motion: reduce) { .toast, .backdrop, .modal { transition: none; } }`,
      },
      result:
        '"Show toast" slides a dark toast in from the right; it slides out after 3 s or when x is clicked, and the others move up. "Cancel order" fades in a backdrop and scales the modal in; closing (button, backdrop click or Escape) fades and scales it out before it is removed. Confirming shows an "Order cancelled" toast.',
      explanation:
        'Plain-React version of AnimatePresence. Normally React unmounts immediately; here the hooks delay unmounting: usePresence keeps the modal mounted while `visible` goes false and the CSS transition plays, then unmounts after the duration. usePresenceList marks removed toasts as "leaving" instead of deleting them, which is exactly what AnimatePresence does internally with keys.',
    },
    {
      title: 'Page transitions between routes',
      scenario: 'In a small store app, moving between Home, Products and Cart should slide the old page out and the new page in (mode="wait").',
      steps: [
        'Get location with useLocation() in a wrapper component',
        'Wrap routes in <AnimatePresence mode="wait"> and key the motion.main by location.pathname',
        'Pass location to <Routes location={location}> so the exiting page keeps its old content',
        'Use a short (200-300 ms) slide + fade and respect reduced motion with MotionConfig',
        'Run the playground: a tiny state router with an exit-then-enter sequence',
      ],
      code: `// src/app/AnimatedRoutes.jsx
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Cart from '@/pages/Cart';

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  );
}`,
      playground: {
        jsx: `const { useEffect, useRef, useState } = React;

const pages = {
  home: { title: 'Home', body: 'Diwali sale is live! Up to 60% off on ethnic wear.', color: '#fef3c7' },
  products: { title: 'Products', body: 'Kurtas, sarees, sherwanis and more from Jaipur and Varanasi weavers.', color: '#dcfce7' },
  cart: { title: 'Cart', body: '2 items | Total \\u20B91,299 + \\u20B92,499', color: '#e0e7ff' },
};

// mode="wait": first play the exit of the old page, then mount the new page and play its enter
function usePageTransition(route, exitMs = 200) {
  const [shown, setShown] = useState(route);
  const [phase, setPhase] = useState('enter');
  useEffect(() => {
    if (route === shown) return;
    setPhase('exit');
    const t = setTimeout(() => { setShown(route); setPhase('enter'); }, exitMs);
    return () => clearTimeout(t);
  }, [route]);
  return { shown, phase };
}

function Page({ id, phase }) {
  const ref = useRef(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    if (ref.current) ref.current.focus();      // move focus to the new page heading
    return () => cancelAnimationFrame(r);
  }, []);
  const cls = phase === 'exit' ? 'page exit' : entered ? 'page in' : 'page';
  const p = pages[id];
  return (
    <main className={cls} style={{ background: p.color }}>
      <h2 tabIndex={-1} ref={ref}>{p.title}</h2>
      <p>{p.body}</p>
    </main>
  );
}

function App() {
  const [route, setRoute] = useState('home');
  const { shown, phase } = usePageTransition(route);
  return (
    <div className="app">
      <nav>
        {Object.keys(pages).map(k => (
          <button key={k} aria-current={route === k ? 'page' : undefined} onClick={() => setRoute(k)}>{pages[k].title}</button>
        ))}
      </nav>
      <div className="stage">
        <Page key={shown} id={shown} phase={phase} />
      </div>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fff; margin: 0; padding: 16px; }
.app { max-width: 480px; margin: auto; }
nav { display: flex; gap: 6px; margin-bottom: 12px; }
nav button { flex: 1; padding: 8px; border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; }
nav button[aria-current=page] { background: #0f172a; color: #fff; }
.stage { overflow: hidden; border-radius: 12px; }
.page { padding: 24px; min-height: 160px; border-radius: 12px; opacity: 0; transform: translateX(24px);
  transition: opacity .25s ease-out, transform .25s ease-out; }
.page.in { opacity: 1; transform: none; }
.page.exit { opacity: 0; transform: translateX(-24px); transition-duration: .2s; transition-timing-function: ease-in; }
h2 { margin-top: 0; outline: none; }
@media (prefers-reduced-motion: reduce) { .page { transition: opacity .01s; transform: none !important; } }`,
      },
      result:
        'Clicking a nav tab slides the current page left while fading out (200 ms), then the new page slides in from the right (250 ms). The active tab is dark and focus moves to the new page heading.',
      explanation:
        'Plain-React version of AnimatePresence mode="wait" with a router: the hook keeps showing the old route during the exit phase and only then swaps to the new one, keyed by the route so the new page mounts fresh and plays its enter transition. Passing the old location to Routes in the real code serves the same purpose: the exiting page must keep rendering its own content.',
    },
    {
      title: 'Drag gesture: swipe-to-delete notification rows',
      scenario: 'In a mobile-first notifications list (like Gmail or Swiggy), swiping a row left past a threshold deletes it; a short swipe springs back.',
      steps: [
        'Use <motion.li drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7}>',
        'In onDragEnd check info.offset.x (distance) or info.velocity.x (flick speed)',
        'Remove the item when it passes -120px; the AnimatePresence exit slides it away',
        'Provide a keyboard/button alternative (Delete button) for accessibility',
        'Run the playground: pointer events + CSS transform do the same',
      ],
      code: `import { AnimatePresence, motion } from 'motion/react';

export default function NotificationList({ items, onDelete }) {
  return (
    <ul>
      <AnimatePresence initial={false}>
        {items.map(n => (
          <motion.li
            key={n.id}
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, info) => {
              if (info.offset.x < -120 || info.velocity.x < -500) onDelete(n.id);
            }}
            exit={{ x: -400, opacity: 0, transition: { duration: 0.2 } }}
            whileTap={{ cursor: 'grabbing' }}
          >
            {n.text}
            <button onClick={() => onDelete(n.id)} aria-label={'Delete ' + n.text}>Delete</button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}`,
      playground: {
        jsx: `const { useRef, useState } = React;

const initial = [
  { id: 1, text: 'Your Swiggy order is out for delivery' },
  { id: 2, text: 'UPI payment of \\u20B9499 successful' },
  { id: 3, text: 'Train 12951 Rajdhani is running on time' },
  { id: 4, text: 'Your OTP for login is valid for 5 minutes' },
];

function SwipeRow({ item, onDelete }) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const start = useRef(null);

  const remove = () => { setLeaving(true); setTimeout(() => onDelete(item.id), 220); };
  const onPointerDown = e => { start.current = { x: e.clientX, t: Date.now() }; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); };
  const onPointerMove = e => {
    if (!dragging) return;
    const dx = e.clientX - start.current.x;
    setX(dx > 0 ? dx * 0.3 : dx);                  // elastic to the right, free to the left
  };
  const onPointerUp = e => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - start.current.x;
    const velocity = dx / Math.max(1, Date.now() - start.current.t);   // px per ms
    if (dx < -120 || velocity < -0.5) remove(); else setX(0);           // spring back
  };

  const style = leaving
    ? { transform: 'translateX(-110%)', opacity: 0, transition: 'transform .22s ease-in, opacity .22s' }
    : { transform: 'translateX(' + x + 'px)', transition: dragging ? 'none' : 'transform .35s cubic-bezier(.34,1.56,.64,1)' };

  return (
    <li className="row">
      <div className="under">Delete</div>
      <div className="content" style={style}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <span>{item.text}</span>
        <button onPointerDown={e => e.stopPropagation()} onClick={remove} aria-label={'Delete: ' + item.text}>x</button>
      </div>
    </li>
  );
}

function App() {
  const [items, setItems] = useState(initial);
  return (
    <div className="phone">
      <h3>Notifications</h3>
      <p className="hint">Swipe a row left (mouse or finger) or press x</p>
      <ul>{items.map(i => <SwipeRow key={i.id} item={i} onDelete={id => setItems(list => list.filter(n => n.id !== id))} />)}</ul>
      {items.length === 0 && <p className="empty">All caught up!</p>}
      <button className="reset" onClick={() => setItems(initial)}>Reset</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #e2e8f0; margin: 0; padding: 16px; }
.phone { max-width: 360px; margin: auto; background: #fff; border-radius: 24px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.12); }
h3 { margin: 0; } .hint { color: #64748b; font-size: 12px; margin: 4px 0 10px; }
ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.row { position: relative; border-radius: 12px; overflow: hidden; }
.under { position: absolute; inset: 0; background: #dc2626; color: #fff; display: flex; justify-content: flex-end; align-items: center; padding-right: 16px; font-weight: 600; }
.content { position: relative; background: #f8fafc; padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;
  touch-action: pan-y; user-select: none; cursor: grab; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 12px; }
.content button { border: 0; background: #e2e8f0; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.empty { text-align: center; color: #16a34a; }
.reset { margin-top: 12px; width: 100%; padding: 8px; border: 0; border-radius: 8px; background: #0f172a; color: #fff; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .content { transition: none !important; } }`,
      },
      result:
        'Dragging a notification left reveals a red "Delete" background. Releasing past 120 px (or flicking quickly) slides the row out and removes it; a short drag springs back with a small bounce. Dragging right only moves a little (elastic). The x button deletes without dragging, and Reset restores the list.',
      explanation:
        'Plain-React version of drag="x" + onDragEnd: pointer events track the offset, setPointerCapture keeps receiving moves outside the element, and on release we use both distance and velocity (info.offset and info.velocity in Motion). touch-action: pan-y lets the page still scroll vertically on phones. The spring-back is a CSS cubic-bezier with overshoot. A button alternative keeps the feature usable for keyboard and screen-reader users.',
    },
  ],
  interview: [
    {
      q: 'Why should you animate transform and opacity instead of width, height, top or left?',
      a: 'transform and opacity can be handled by the GPU compositor without recalculating layout or repainting, so they stay at 60fps. width/height/top/left/margin trigger layout (reflow) and paint on every frame, causing jank, especially on low-end phones. For size/position changes use transforms or Motion layout animations (which use transforms under the hood).',
      level: 'Medium',
    },
    {
      q: 'What problem does AnimatePresence solve?',
      a: 'React removes elements from the DOM immediately when they stop rendering, so exit animations are impossible by default. AnimatePresence tracks its direct children by key, and when one is removed it keeps it mounted until its exit animation completes, then removes it.',
      level: 'Easy',
    },
    {
      q: 'Why does an exit animation not run even though you added exit to a motion.div?',
      a: 'Common causes: AnimatePresence is inside the condition (so it is removed too), the child has no key or an unstable key, the motion element is not a direct child of AnimatePresence (a wrapper component without forwarding), or the whole parent unmounts. Keep AnimatePresence always mounted and give each direct child a unique stable key.',
      level: 'Medium',
    },
    {
      q: 'What are variants and why use them?',
      a: 'Variants are named sets of animation targets (e.g. hidden/visible). Elements reference them by name, and variant names propagate to motion children, so a parent can orchestrate children with staggerChildren and delayChildren. They keep animation definitions reusable and out of JSX.',
      level: 'Easy',
    },
    {
      q: 'How do you implement page transitions with React Router and Motion?',
      a: 'Use useLocation, wrap the routes in AnimatePresence mode="wait", render a motion wrapper keyed by location.pathname with initial/animate/exit, and pass location to <Routes location={location}> so the exiting page keeps rendering its old route while it animates out.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between mode="wait", "sync" and "popLayout" in AnimatePresence?',
      a: 'sync (default): entering and exiting children animate at the same time. wait: the entering child waits until the exiting one finishes, good for page or step content in the same spot. popLayout: the exiting element is popped out of layout (absolute) so surrounding items, typically with the layout prop, can move into place immediately; good for lists.',
      level: 'Hard',
    },
    {
      q: 'How do you respect users who prefer reduced motion?',
      a: 'Use the prefers-reduced-motion media query in CSS, wrap the app in <MotionConfig reducedMotion="user"> so Motion disables transform/layout animations for those users, or use useReducedMotion() to replace movement with simple fades. Avoid parallax, large movements and flashing for them.',
      level: 'Medium',
    },
    {
      q: 'What does the layout prop and layoutId do?',
      a: 'layout makes Motion animate an element\'s position and size changes caused by re-renders (reordering, expanding) using performant transforms (FLIP technique). layoutId links two different elements, so when one unmounts and another with the same layoutId mounts, Motion animates between them, e.g. a moving tab underline or a thumbnail expanding into a detail view.',
      level: 'Hard',
    },
    {
      q: 'CSS transitions or Framer Motion: how do you decide?',
      a: 'Use CSS for simple hover/focus/state transitions and keyframe loaders: no JS, no bundle cost. Use Motion when you need exit animations, orchestration/stagger, gestures like drag, layout animations, springs or animations driven by React state in complex ways. Many teams use both.',
      level: 'Easy',
    },
    {
      q: 'Your animated list stutters on low-end Android phones. What do you check?',
      a: 'Check which properties animate (only transform/opacity), the number of elements animating at once (stagger fewer, virtualise long lists), expensive box-shadow/filter animations, unnecessary re-renders during animation (React Profiler), image decoding during the animation, and bundle size (LazyMotion). Test with CPU throttling in DevTools.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Using Motion, build an accordion (FAQ) where the answer expands smoothly with height "auto" and the arrow rotates.',
      hint: 'AnimatePresence + motion.div with initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} and overflow hidden.',
      solution: `import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq">
      <button aria-expanded={open} onClick={() => setOpen(o => !o)} className="faq-q">
        {q}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">▼</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`,
    },
    {
      task: 'Create a tab bar where an underline slides to the active tab using layoutId.',
      hint: 'Render <motion.div layoutId="underline" /> only inside the active tab.',
      solution: `import { useState } from 'react';
import { motion } from 'motion/react';

const tabs = ['Orders', 'Returns', 'Wishlist'];

export default function Tabs() {
  const [active, setActive] = useState(tabs[0]);
  return (
    <div role="tablist" style={{ display: 'flex', gap: 16 }}>
      {tabs.map(t => (
        <button key={t} role="tab" aria-selected={active === t} onClick={() => setActive(t)}
          style={{ position: 'relative', padding: '8px 4px', background: 'none', border: 0 }}>
          {t}
          {active === t && (
            <motion.div
              layoutId="underline"
              style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, background: '#db2777', borderRadius: 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}`,
    },
    {
      task: 'Plain React + CSS (playground-ready): a "Scroll reveal" section where cards fade up when they enter the viewport, using IntersectionObserver (like whileInView with viewport once).',
      hint: 'A useInView hook that sets true once and disconnects.',
      solution: `const { useEffect, useRef, useState } = React;

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }   // once
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children }) {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : 'translateY(30px)',
      transition: 'opacity .5s ease-out, transform .5s ease-out',
      padding: 24, margin: '16px 0', background: '#eef2ff', borderRadius: 12,
    }}>{children}</div>
  );
}

function App() {
  return (
    <div>
      <p style={{ height: 500 }}>Scroll down...</p>
      {['Free delivery above ₹499', '7-day easy returns', 'Cash on delivery available'].map(t => <Reveal key={t}><h3>{t}</h3></Reveal>)}
    </div>
  );
}`,
    },
    {
      task: 'Add reduced-motion support to the page transition: users who prefer reduced motion get a quick fade without sliding.',
      hint: 'useReducedMotion() from motion/react returns true/false.',
      solution: `import { motion, useReducedMotion } from 'motion/react';

export function PageWrapper({ children }) {
  const reduce = useReducedMotion();
  const variants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
      };
  return (
    <motion.main variants={variants} initial="initial" animate="animate" exit="exit"
      transition={{ duration: reduce ? 0.1 : 0.25 }}>
      {children}
    </motion.main>
  );
}

// Or globally: <MotionConfig reducedMotion="user"><App /></MotionConfig>`,
    },
    {
      task: 'Animate a deleted cart item with Motion so that the remaining items smoothly move up (no jump).',
      hint: 'AnimatePresence mode="popLayout" + layout prop on each item.',
      solution: `import { AnimatePresence, motion } from 'motion/react';

export function CartList({ items, onRemove }) {
  return (
    <ul>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map(item => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {item.title} | ₹{item.price}
            <button onClick={() => onRemove(item.id)}>Remove</button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which package/import is the current way to use Framer Motion in React?',
      options: ["import { motion } from 'react-motion'", "import { motion } from 'motion/react'", "import motion from 'react-dom/motion'", "import { animate } from 'react'"],
      answer: 1,
      explanation: 'Framer Motion is now published as "motion"; React APIs come from motion/react (framer-motion still works).',
    },
    {
      question: 'What is required for AnimatePresence to run an exit animation?',
      options: ['A CSS file', 'useEffect cleanup', 'AnimatePresence stays mounted and its direct child has a unique key and an exit prop', 'mode="wait"'],
      answer: 2,
      explanation: 'It detects removed children by key and plays their exit before unmounting.',
    },
    {
      question: 'Which properties are cheapest to animate?',
      options: ['transform and opacity', 'width and height', 'top and left', 'margin and padding'],
      answer: 0,
      explanation: 'They are handled by the compositor without layout or paint.',
    },
    {
      question: 'staggerChildren is set on:',
      options: ['Each child motion.li', 'The CSS file', 'AnimatePresence', 'The parent variant\'s transition'],
      answer: 3,
      explanation: 'The parent orchestrates children via transition: { staggerChildren }.',
    },
    {
      question: 'Which prop makes a motion element draggable only horizontally?',
      options: ['dragX', 'drag="x"', 'whileDrag="x"', 'axis="horizontal"'],
      answer: 1,
      explanation: 'drag="x" locks dragging to the x axis.',
    },
  ],
};
