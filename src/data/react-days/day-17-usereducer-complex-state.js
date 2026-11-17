export default {
  id: 'day-17-usereducer-complex-state',
  title: 'useReducer for Complex State: Reducers, Actions, Dispatch, useReducer + Context',
  module: 'Module 3: Hooks',
  day: 17,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'useReducer moves all state-update logic into one pure function called a reducer. It is the go-to hook when state has several related pieces or many different ways to change, such as a shopping cart, a form wizard or a to-do list.',
  objectives: [
    'Explain what a reducer, an action and dispatch are',
    'Write a pure reducer with a switch statement and immutable updates',
    'Replace several useState calls with one useReducer',
    'Use lazy initialization and action payloads',
    'Combine useReducer with Context to share state and dispatch app-wide',
  ],
  theory: [
    {
      heading: 'What is a reducer?',
      content:
        'A **reducer** is a plain function that takes the **current state** and an **action**, and returns the **next state**:\n\n`(state, action) => newState`\n\nAnalogy: think of a bank. You do not walk into the vault and change your balance yourself. You fill in a slip (the **action**: "deposit 500") and give it to the cashier (**dispatch**). The cashier follows fixed rules (the **reducer**) and updates the balance (the **state**). Every change goes through the same rule book, so it is predictable and easy to audit.\n\nThe name comes from `Array.prototype.reduce`, which also combines a previous value with the next item to produce a new value.',
    },
    {
      heading: 'useReducer syntax',
      content:
        '`useReducer` takes a reducer and an initial state, and returns the current state plus a `dispatch` function.\n\n- `state`: the current value (often an object)\n- `dispatch(action)`: sends an action to the reducer; React calls `reducer(state, action)` and re-renders with the result\n- An **action** is usually an object with a `type` string and optional data, e.g. `{ type: \'added\', text: \'Buy milk\' }`. Extra data is often called the **payload**.',
      syntax:
        "function reducer(state, action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'decrement': return { count: state.count - 1 };\n    case 'set':       return { count: action.payload };\n    default: throw new Error('Unknown action: ' + action.type);\n  }\n}\n\nconst [state, dispatch] = React.useReducer(reducer, { count: 0 });\ndispatch({ type: 'increment' });",
    },
    {
      heading: 'Rules for reducers: pure and immutable',
      content:
        'A reducer must be **pure**:\n- Same input always gives the same output\n- No side effects: no fetch, no setTimeout, no localStorage, no Math.random inside the reducer\n- **Never mutate** `state`. Return a new object or array with spread `...`, `map`, `filter`\n\nWhy? React compares the old and new state by reference. If you mutate and return the same object, React may skip the re-render. Pure reducers are also easy to test: call `reducer(oldState, action)` and check the result, no React needed.',
      syntax:
        "// WRONG: mutating\ncase 'added':\n  state.todos.push(action.todo);\n  return state;\n\n// RIGHT: new array\ncase 'added':\n  return { ...state, todos: [...state.todos, action.todo] };",
      tip: 'React may call your reducer twice in Strict Mode during development to help you find impure reducers. If something happens twice (e.g. an item is added twice), your reducer is mutating or has side effects.',
    },
    {
      heading: 'useState vs useReducer: when to choose which',
      content:
        'Both manage state; useReducer is just a different style.\n\nUse **useState** when:\n- State is a single primitive (a number, a string, a boolean)\n- Updates are simple and few\n\nUse **useReducer** when:\n- Several state values change together (loading, data, error)\n- The next state depends on the previous state in complex ways\n- There are many event handlers that update state, and you want the logic in one place\n- You want to test the update logic separately\n\nRule of thumb: if your component has 4+ useState calls that are often updated together, consider a reducer.',
    },
    {
      heading: 'Lazy initialization and resetting',
      content:
        'useReducer accepts an optional third argument: an **init function**. `useReducer(reducer, initialArg, init)` calls `init(initialArg)` only once, on the first render. This is useful when building the initial state is expensive, for example reading and parsing saved data.\n\nA reset action is easy: return the initial state again.',
      syntax:
        "function init(startCount) {\n  return { count: startCount, history: [] };\n}\nconst [state, dispatch] = React.useReducer(reducer, 10, init);\n\ncase 'reset': return init(10);",
    },
    {
      heading: 'useReducer + Context = a tiny global store',
      content:
        'On Day 16 you learned Context. Put them together:\n\n1. Call `useReducer` in a provider component\n2. Pass `state` and `dispatch` through context (often two separate contexts)\n3. Any child can read state or dispatch actions without prop drilling\n\nThis is the same idea Redux uses (Day 23), just built only with React. `dispatch` is **stable**: React guarantees its identity never changes, so it is safe to pass down and to omit from dependency arrays.\n\nComing next: Day 18 covers performance hooks (useMemo, useCallback, React.memo).',
    },
  ],
  examples: [
    {
      title: 'Counter with a reducer',
      scenario: 'A counter with +1, -1, +5 and Reset buttons. All logic sits in one reducer.',
      steps: [
        'Write a reducer function with cases increment, decrement, add and reset',
        'Call useReducer(reducer, { count: 0 })',
        'Dispatch actions from button clicks',
        'Click Run and try all buttons',
      ],
      code: `function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'add':       return { count: state.count + action.amount };
    case 'reset':     return { count: 0 };
    default: throw new Error('Unknown action ' + action.type);
  }
}
const [state, dispatch] = React.useReducer(reducer, { count: 0 });`,
      playground: {
        jsx: `function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'add': return { count: state.count + action.amount };
    case 'reset': return { count: 0 };
    default: throw new Error('Unknown action ' + action.type);
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, { count: 0 });
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>{state.count}</h1>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>{' '}
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>{' '}
      <button onClick={() => dispatch({ type: 'add', amount: 5 })}>+5</button>{' '}
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}`,
      },
      result: 'A big number with four buttons. -1, +1 and +5 change the number; Reset brings it back to 0.',
      explanation:
        'Buttons never change state directly. They describe what happened by dispatching an action. The reducer decides how the state changes. The add action carries extra data (amount), which is the payload.',
    },
    {
      title: 'To-do list with add, toggle and delete',
      scenario: 'A classic to-do list where every change is an action: added, toggled, deleted, cleared_done.',
      steps: [
        'Define initialState = { todos: [], nextId: 1 }',
        'Write the reducer with immutable updates (spread, map, filter)',
        'Keep the input text in a small useState (UI-only state)',
        'Dispatch actions on submit, checkbox change and delete click',
        'Run, add a few tasks, tick some and clear the completed ones',
      ],
      code: `function todoReducer(state, action) {
  switch (action.type) {
    case 'added':
      return { nextId: state.nextId + 1,
               todos: [...state.todos, { id: state.nextId, text: action.text, done: false }] };
    case 'toggled':
      return { ...state, todos: state.todos.map(t => t.id === action.id ? { ...t, done: !t.done } : t) };
    case 'deleted':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
    case 'cleared_done':
      return { ...state, todos: state.todos.filter(t => !t.done) };
    default:
      return state;
  }
}`,
      playground: {
        jsx: `const { useReducer, useState } = React;

function todoReducer(state, action) {
  switch (action.type) {
    case 'added':
      return { nextId: state.nextId + 1, todos: [...state.todos, { id: state.nextId, text: action.text, done: false }] };
    case 'toggled':
      return { ...state, todos: state.todos.map(t => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case 'deleted':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
    case 'cleared_done':
      return { ...state, todos: state.todos.filter(t => !t.done) };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [], nextId: 1 });
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: 'added', text: text.trim() });
    setText('');
  }

  const left = state.todos.filter(t => !t.done).length;
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 360 }}>
      <form onSubmit={handleSubmit}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="New task" />
        <button>Add</button>
      </form>
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {state.todos.map(t => (
          <li key={t.id}>
            <label style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggled', id: t.id })} />
              {t.text}
            </label>{' '}
            <button onClick={() => dispatch({ type: 'deleted', id: t.id })}>x</button>
          </li>
        ))}
      </ul>
      <p>{left} task(s) left</p>
      <button onClick={() => dispatch({ type: 'cleared_done' })}>Clear completed</button>
    </div>
  );
}`,
      },
      result: 'Type a task and press Add; it appears in the list. Ticking strikes it through, x deletes it, and "Clear completed" removes all ticked tasks. The counter shows tasks left.',
      explanation:
        'The reducer handles all list logic with map/filter/spread so the old state is never mutated. The input text stays in useState because it is local UI state that does not belong in the reducer.',
    },
    {
      title: 'Fetch-style status with one reducer (loading / success / error)',
      scenario: 'Instead of three separate useState calls for loading, data and error, model the request status with one reducer so impossible combinations cannot happen.',
      steps: [
        "Define initial state { status: 'idle', data: null, error: null }",
        'Add actions started, succeeded and failed',
        'Simulate a request with setTimeout in the event handler (not in the reducer)',
        'Run and click "Load (success)" and "Load (fail)"',
      ],
      code: `function reducer(state, action) {
  switch (action.type) {
    case 'started':   return { status: 'loading', data: null, error: null };
    case 'succeeded': return { status: 'success', data: action.data, error: null };
    case 'failed':    return { status: 'error', data: null, error: action.error };
    default: return state;
  }
}`,
      playground: {
        jsx: `function reducer(state, action) {
  switch (action.type) {
    case 'started': return { status: 'loading', data: null, error: null };
    case 'succeeded': return { status: 'success', data: action.data, error: null };
    case 'failed': return { status: 'error', data: null, error: action.error };
    default: return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, { status: 'idle', data: null, error: null });

  function load(shouldFail) {
    dispatch({ type: 'started' });
    setTimeout(() => {
      if (shouldFail) dispatch({ type: 'failed', error: 'Server is down (simulated)' });
      else dispatch({ type: 'succeeded', data: ['Apple', 'Banana', 'Cherry'] });
    }, 800);
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button onClick={() => load(false)}>Load (success)</button>{' '}
      <button onClick={() => load(true)}>Load (fail)</button>
      <p>Status: <b>{state.status}</b></p>
      {state.status === 'loading' && <p>Loading...</p>}
      {state.status === 'error' && <p style={{ color: 'crimson' }}>{state.error}</p>}
      {state.status === 'success' && <ul>{state.data.map(f => <li key={f}>{f}</li>)}</ul>}
    </div>
  );
}`,
      },
      result: 'Clicking "Load (success)" shows "Loading..." for under a second, then a list of three fruits. "Load (fail)" shows a red error message.',
      explanation:
        'Because each action sets all three fields at once, you can never end up with loading true AND an error at the same time. The side effect (setTimeout) lives in the event handler; the reducer stays pure.',
    },
    {
      title: 'useReducer + Context: shared shopping cart',
      scenario: 'Cart state lives in one reducer at the top. A product list dispatches actions and a summary reads state, both via context.',
      steps: [
        'Write cartReducer with add, remove and clear actions',
        'Create CartStateContext and CartDispatchContext',
        'In CartProvider, call useReducer and provide state and dispatch separately',
        'Consume with useContext in Products and Summary',
        'Run and add/remove products',
      ],
      code: `const CartStateContext = React.createContext(null);
const CartDispatchContext = React.createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = React.useReducer(cartReducer, { items: {} });
  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}`,
      playground: {
        jsx: `const { createContext, useContext, useReducer } = React;
const PRODUCTS = [
  { id: 'p1', name: 'T-shirt', price: 499 },
  { id: 'p2', name: 'Jeans', price: 1299 },
  { id: 'p3', name: 'Cap', price: 199 },
];

function cartReducer(state, action) {
  const qty = state.items[action.id] || 0;
  switch (action.type) {
    case 'add': return { items: { ...state.items, [action.id]: qty + 1 } };
    case 'remove': {
      const items = { ...state.items };
      if (qty <= 1) delete items[action.id]; else items[action.id] = qty - 1;
      return { items };
    }
    case 'clear': return { items: {} };
    default: return state;
  }
}

const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: {} });
  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

function Products() {
  const dispatch = useContext(CartDispatchContext);
  const { items } = useContext(CartStateContext);
  return (
    <ul>
      {PRODUCTS.map(p => (
        <li key={p.id}>
          {p.name} (Rs {p.price}) qty: {items[p.id] || 0}{' '}
          <button onClick={() => dispatch({ type: 'add', id: p.id })}>+</button>
          <button onClick={() => dispatch({ type: 'remove', id: p.id })}>-</button>
        </li>
      ))}
    </ul>
  );
}

function Summary() {
  const { items } = useContext(CartStateContext);
  const dispatch = useContext(CartDispatchContext);
  const total = PRODUCTS.reduce((sum, p) => sum + (items[p.id] || 0) * p.price, 0);
  return <p><b>Total: Rs {total}</b> <button onClick={() => dispatch({ type: 'clear' })}>Clear</button></p>;
}

function App() {
  return (
    <CartProvider>
      <div style={{ fontFamily: 'sans-serif' }}>
        <h3>Shop</h3>
        <Products />
        <Summary />
      </div>
    </CartProvider>
  );
}`,
      },
      result: 'Each product row has + and - buttons and shows its quantity. The total updates instantly; Clear empties the cart.',
      explanation:
        'Products and Summary never receive props. They read state and dispatch from two contexts. Splitting state and dispatch means components that only dispatch could avoid re-rendering when state changes (with memo), because dispatch never changes identity.',
    },
  ],
  interview: [
    { q: 'What is useReducer?', a: 'A React hook for managing state with a reducer function. const [state, dispatch] = useReducer(reducer, initialState). You call dispatch(action) and React computes the next state with reducer(state, action).', level: 'Easy' },
    { q: 'What is a reducer function?', a: 'A pure function (state, action) => newState. It must not mutate state or perform side effects; it just calculates and returns the next state.', level: 'Easy' },
    { q: 'What is an action?', a: 'A plain object describing what happened, typically { type: "added", ...payload }. The type tells the reducer which case to run; the remaining fields carry data.', level: 'Easy' },
    { q: 'When would you prefer useReducer over useState?', a: 'When state is an object with several related fields, when the next state depends on the previous in complex ways, when many handlers update the same state, or when you want to test update logic in isolation.', level: 'Medium' },
    { q: 'Why must reducers be pure?', a: 'React may call reducers more than once (e.g. Strict Mode), and relies on reference changes to detect updates. Side effects or mutations cause bugs such as double-execution or missed re-renders. Pure reducers are also trivially testable.', level: 'Medium' },
    { q: 'What happens if a reducer returns the same state object?', a: 'React compares with Object.is; if the state is the same reference, React bails out and may skip re-rendering the component and its children.', level: 'Medium' },
    { q: 'Is dispatch stable between renders?', a: 'Yes. React guarantees the dispatch function identity is stable, so it is safe to pass to children and omit from useEffect/useCallback dependency arrays.', level: 'Medium' },
    { q: 'What is the third argument of useReducer?', a: 'An optional init function for lazy initialization: useReducer(reducer, initialArg, init). React calls init(initialArg) only on the first render to compute the initial state.', level: 'Medium' },
    { q: 'Where should side effects like API calls go when using useReducer?', a: 'In event handlers or useEffect. Dispatch actions before and after the async work (started / succeeded / failed). Never inside the reducer.', level: 'Hard' },
    { q: 'How does useReducer + Context compare to Redux?', a: 'Both use reducers and dispatched actions. Context + useReducer is built in and fine for small to medium apps. Redux Toolkit adds devtools, middleware, selectors with fine-grained subscriptions, and conventions that scale to large teams.', level: 'Hard' },
    { q: 'What should the default case of a reducer do?', a: 'Either return the current state unchanged or throw an error for unknown actions. Throwing helps catch typos in action types early.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a "light switch" reducer with actions turn_on, turn_off and toggle, plus a counter of how many times the light changed.',
      hint: 'State shape: { on: false, changes: 0 }. Only increment changes when "on" actually changes.',
      solution: `function reducer(state, action) {
  switch (action.type) {
    case 'turn_on':  return state.on ? state : { on: true, changes: state.changes + 1 };
    case 'turn_off': return !state.on ? state : { on: false, changes: state.changes + 1 };
    case 'toggle':   return { on: !state.on, changes: state.changes + 1 };
    default: return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, { on: false, changes: 0 });
  return (
    <div>
      <h2>{state.on ? 'ON' : 'OFF'}</h2>
      <p>Changed {state.changes} times</p>
      <button onClick={() => dispatch({ type: 'turn_on' })}>On</button>
      <button onClick={() => dispatch({ type: 'turn_off' })}>Off</button>
      <button onClick={() => dispatch({ type: 'toggle' })}>Toggle</button>
    </div>
  );
}`,
    },
    {
      task: 'Convert a signup form that uses separate useState calls for name, email and password into one useReducer with a single "field_changed" action and a "reset" action.',
      hint: "Use a computed key: { ...state, [action.field]: action.value }.",
      solution: `const initial = { name: '', email: '', password: '' };

function formReducer(state, action) {
  switch (action.type) {
    case 'field_changed': return { ...state, [action.field]: action.value };
    case 'reset': return initial;
    default: return state;
  }
}

function App() {
  const [form, dispatch] = React.useReducer(formReducer, initial);
  const onChange = e => dispatch({ type: 'field_changed', field: e.target.name, value: e.target.value });
  return (
    <form onSubmit={e => { e.preventDefault(); alert(JSON.stringify(form)); dispatch({ type: 'reset' }); }}>
      <input name="name" value={form.name} onChange={onChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={onChange} placeholder="Email" />
      <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Password" />
      <button>Sign up</button>
    </form>
  );
}`,
    },
    {
      task: 'Create a step wizard (Step 1 of 3) with next, back and goto actions. Back is disabled on step 1 and Next is disabled on step 3.',
      hint: 'Clamp the step between 1 and 3 inside the reducer.',
      solution: `function wizardReducer(state, action) {
  switch (action.type) {
    case 'next': return { step: Math.min(3, state.step + 1) };
    case 'back': return { step: Math.max(1, state.step - 1) };
    case 'goto': return { step: action.step };
    default: return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(wizardReducer, { step: 1 });
  const titles = ['Personal info', 'Address', 'Confirm'];
  return (
    <div>
      <h3>Step {state.step} of 3: {titles[state.step - 1]}</h3>
      <button disabled={state.step === 1} onClick={() => dispatch({ type: 'back' })}>Back</button>
      <button disabled={state.step === 3} onClick={() => dispatch({ type: 'next' })}>Next</button>
      <button onClick={() => dispatch({ type: 'goto', step: 1 })}>Start over</button>
    </div>
  );
}`,
    },
    {
      task: 'Write a pure reducer for a bank account (deposit, withdraw, with an error message when funds are insufficient) and test it with console.log without rendering anything.',
      hint: 'Call the reducer directly: reducer({ balance: 100, error: null }, { type: "withdraw", amount: 500 }).',
      solution: `function bankReducer(state, action) {
  switch (action.type) {
    case 'deposit':
      return { balance: state.balance + action.amount, error: null };
    case 'withdraw':
      if (action.amount > state.balance) return { ...state, error: 'Insufficient funds' };
      return { balance: state.balance - action.amount, error: null };
    default:
      return state;
  }
}

let s = { balance: 100, error: null };
s = bankReducer(s, { type: 'deposit', amount: 50 });
console.log(s); // { balance: 150, error: null }
s = bankReducer(s, { type: 'withdraw', amount: 500 });
console.log(s); // { balance: 150, error: 'Insufficient funds' }
s = bankReducer(s, { type: 'withdraw', amount: 30 });
console.log(s); // { balance: 120, error: null }`,
    },
  ],
  quiz: [
    {
      question: 'What does useReducer return?',
      options: ['[state, setState]', '[dispatch, state]', '[state, dispatch]', 'Only the state'],
      answer: 2,
      explanation: 'const [state, dispatch] = useReducer(reducer, initialState).',
    },
    {
      question: 'Which of these is allowed inside a reducer?',
      options: ['Returning a new object built with spread', 'Calling fetch()', 'Pushing into state.items', 'Saving to localStorage'],
      answer: 0,
      explanation: 'Reducers must be pure and must not mutate; returning a new object is correct.',
    },
    {
      question: 'What is a typical action object?',
      options: ["'increment'", "{ type: 'increment', amount: 2 }", 'function increment() {}', '[increment, 2]'],
      answer: 1,
      explanation: 'By convention, actions are plain objects with a type field plus optional payload.',
    },
    {
      question: 'When is useReducer usually a better choice than useState?',
      options: ['For a single boolean toggle', 'Never, they are identical', 'Only for API calls', 'When several related state fields change together in many ways'],
      answer: 3,
      explanation: 'useReducer shines with complex, related state and many update types.',
    },
    {
      question: 'Why can dispatch be safely left out of a useEffect dependency array?',
      options: ['Because effects ignore functions', 'Because React guarantees dispatch has a stable identity', 'Because dispatch is a global variable', 'It cannot; it must always be included'],
      answer: 1,
      explanation: 'React keeps the same dispatch function for the lifetime of the component.',
    },
  ],
};
