export default {
  id: 'day-26-error-boundaries-portals',
  title: 'Error Boundaries and Portals: Graceful Failures, Modals, Tooltips and Toasts',
  module: 'Module 5: Advanced React',
  day: 26,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Error Boundaries stop one broken component from blanking the whole app by showing a fallback UI instead. Portals render a component into a different DOM node (like document.body), which is the right way to build modals, toasts and tooltips that must escape overflow and z-index problems.',
  objectives: [
    'Explain what happens when a component throws during rendering',
    'Write a class-based Error Boundary with getDerivedStateFromError and componentDidCatch',
    'Know which errors boundaries do NOT catch and how to handle them',
    'Render modals and toasts into document.body with ReactDOM.createPortal',
    'Understand event bubbling through portals and basic modal accessibility',
  ],
  theory: [
    {
      heading: 'What happens when a component crashes?',
      content:
        'If any component throws an error **while rendering**, React 18 **unmounts the whole tree** and the user sees a blank white page. React does this on purpose: showing broken, half-updated UI could be worse (e.g. a wrong bank balance).\n\nAn **Error Boundary** is a component that catches errors in its **child tree** and shows a **fallback UI** instead, while the rest of the app keeps working.\n\nAnalogy: circuit breakers in a house. If the kitchen has a short circuit, only the kitchen breaker trips; the lights in the rest of the house stay on.',
    },
    {
      heading: 'Writing an Error Boundary',
      content:
        'Error boundaries must be **class components** (there is no hook equivalent yet). A class becomes a boundary when it defines one or both of:\n\n- `static getDerivedStateFromError(error)`: return new state to render the fallback (runs during render, must be pure)\n- `componentDidCatch(error, info)`: side effects like logging to a service (Sentry, LogRocket); `info.componentStack` shows where it happened\n\nYou write it once and reuse it everywhere. Many teams use the `react-error-boundary` package, which gives a ready `<ErrorBoundary FallbackComponent={...} onReset={...}>` and a `useErrorBoundary` hook.',
      syntax:
        "class ErrorBoundary extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { hasError: false, error: null };\n  }\n  static getDerivedStateFromError(error) {\n    return { hasError: true, error };\n  }\n  componentDidCatch(error, info) {\n    console.error('Logged:', error, info.componentStack);\n  }\n  render() {\n    if (this.state.hasError) return this.props.fallback || <h2>Something went wrong.</h2>;\n    return this.props.children;\n  }\n}",
    },
    {
      heading: 'What error boundaries do NOT catch',
      content:
        'Boundaries catch errors thrown during **rendering, in lifecycle methods and in constructors** of components below them. They do **not** catch:\n\n- Errors inside **event handlers** (onClick): use normal `try/catch` and set error state\n- **Asynchronous** code (setTimeout, fetch promises): catch them and set state\n- Errors in **server-side rendering**\n- Errors thrown **in the boundary itself** (only boundaries above it can catch those)\n\nTrick: to send an async/event error to a boundary, store it in state and **throw it during render**: `if (error) throw error;` (this is what `useErrorBoundary().showBoundary(error)` does).',
      tip: 'In development, React still shows the error overlay even when a boundary catches it. Close the overlay to see your fallback. In production builds only the fallback appears.',
    },
    {
      heading: 'Where to place boundaries and how to reset',
      content:
        'Granularity is a design choice:\n- **Top-level** boundary around the whole app: last line of defence ("Something went wrong, reload")\n- **Per route/page**: a broken page does not hide the navbar\n- **Per widget**: a failing chart shows "Chart unavailable" while the rest of the dashboard works\n\nTo let users **recover**, give the fallback a "Try again" button that resets the boundary state. A common trick is to give the boundary a `key` and change it, which remounts the subtree fresh.',
    },
    {
      heading: 'Portals: render somewhere else in the DOM',
      content:
        'Normally a component\'s HTML appears inside its parent\'s DOM node. That causes problems for modals and tooltips: a parent with `overflow: hidden` clips them, or a parent\'s `z-index` stacking context hides them behind other content.\n\n`ReactDOM.createPortal(children, domNode)` renders `children` into **any DOM node** (usually `document.body` or a dedicated `#modal-root`) while keeping them **in the same React tree**.\n\nThat means:\n- Props, state and **context** still work as usual\n- **Events bubble through the React tree**, not the DOM tree: a click inside a portal bubbles to the React parent\'s onClick even though the DOM node is elsewhere\n\nAnalogy: a TV in a hotel room showing a channel from the central broadcasting room: physically elsewhere, logically connected.',
      syntax:
        "function Modal({ children, onClose }) {\n  return ReactDOM.createPortal(\n    <div className=\"backdrop\" onClick={onClose}>\n      <div className=\"dialog\" onClick={e => e.stopPropagation()}>{children}</div>\n    </div>,\n    document.body\n  );\n}",
    },
    {
      heading: 'Accessible modals',
      content:
        'A good modal:\n- Has `role="dialog"`, `aria-modal="true"` and `aria-labelledby` pointing to its title\n- Moves focus into the dialog when it opens and returns focus when it closes\n- Closes on **Escape** and on backdrop click (optional)\n- Prevents background scroll while open\n\nThe native `<dialog>` element with `showModal()` gives much of this for free and can be combined with React refs. UI libraries (Radix, Headless UI, MUI) handle focus trapping for you.\n\nComing next: Day 27 introduces testing React components with Vitest and React Testing Library.',
    },
  ],
  examples: [
    {
      title: 'Error Boundary around a buggy widget',
      scenario: 'A dashboard has two widgets. One crashes when its "Break me" button is clicked. Only that widget shows a fallback; the other keeps working.',
      steps: [
        'Write the ErrorBoundary class with getDerivedStateFromError and componentDidCatch',
        'Create a BuggyCounter that throws during render when count reaches 3',
        'Wrap each widget in its own ErrorBoundary',
        'Add a "Try again" button in the fallback that resets the boundary',
        'Run and click the buggy counter 3 times (close the dev overlay if shown)',
      ],
      code: `class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.log('Report to logging service:', error.message); }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div role="alert">
          <p>Widget crashed: {this.state.error.message}</p>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BuggyCounter() {
  const [count, setCount] = React.useState(0);
  if (count === 3) throw new Error('Counter exploded at 3!');
  return <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>;
}`,
      playground: {
        jsx: `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.log('Report to logging service:', error.message);
  }
  reset() {
    this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ background: '#ffe5e5', padding: 10, borderRadius: 6 }}>
          <p style={{ margin: 0 }}>{this.props.name} crashed: {this.state.error.message}</p>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BuggyCounter() {
  const [count, setCount] = React.useState(0);
  if (count === 3) throw new Error('Counter exploded at 3!');
  return <button onClick={() => setCount(c => c + 1)}>Buggy counter: {count} (crashes at 3)</button>;
}

function Clock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>Healthy widget, time: {now.toLocaleTimeString()}</p>;
}

function App() {
  const box = { border: '1px solid #ccc', padding: 12, marginBottom: 10, borderRadius: 6 };
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={box}>
        <ErrorBoundary name="Counter widget"><BuggyCounter /></ErrorBoundary>
      </div>
      <div style={box}>
        <ErrorBoundary name="Clock widget"><Clock /></ErrorBoundary>
      </div>
    </div>
  );
}`,
      },
      result: 'After the third click the counter area turns red with "Counter widget crashed: Counter exploded at 3!" while the clock keeps ticking. "Try again" restores a fresh counter at 0.',
      explanation:
        'When BuggyCounter throws during render, React looks for the closest boundary above it. getDerivedStateFromError switches that boundary to its fallback; componentDidCatch logs. Resetting the state renders the children again, which mount fresh with count 0.',
    },
    {
      title: 'Sending async errors to a boundary',
      scenario: 'A fetch fails inside an event handler. Boundaries do not catch that automatically, so we store the error and re-throw it during render.',
      steps: [
        'Write a useThrowAsync hook that stores an error in state and throws it on the next render',
        'Call fetch in a click handler; in catch(), call showBoundary(err)',
        'Wrap the component in ErrorBoundary',
        'Run and click "Load broken endpoint"',
      ],
      code: `function useErrorBoundary() {
  const [error, setError] = React.useState(null);
  if (error) throw error;              // thrown during render -> caught by boundary
  return { showBoundary: setError };
}

async function load() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
  } catch (err) {
    showBoundary(err);
  }
}`,
      playground: {
        jsx: `class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ color: 'crimson' }}>
          <p>Could not load data: {this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function useErrorBoundary() {
  const [error, setError] = React.useState(null);
  if (error) throw error;
  return { showBoundary: setError };
}

function Posts() {
  const { showBoundary } = useErrorBoundary();
  const [posts, setPosts] = React.useState([]);

  async function load(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setPosts(await res.json());
    } catch (err) {
      showBoundary(err);
    }
  }

  return (
    <div>
      <button onClick={() => load('https://jsonplaceholder.typicode.com/posts?_limit=3')}>Load posts</button>{' '}
      <button onClick={() => load('https://jsonplaceholder.typicode.com/not-a-real-endpoint')}>Load broken endpoint</button>
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <ErrorBoundary><Posts /></ErrorBoundary>
    </div>
  );
}`,
      },
      result: '"Load posts" shows three titles. "Load broken endpoint" replaces the area with "Could not load data: HTTP 404" and a Retry button.',
      explanation:
        'Errors in async code happen outside rendering, so the boundary cannot see them. Storing the error in state triggers a re-render where the hook throws it, and now the boundary catches it like a render error.',
    },
    {
      title: 'Modal with createPortal (escaping overflow: hidden)',
      scenario: 'A card with overflow: hidden contains an "Open details" button. A normal child modal would be clipped; the portal modal renders into document.body.',
      steps: [
        'Write a Modal component that returns ReactDOM.createPortal(jsx, document.body)',
        'Add role="dialog", aria-modal and an Escape key listener',
        'Stop click propagation inside the dialog so clicking content does not close it',
        'Render the Modal from inside a small card with overflow: hidden',
        'Run, click "Open details" and close with the button, backdrop or Escape',
      ],
      code: `function Modal({ title, onClose, children }) {
  React.useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="backdrop" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}>
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}`,
      playground: {
        jsx: `function Modal({ title, onClose, children }) {
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    if (closeRef.current) closeRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div onClick={onClose}
         style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}
           style={{ background: 'white', padding: 20, borderRadius: 8, width: 280, fontFamily: 'sans-serif' }}>
        <h2 id="modal-title" style={{ marginTop: 0 }}>{title}</h2>
        {children}
        <button ref={closeRef} onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ width: 220, height: 90, overflow: 'hidden', border: '2px dashed #999', padding: 10 }}>
        <p style={{ margin: 0 }}>Small card (overflow: hidden)</p>
        <button onClick={() => setOpen(true)}>Open details</button>
      </div>
      {open && (
        <Modal title="Order #1042" onClose={close}>
          <p>Status: Shipped<br />Expected: Friday</p>
        </Modal>
      )}
    </div>
  );
}`,
      },
      result: 'Clicking "Open details" shows a centred dialog over a dark backdrop, not clipped by the small card. Close, backdrop click or Escape closes it.',
      explanation:
        'createPortal puts the modal DOM directly in document.body, outside the card\'s overflow and stacking context. It is still a React child of App, so it receives props and its state is controlled by App.',
    },
    {
      title: 'Toast notifications through a portal + context',
      scenario: 'Any component can call notify("Saved!"). Toasts appear in the bottom-right corner via a portal and disappear after 3 seconds.',
      steps: [
        'Create ToastContext with a notify function',
        'ToastProvider keeps a toasts array and renders them with createPortal into document.body',
        'Remove each toast with setTimeout',
        'Call notify from deeply nested buttons',
        'Run and click the buttons several times',
      ],
      code: `const ToastContext = React.createContext(null);
export const useToast = () => React.useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const notify = React.useCallback(text => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      {ReactDOM.createPortal(<div className="toasts">{toasts.map(t => <div key={t.id}>{t.text}</div>)}</div>, document.body)}
    </ToastContext.Provider>
  );
}`,
      playground: {
        jsx: `const ToastContext = React.createContext(null);
const useToast = () => React.useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const nextId = React.useRef(1);
  const notify = React.useCallback((text, type = 'info') => {
    const id = nextId.current++;
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  const colors = { info: '#2563eb', success: '#16a34a', error: '#dc2626' };
  return (
    <ToastContext.Provider value={notify}>
      {children}
      {ReactDOM.createPortal(
        <div aria-live="polite" style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 1000 }}>
          {toasts.map(t => (
            <div key={t.id} style={{ background: colors[t.type], color: 'white', padding: '8px 14px', borderRadius: 6, fontFamily: 'sans-serif' }}>
              {t.text}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function SaveButton() {
  const notify = useToast();
  return <button onClick={() => notify('Profile saved', 'success')}>Save</button>;
}
function DeleteButton() {
  const notify = useToast();
  return <button onClick={() => notify('Could not delete: permission denied', 'error')}>Delete</button>;
}

function App() {
  return (
    <ToastProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <h3>Settings</h3>
        <section><SaveButton /> <DeleteButton /></section>
      </div>
    </ToastProvider>
  );
}`,
      },
      result: 'Each click shows a coloured toast in the bottom-right corner. Toasts stack and each disappears after three seconds.',
      explanation:
        'The provider renders the toast container through a portal so it is always on top of the page, while context lets any component trigger a toast without prop drilling. aria-live="polite" makes screen readers announce new toasts.',
    },
  ],
  interview: [
    { q: 'What is an Error Boundary?', a: 'A React component that catches JavaScript errors during rendering, in lifecycle methods and constructors of its child tree, logs them, and displays a fallback UI instead of crashing the whole app.', level: 'Easy' },
    { q: 'Why must Error Boundaries be class components?', a: 'Because they rely on the class lifecycle methods static getDerivedStateFromError and componentDidCatch, which have no hook equivalents yet. Libraries like react-error-boundary wrap this in a reusable component.', level: 'Medium' },
    { q: 'Difference between getDerivedStateFromError and componentDidCatch?', a: 'getDerivedStateFromError runs during render and returns state to show the fallback (must be pure). componentDidCatch runs after commit and is for side effects such as logging the error and componentStack.', level: 'Medium' },
    { q: 'Which errors are NOT caught by Error Boundaries?', a: 'Errors in event handlers, asynchronous code (setTimeout, promises), server-side rendering, and errors thrown in the boundary itself.', level: 'Medium' },
    { q: 'How do you handle errors in event handlers?', a: 'With regular try/catch inside the handler and setting error state to render a message, or by passing the error to a boundary with a pattern such as useErrorBoundary().showBoundary(error).', level: 'Medium' },
    { q: 'What happens in React 18 if an error is not caught by any boundary?', a: 'React unmounts the entire component tree, leaving a blank page.', level: 'Easy' },
    { q: 'How do you reset an Error Boundary?', a: 'Set its error state back to null (e.g. a "Try again" button), or change its key prop to remount it; react-error-boundary offers resetErrorBoundary and resetKeys.', level: 'Hard' },
    { q: 'What is a Portal in React?', a: 'A way to render children into a DOM node outside the parent component\'s DOM hierarchy using ReactDOM.createPortal(children, domNode), while keeping them in the same React tree.', level: 'Easy' },
    { q: 'Give use cases for portals.', a: 'Modals/dialogs, toasts/notifications, tooltips, dropdown menus and popovers that must escape parent overflow:hidden or z-index stacking contexts.', level: 'Easy' },
    { q: 'How do events behave in portals?', a: 'Events bubble according to the React component tree, not the DOM tree. A click inside a portal will trigger onClick handlers on its React ancestors even though the DOM node lives elsewhere.', level: 'Hard' },
    { q: 'Does context work inside a portal?', a: 'Yes. Portals are part of the React tree, so context providers above the portal component are available inside it.', level: 'Medium' },
    { q: 'What makes a modal accessible?', a: 'role="dialog", aria-modal="true", a label via aria-labelledby, moving focus into it and trapping focus, closing on Escape, returning focus to the trigger on close, and preventing background interaction.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a reusable ErrorBoundary that accepts a fallback render function: fallback={(error, reset) => ...}. Use it around a component that throws when given a bad "user" prop.',
      hint: 'Call this.props.fallback(this.state.error, this.reset) in render.',
      solution: `class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; this.reset = () => this.setState({ error: null }); }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}

function Profile({ user }) {
  return <h2>{user.name.toUpperCase()}</h2>;   // crashes if user is null
}

function App() {
  const [user, setUser] = React.useState(null);
  return (
    <ErrorBoundary fallback={(err, reset) => (
      <div>
        <p>Error: {err.message}</p>
        <button onClick={() => { setUser({ name: 'Ravi' }); reset(); }}>Load a valid user</button>
      </div>
    )}>
      <Profile user={user} />
    </ErrorBoundary>
  );
}`,
    },
    {
      task: 'Build a confirm dialog with a portal: clicking "Delete account" opens "Are you sure?" with Cancel and Delete buttons. Close on Escape.',
      hint: 'Pass onConfirm and onCancel props; use createPortal into document.body.',
      solution: `function ConfirmDialog({ message, onConfirm, onCancel }) {
  React.useEffect(() => {
    const onKey = e => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: '#0008', display: 'grid', placeItems: 'center' }}>
      <div role="alertdialog" aria-modal="true" style={{ background: '#fff', padding: 20 }}>
        <p>{message}</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Delete</button>
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [ask, setAsk] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const cancel = React.useCallback(() => setAsk(false), []);
  if (deleted) return <p>Account deleted.</p>;
  return (
    <div>
      <button onClick={() => setAsk(true)}>Delete account</button>
      {ask && <ConfirmDialog message="Are you sure?" onCancel={cancel} onConfirm={() => { setDeleted(true); setAsk(false); }} />}
    </div>
  );
}`,
    },
    {
      task: 'Make a Tooltip component that shows text in a portal positioned above the hovered element using getBoundingClientRect.',
      hint: 'Store the rect in state on mouseenter; render a fixed-position div at rect.top - 30, rect.left.',
      solution: `function Tooltip({ text, children }) {
  const [rect, setRect] = React.useState(null);
  return (
    <>
      <span onMouseEnter={e => setRect(e.currentTarget.getBoundingClientRect())} onMouseLeave={() => setRect(null)}>
        {children}
      </span>
      {rect && ReactDOM.createPortal(
        <div role="tooltip" style={{ position: 'fixed', top: rect.top - 30, left: rect.left, background: '#111', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
          {text}
        </div>,
        document.body
      )}
    </>
  );
}

function App() {
  return (
    <div style={{ padding: 60, overflow: 'hidden' }}>
      <Tooltip text="Saves your work"><button>Save</button></Tooltip>
    </div>
  );
}`,
    },
    {
      task: 'Place boundaries at three levels (app, page, widget) and explain in comments what the user sees if the widget, the page or the layout crashes.',
      hint: 'The nearest boundary above the crash catches it.',
      solution: `// Assume ErrorBoundary from the lesson.
function App() {
  return (
    <ErrorBoundary fallback={<h1>Something went wrong. Please reload.</h1>}>   {/* 3) layout crash -> whole-app fallback */}
      <Navbar />
      <ErrorBoundary fallback={<p>This page failed to load.</p>}>                {/* 2) page crash -> navbar still visible */}
        <DashboardPage>
          <ErrorBoundary fallback={<p>Chart unavailable</p>}>                       {/* 1) widget crash -> only chart replaced */}
            <SalesChart />
          </ErrorBoundary>
          <RecentOrders />
        </DashboardPage>
      </ErrorBoundary>
    </ErrorBoundary>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which method lets an Error Boundary render a fallback UI?',
      options: ['componentDidMount', 'static getDerivedStateFromError', 'shouldComponentUpdate', 'useErrorEffect'],
      answer: 1,
      explanation: 'It returns state that switches render to the fallback.',
    },
    {
      question: 'Which error will an Error Boundary catch?',
      options: ['An error thrown while a child component renders', 'An error in an onClick handler', 'A rejected fetch promise', 'An error in setTimeout'],
      answer: 0,
      explanation: 'Boundaries catch render, lifecycle and constructor errors of their children.',
    },
    {
      question: 'What does ReactDOM.createPortal(child, container) do?',
      options: ['Opens a new browser window', 'Creates an iframe', 'Copies the component', 'Renders child into the container DOM node while keeping it in the React tree'],
      answer: 3,
      explanation: 'Portals change the DOM location, not the React tree position.',
    },
    {
      question: 'A click inside a portal modal bubbles to…',
      options: ['Only document.body', 'Nothing; portals stop events', 'Its React ancestors, following the React tree', 'The iframe parent'],
      answer: 2,
      explanation: 'Synthetic events propagate through the React component tree.',
    },
    {
      question: 'Why use a portal for a modal inside a card with overflow: hidden?',
      options: ['Portals are faster', 'So the modal is not clipped by the parent\'s overflow or stacking context', 'Because modals cannot use state', 'To avoid using CSS'],
      answer: 1,
      explanation: 'Rendering into body escapes clipping and z-index issues.',
    },
  ],
};
