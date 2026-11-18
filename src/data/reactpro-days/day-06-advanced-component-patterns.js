export default {
  id: 'day-06-advanced-component-patterns',
  title: 'Advanced Component Patterns: Compound Components, Render Props, HOCs, Controlled vs Uncontrolled, Headless Hooks and Polymorphic Components',
  module: 'Module 3: Patterns & Performance',
  day: 6,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Libraries like Radix, shadcn/ui, Headless UI, MUI and React Hook Form are built from a handful of reusable patterns. Learn compound components, render props, higher-order components, the controlled/uncontrolled contract, headless hooks with prop getters, and polymorphic "as" components, so you can design reusable components for a team and explain the trade-offs in interviews.',
  objectives: [
    'Build compound components that share implicit state through context',
    'Use render props and HOCs, and explain why custom hooks replaced most of them',
    'Design components that support both controlled and uncontrolled usage',
    'Write headless hooks that return state plus prop getters',
    'Create polymorphic components with an "as" prop and slot/asChild composition',
  ],
  theory: [
    {
      heading: 'Why patterns matter: designing component APIs',
      content:
        'A reusable component is an **API** used by other developers. Bad APIs grow "prop explosion": `<Tabs tabs={[...]} activeColor showIcons iconPosition="left" renderTabExtra={...} />` with 30 props. Good APIs are **composable**: the user arranges small pieces in JSX.\n\nThe patterns in this lesson answer different questions:\n- **Compound components**: how do several pieces share state without the user wiring it? (`<Tabs><Tabs.List>...`)\n- **Render props / headless hooks**: how do I share **logic** but let the user control **markup**?\n- **HOC**: how do I wrap many components with the same behaviour (legacy, still seen)?\n- **Controlled vs uncontrolled**: who owns the state, the component or the parent?\n- **Polymorphic / asChild**: how do I change the rendered element (`button` vs `a` vs `Link`) without losing styles?\n\nInversion of control is the common idea: the component gives the user more control instead of adding more props.',
    },
    {
      heading: 'Compound components',
      content:
        'A parent component holds state and shares it with its children through **context**. The user composes the children freely, like HTML `<select>` and `<option>`.\n\n```\n<Accordion defaultValue="faq-1">\n  <Accordion.Item value="faq-1">\n    <Accordion.Trigger>What is MERN?</Accordion.Trigger>\n    <Accordion.Content>MongoDB, Express, React, Node</Accordion.Content>\n  </Accordion.Item>\n</Accordion>\n```\n\nImplementation steps:\n1. Create a context in the parent (`AccordionContext`).\n2. Child components read it with a custom hook that **throws a helpful error** if used outside the parent.\n3. Attach children as static properties (`Accordion.Item = Item`) or export them separately (`AccordionItem`; better for tree-shaking and React Server Components, which is what shadcn/ui does).\n\nUsed by: Radix UI, shadcn/ui, Headless UI, Reach UI, Chakra.',
      tip: 'Avoid the old approach of React.Children.map + cloneElement to inject props: it breaks when children are wrapped in a div or fragment. Context works at any depth.',
    },
    {
      heading: 'Render props and HOCs (and why hooks won)',
      content:
        '**Render prop**: a component takes a function as a prop (often `children`) and calls it with data. The caller decides what to render.\n`<MouseTracker>{({ x, y }) => <p>{x}, {y}</p>}</MouseTracker>`\nStill useful for components that must render something around the user content (virtualized lists: `rowRenderer`, Formik, Downshift, React Router `<Await>`).\n\n**Higher-order component (HOC)**: a function that takes a component and returns a new component with extra props or behaviour: `withAuth(Dashboard)`, `connect(mapState)(Component)` from old Redux, `withRouter`, `withErrorBoundary`.\n\nProblems with both: "wrapper hell" in DevTools, **prop name collisions** (two HOCs inject `data`), unclear origin of props, and static typing pain. **Custom hooks** solve logic sharing without extra components, so modern code prefers `useAuth()` over `withAuth`. HOCs are still useful for cross-cutting wrappers (error boundary, feature-flag gate, analytics) applied to many routes.',
      syntax:
        "// HOC\nfunction withLoading(Component) {\n  function WithLoading({ isLoading, ...props }) {\n    return isLoading ? <Spinner /> : <Component {...props} />;\n  }\n  WithLoading.displayName = `withLoading(${Component.displayName || Component.name})`;\n  return WithLoading;\n}\nconst UserListWithLoading = withLoading(UserList);",
    },
    {
      heading: 'Controlled vs uncontrolled components (the contract)',
      content:
        'You know controlled inputs. The same idea applies to **your own components**:\n- **Uncontrolled**: the component owns its state; the parent passes `defaultValue` / `defaultOpen` and maybe listens with `onChange`.\n- **Controlled**: the parent owns the state via `value` / `open` + `onChange` / `onOpenChange`.\n\nProfessional components (Radix, MUI) support **both**: if `value` is `undefined`, use internal state; otherwise use the prop. Build a reusable `useControllableState` hook for this.\n\nRules:\n- Do not switch between controlled and uncontrolled during the component\'s life (React warns for inputs).\n- Name props consistently: `value/defaultValue/onValueChange`, `open/defaultOpen/onOpenChange`.\n- Uncontrolled is simpler for callers; controlled is needed when the parent must react, validate or sync (e.g. open a modal from a URL param).',
      syntax:
        "function useControllableState({ value, defaultValue, onChange }) {\n  const [internal, setInternal] = useState(defaultValue);\n  const isControlled = value !== undefined;\n  const current = isControlled ? value : internal;\n  const setValue = useCallback((next) => {\n    const resolved = typeof next === 'function' ? next(current) : next;\n    if (!isControlled) setInternal(resolved);\n    onChange?.(resolved);\n  }, [isControlled, current, onChange]);\n  return [current, setValue];\n}",
    },
    {
      heading: 'Headless hooks and prop getters',
      content:
        'A **headless** component provides behaviour, state and accessibility, but **no styles or markup**. TanStack Table, Downshift, React Aria and Headless UI follow this idea. You style it with Tailwind or anything else.\n\nA headless hook commonly returns **prop getters**: functions that return the props an element needs (ARIA attributes, handlers, ids). The user spreads them and can pass their own props, which the getter **merges** (calling both handlers).\n\n```\nconst { isOpen, getToggleProps, getPanelProps } = useDisclosure();\n<button {...getToggleProps({ onClick: trackClick })}>Details</button>\n<div {...getPanelProps()}>...</div>\n```\n\nBenefits: complete design freedom, accessibility baked in, one logic implementation used by many visual variants (web app, admin panel, landing page).',
    },
    {
      heading: 'Polymorphic components and asChild',
      content:
        'Design systems need a `<Button>` that sometimes renders a `<button>`, sometimes an `<a href>`, and sometimes React Router\'s `<Link>`, with the same styles. Two approaches:\n\n1. **`as` prop** (Chakra, MUI `component` prop, styled-components): `<Button as={Link} to="/jobs">Jobs</Button>`. Implementation: `const Comp = as || \'button\'; return <Comp {...props} />`. In TypeScript, type the props of the chosen element with generics (Day 11).\n2. **`asChild` / Slot** (Radix, shadcn/ui): `<Button asChild><Link to="/jobs">Jobs</Link></Button>`. The Button does not render its own element; it merges its props (className, handlers, ref) into the single child with `cloneElement`. This avoids complex generic types and keeps the child\'s own props intact.\n\nAccessibility rule: a navigation should be a link, an action should be a button. Polymorphism lets you keep the right semantic element while sharing styles.',
      syntax:
        "function Slot({ children, ...props }) {\n  const child = React.Children.only(children);\n  return React.cloneElement(child, {\n    ...props,\n    ...child.props,\n    className: [props.className, child.props.className].filter(Boolean).join(' '),\n  });\n}\nfunction Button({ asChild, ...props }) {\n  const Comp = asChild ? Slot : 'button';\n  return <Comp className=\"btn btn-primary\" {...props} />;\n}",
    },
  ],
  examples: [
    {
      title: 'Compound Tabs component with context',
      scenario: 'A product page needs Description / Specs / Reviews tabs. Other teams should be able to arrange the pieces freely.',
      steps: [
        'Create TabsContext and a useTabs hook that throws outside <Tabs>',
        'Tabs holds the active value (uncontrolled with defaultValue)',
        'Tab and Panel read the context; add ARIA roles',
        'Run and switch tabs; try wrapping a Tab in a <span>: it still works',
      ],
      code: `<Tabs defaultValue="desc">
  <Tabs.List>
    <Tabs.Tab value="desc">Description</Tabs.Tab>
    <Tabs.Tab value="specs">Specs</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="desc">...</Tabs.Panel>
  <Tabs.Panel value="specs">...</Tabs.Panel>
</Tabs>`,
      playground: {
        jsx: `const { useState, useContext, createContext, useId } = React;

const TabsContext = createContext(null);
function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* components must be used inside <Tabs>');
  return ctx;
}

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId();
  return <TabsContext.Provider value={{ active, setActive, baseId }}><div>{children}</div></TabsContext.Provider>;
}
Tabs.List = function TabsList({ children }) {
  return <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '2px solid #ddd' }}>{children}</div>;
};
Tabs.Tab = function Tab({ value, children }) {
  const { active, setActive, baseId } = useTabs();
  const selected = active === value;
  return (
    <button role="tab" id={baseId + '-tab-' + value} aria-selected={selected} aria-controls={baseId + '-panel-' + value}
      onClick={() => setActive(value)}
      style={{ padding: '8px 14px', border: 0, cursor: 'pointer', background: selected ? '#4f46e5' : '#eee', color: selected ? '#fff' : '#333' }}>
      {children}
    </button>
  );
};
Tabs.Panel = function Panel({ value, children }) {
  const { active, baseId } = useTabs();
  if (active !== value) return null;
  return <div role="tabpanel" id={baseId + '-panel-' + value} aria-labelledby={baseId + '-tab-' + value} style={{ padding: 12 }}>{children}</div>;
};

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <Tabs defaultValue="desc">
        <Tabs.List>
          <Tabs.Tab value="desc">Description</Tabs.Tab>
          <span title="wrapped on purpose"><Tabs.Tab value="specs">Specs</Tabs.Tab></span>
          <Tabs.Tab value="reviews">Reviews (24)</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="desc">Noise-cancelling wireless headphones with 40h battery.</Tabs.Panel>
        <Tabs.Panel value="specs"><ul><li>Bluetooth 5.3</li><li>USB-C fast charge</li></ul></Tabs.Panel>
        <Tabs.Panel value="reviews">4.5 / 5 from 24 buyers</Tabs.Panel>
      </Tabs>
    </div>
  );
}`,
      },
      result: 'Three tabs switch content. The wrapped "Specs" tab works because context reaches any depth.',
      explanation:
        'The parent owns state and exposes it through context; each child reads only what it needs. The useTabs guard gives a clear error if someone renders Tabs.Tab outside Tabs. useId produces stable ids for ARIA linking.',
    },
    {
      title: 'Controllable Toggle: works controlled and uncontrolled',
      scenario: 'A Switch component used in settings pages (uncontrolled) and in a form where the parent needs the value (controlled).',
      steps: [
        'Write useControllableState',
        'Build Switch with checked/defaultChecked/onCheckedChange',
        'Use it once uncontrolled and once controlled by the parent',
      ],
      code: `<Switch defaultChecked onCheckedChange={v => console.log(v)} />     // uncontrolled
<Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />   // controlled`,
      playground: {
        jsx: `const { useState, useCallback } = React;

function useControllableState({ value, defaultValue, onChange }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const setValue = useCallback((next) => {
    if (!isControlled) setInternal(next);
    if (onChange) onChange(next);
  }, [isControlled, onChange]);
  return [current, setValue];
}

function Switch({ checked, defaultChecked = false, onCheckedChange, label }) {
  const [on, setOn] = useControllableState({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', cursor: 'pointer' }}>
      <button role="switch" aria-checked={on} onClick={() => setOn(!on)}
        style={{ width: 44, height: 24, borderRadius: 12, border: 0, position: 'relative', background: on ? '#16a34a' : '#ccc', cursor: 'pointer' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
      </button>
      {label}
    </label>
  );
}

function App() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h4>Uncontrolled</h4>
      <Switch label="Dark mode (component owns state)" defaultChecked={false} />
      <h4>Controlled</h4>
      <Switch label="Email alerts (parent owns state)" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
      <p>Parent sees emailAlerts = {String(emailAlerts)}</p>
      <button onClick={() => setEmailAlerts(false)}>Parent: turn alerts off</button>
    </div>
  );
}`,
      },
      result: 'Both switches toggle. The controlled one also reacts to the parent button and the parent always knows its value.',
      explanation:
        'When checked is undefined the hook falls back to internal state; when it is provided the prop is the single source of truth and the component only reports changes. This is exactly how Radix and MUI components work.',
    },
    {
      title: 'Headless useDisclosure hook with prop getters',
      scenario: 'One accessible show/hide logic used for an FAQ, a filter sidebar and a "read more" text, each styled differently.',
      steps: [
        'Write useDisclosure returning isOpen, toggle and getToggleProps/getPanelProps',
        'Merge user handlers so both run (callAll helper)',
        'Use the hook with two completely different designs',
      ],
      code: `const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

function useDisclosure({ defaultOpen = false } = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const getToggleProps = ({ onClick, ...rest } = {}) => ({
    'aria-expanded': isOpen, 'aria-controls': id,
    onClick: callAll(onClick, () => setIsOpen(o => !o)), ...rest,
  });
  const getPanelProps = (rest = {}) => ({ id, hidden: !isOpen, ...rest });
  return { isOpen, setIsOpen, getToggleProps, getPanelProps };
}`,
      playground: {
        jsx: `const { useState, useId } = React;
const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

function useDisclosure({ defaultOpen = false } = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();
  const getToggleProps = ({ onClick, ...rest } = {}) => ({
    'aria-expanded': isOpen, 'aria-controls': id, type: 'button',
    onClick: callAll(onClick, () => setIsOpen(o => !o)), ...rest,
  });
  const getPanelProps = (rest = {}) => ({ id, hidden: !isOpen, ...rest });
  return { isOpen, getToggleProps, getPanelProps };
}

function FaqItem({ q, a }) {
  const { isOpen, getToggleProps, getPanelProps } = useDisclosure();
  return (
    <div style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
      <button {...getToggleProps({ style: { background: 'none', border: 0, fontWeight: 600, cursor: 'pointer' } })}>
        {isOpen ? '\\u2212' : '+'} {q}
      </button>
      <p {...getPanelProps({ style: { margin: '6px 0 0 18px', color: '#555' } })}>{a}</p>
    </div>
  );
}

function ReadMore({ text }) {
  const [clicks, setClicks] = useState(0);
  const { isOpen, getToggleProps } = useDisclosure();
  return (
    <p style={{ background: '#fef9c3', padding: 10 }}>
      {isOpen ? text : text.slice(0, 60) + '... '}
      <a href="#" {...getToggleProps({ onClick: (e) => { e.preventDefault(); setClicks(c => c + 1); } })}>
        {isOpen ? ' show less' : 'read more'}
      </a>
      <small> (toggled {clicks} times: user handler + hook handler both ran)</small>
    </p>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 520 }}>
      <FaqItem q="Do you offer EMI?" a="Yes, no-cost EMI on cards above Rs 3,000." />
      <FaqItem q="What is the return policy?" a="7-day replacement for damaged items." />
      <ReadMore text="React headless hooks give you behaviour and accessibility without forcing any markup or styling, so the same logic powers very different designs across your app." />
    </div>
  );
}`,
      },
      result: 'FAQ items expand/collapse with correct aria-expanded; the "read more" link uses the same hook with a totally different look and its own extra click handler.',
      explanation:
        'Prop getters let the hook own the important props (ARIA, ids, toggle logic) while users add or override styles and handlers. callAll composes handlers so neither side silently breaks the other.',
    },
    {
      title: 'Render prop and HOC side by side with a custom hook',
      scenario: 'Share "window width" logic three ways to see why hooks became the default.',
      steps: [
        'Implement useWindowWidth (the modern way)',
        'Wrap it in a <WindowWidth> render-prop component',
        'Wrap it in a withWindowWidth HOC',
        'Render all three and compare call sites',
      ],
      code: `const w = useWindowWidth();                           // hook
<WindowWidth>{(w) => <p>{w}px</p>}</WindowWidth>       // render prop
const Info = withWindowWidth(({ width }) => <p>{width}px</p>);   // HOC`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

// render prop built on the hook
function WindowWidth({ children }) { return children(useWindowWidth()); }

// HOC built on the hook
function withWindowWidth(Component) {
  function WithWindowWidth(props) { return <Component {...props} width={useWindowWidth()} />; }
  WithWindowWidth.displayName = 'withWindowWidth(' + (Component.displayName || Component.name || 'Component') + ')';
  return WithWindowWidth;
}
const LayoutInfo = withWindowWidth(function LayoutInfo({ width }) {
  return <p>HOC: layout is {width < 640 ? 'mobile' : 'desktop'}</p>;
});

function HookInfo() {
  const w = useWindowWidth();
  return <p>Hook: {w}px</p>;
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <HookInfo />
      <WindowWidth>{(w) => <p>Render prop: {w >= 1024 ? 'show sidebar' : 'hide sidebar'}</p>}</WindowWidth>
      <LayoutInfo />
      <small>Resize the preview panel to see all three update.</small>
    </div>
  );
}`,
      },
      result: 'All three lines update as the preview is resized.',
      explanation:
        'The hook version is the simplest call site and adds no wrapper component. Render props and HOCs are thin layers over the same hook, useful when an API needs a component (e.g. legacy class components or a library prop like rowRenderer).',
    },
    {
      title: 'Polymorphic Button with "as" and asChild',
      scenario: 'A design-system Button must render as button, anchor or React Router Link with identical styles.',
      steps: [
        'Implement Button with an "as" prop (default "button")',
        'Implement a Slot that merges props into its single child',
        'Use <Button as="a"> and <Button asChild><a/></Button>',
      ],
      code: `<Button onClick={save}>Save</Button>
<Button as="a" href="/pricing">Pricing</Button>
<Button as={Link} to="/jobs">Jobs</Button>          // React Router
<Button asChild><Link to="/jobs">Jobs</Link></Button>  // shadcn/ui style`,
      playground: {
        jsx: `const styles = { display: 'inline-block', padding: '8px 16px', margin: 4, borderRadius: 8, background: '#4f46e5', color: '#fff', textDecoration: 'none', border: 0, cursor: 'pointer', font: 'inherit' };

function Slot({ children, ...props }) {
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...props,
    ...child.props,
    style: { ...props.style, ...child.props.style },
  });
}

function Button({ as: Comp = 'button', asChild = false, style, ...props }) {
  const Root = asChild ? Slot : Comp;
  return <Root style={{ ...styles, ...style }} {...props} />;
}

function FakeLink({ to, ...props }) {     // stands in for React Router <Link>
  return <a href={'#' + to} {...props} />;
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <Button onClick={() => alert('saved')}>button element</Button>
      <Button as="a" href="#pricing">anchor via as</Button>
      <Button as={FakeLink} to="/jobs">Link via as</Button>
      <Button asChild style={{ background: '#16a34a' }}><a href="#docs">anchor via asChild</a></Button>
      <p>Inspect the elements: same styles, correct semantic tags.</p>
    </div>
  );
}`,
      },
      result: 'Four identical-looking buttons; the first is a <button>, the others are <a> elements.',
      explanation:
        'The as prop swaps the rendered element type. asChild hands rendering to the child and merges the Button props into it, which avoids wrapping a link inside a button (invalid HTML) and keeps the child\'s own props.',
    },
  ],
  interview: [
    { q: 'What are compound components? Give a real example.', a: 'A set of components that work together and share implicit state through context, letting users compose them freely, e.g. <Select><Select.Option/></Select>, Radix Tabs (Tabs.Root, Tabs.List, Tabs.Trigger, Tabs.Content), or HTML select/option.', level: 'Easy' },
    { q: 'Why is context preferred over React.Children.map + cloneElement for compound components?', a: 'cloneElement only reaches direct children, so wrapping a child in a div or fragment breaks it, and it overwrites props implicitly. Context works at any depth and makes the dependency explicit.', level: 'Medium' },
    { q: 'What is a render prop?', a: 'A prop whose value is a function that a component calls to know what to render, passing it internal data: <DataFetcher url="...">{data => <List data={data} />}</DataFetcher>. It shares logic while letting the caller control markup.', level: 'Easy' },
    { q: 'What is a higher-order component and what are its drawbacks?', a: 'A function that takes a component and returns an enhanced component (withAuth(Page)). Drawbacks: wrapper hell, prop collisions, hidden prop origins, static methods and refs need forwarding, harder typing. Custom hooks replace most use cases.', level: 'Medium' },
    { q: 'Should you still use HOCs in 2025?', a: 'Rarely, for cross-cutting wrappers applied to many components, e.g. withErrorBoundary, route guards in config-based routing, analytics or feature flags. For sharing stateful logic use custom hooks.', level: 'Medium' },
    { q: 'How do you make a component support both controlled and uncontrolled modes?', a: 'Accept value/defaultValue/onChange. If value !== undefined, treat it as controlled and use the prop; otherwise store state internally initialised from defaultValue. Always call onChange. Encapsulate this in a useControllableState hook.', level: 'Hard' },
    { q: 'What is a headless component or hook?', a: 'One that provides logic, state, keyboard handling and accessibility but no markup or styles, e.g. TanStack Table, Downshift, React Aria, Headless UI. You render your own UI with the data and prop getters it returns.', level: 'Medium' },
    { q: 'What are prop getters and why merge handlers?', a: 'Functions like getToggleProps(userProps) that return all props an element needs (aria-*, id, onClick) merged with the user props. Handlers must be composed so the user handler and the internal handler both run; otherwise spreading would overwrite one of them.', level: 'Hard' },
    { q: 'What is a polymorphic component?', a: 'A component that can render as different elements or components via a prop like as or component, keeping the same styles and behaviour: <Text as="h1">, <Button as={Link} to="/">.', level: 'Easy' },
    { q: 'asChild vs as prop?', a: 'as swaps the element type inside the component and needs complex generic typing. asChild (Radix Slot) renders the child element and merges the component props into it, so the child keeps its own type and props. shadcn/ui uses asChild.', level: 'Hard' },
    { q: 'How do you prevent prop explosion in a reusable component?', a: 'Use composition (children, compound components, slots), inversion of control (render props, headless hooks, asChild), sensible defaults, and split rarely used features into separate components instead of adding boolean flags.', level: 'Medium' },
    { q: 'Why add a guard hook (useTabs) that throws outside the provider?', a: 'Without it, a missing provider yields undefined context and confusing errors later. Throwing "Tabs.Tab must be used within <Tabs>" fails fast with a clear message and lets the hook return a non-null type in TypeScript.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a compound <Accordion> with Accordion.Item, Accordion.Trigger and Accordion.Content that supports type="single" (one open at a time) and type="multiple".',
      hint: 'Keep an array of open values; Item provides its own value through a second context.',
      solution: `const { useState, useContext, createContext } = React;
const AccCtx = createContext(null);
const ItemCtx = createContext(null);

function Accordion({ type = 'single', children }) {
  const [open, setOpen] = useState([]);
  const toggle = (v) => setOpen(o => o.includes(v) ? o.filter(x => x !== v) : type === 'single' ? [v] : [...o, v]);
  return <AccCtx.Provider value={{ open, toggle }}>{children}</AccCtx.Provider>;
}
Accordion.Item = ({ value, children }) => <ItemCtx.Provider value={value}><div style={{ borderBottom: '1px solid #ddd' }}>{children}</div></ItemCtx.Provider>;
Accordion.Trigger = ({ children }) => {
  const { open, toggle } = useContext(AccCtx); const value = useContext(ItemCtx);
  return <button aria-expanded={open.includes(value)} onClick={() => toggle(value)}>{children}</button>;
};
Accordion.Content = ({ children }) => {
  const { open } = useContext(AccCtx); const value = useContext(ItemCtx);
  return open.includes(value) ? <div>{children}</div> : null;
};

function App() {
  return (
    <Accordion type="single">
      <Accordion.Item value="a"><Accordion.Trigger>Shipping</Accordion.Trigger><Accordion.Content>2-4 days</Accordion.Content></Accordion.Item>
      <Accordion.Item value="b"><Accordion.Trigger>Returns</Accordion.Trigger><Accordion.Content>7 days</Accordion.Content></Accordion.Item>
    </Accordion>
  );
}`,
    },
    {
      task: 'Write a withRole(Component, allowedRoles) HOC that shows "Access denied" unless useAuth().user.role is allowed. Set a helpful displayName.',
      hint: 'Return a new function component that calls the hook.',
      solution: `export function withRole(Component, allowedRoles) {
  function WithRole(props) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <p>Access denied</p>;
    return <Component {...props} />;
  }
  WithRole.displayName = 'withRole(' + (Component.displayName || Component.name) + ')';
  return WithRole;
}

export default withRole(AdminDashboard, ['admin']);`,
    },
    {
      task: 'Create a headless useCounter({ min, max, step }) hook that returns count plus getIncrementProps and getDecrementProps (with disabled at the limits) and use it in two differently styled counters.',
      hint: 'Prop getters return { onClick, disabled, "aria-label" }.',
      solution: `const { useState } = React;
function useCounter({ min = 0, max = 10, step = 1, initial = min } = {}) {
  const [count, setCount] = useState(initial);
  const getIncrementProps = (p = {}) => ({ 'aria-label': 'increase', disabled: count >= max, onClick: () => setCount(c => Math.min(max, c + step)), ...p });
  const getDecrementProps = (p = {}) => ({ 'aria-label': 'decrease', disabled: count <= min, onClick: () => setCount(c => Math.max(min, c - step)), ...p });
  return { count, getIncrementProps, getDecrementProps };
}
function QtyPicker() {
  const { count, getIncrementProps, getDecrementProps } = useCounter({ min: 1, max: 5, initial: 1 });
  return <div><button {...getDecrementProps()}>-</button> {count} <button {...getIncrementProps()}>+</button></div>;
}
function Rating() {
  const { count, getIncrementProps, getDecrementProps } = useCounter({ max: 5 });
  return <p>{'★'.repeat(count) + '☆'.repeat(5 - count)} <a {...getDecrementProps()}>less</a> | <a {...getIncrementProps()}>more</a></p>;
}
function App() { return <><QtyPicker /><Rating /></>; }`,
    },
    {
      task: 'Make a polymorphic <Text as="h1" size="xl"> component that defaults to <p> and maps size to font sizes.',
      hint: 'const Comp = as || "p".',
      solution: `const sizes = { sm: 14, md: 16, lg: 20, xl: 28 };
function Text({ as: Comp = 'p', size = 'md', style, ...props }) {
  return <Comp style={{ fontSize: sizes[size], margin: '4px 0', ...style }} {...props} />;
}
function App() {
  return (
    <>
      <Text as="h1" size="xl">Find your next job</Text>
      <Text size="lg">1,200 openings for React developers</Text>
      <Text as="span" size="sm">Updated today</Text>
    </>
  );
}`,
    },
  ],
  quiz: [
    { question: 'How do compound components usually share state?', options: ['Global variables', 'Through context', 'localStorage', 'Redux only'], answer: 1, explanation: 'Context lets children at any depth read the parent state.' },
    { question: 'Which pattern did custom hooks largely replace?', options: ['Compound components', 'Error boundaries', 'Portals', 'HOCs and render props for logic sharing'], answer: 3, explanation: 'Hooks share stateful logic without wrapper components.' },
    { question: 'A component receives value={undefined} and defaultValue="a". It is:', options: ['Uncontrolled', 'Controlled', 'Broken', 'Read-only'], answer: 0, explanation: 'With no value prop the component manages its own state.' },
    { question: 'What does a prop getter typically do with a user onClick?', options: ['Ignores it', 'Throws an error', 'Composes it with the internal handler so both run', 'Replaces the internal handler'], answer: 2, explanation: 'Handlers are composed (callAll) so neither is lost.' },
    { question: 'What does asChild do in Radix/shadcn Button?', options: ['Renders children twice', 'Merges the Button props into its single child element', 'Wraps the child in a button', 'Makes the child uncontrolled'], answer: 1, explanation: 'Slot clones the child with merged props, so <Button asChild><a/></Button> renders an anchor.' },
  ],
};
