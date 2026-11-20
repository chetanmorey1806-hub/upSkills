export default {
  id: 'day-47-advanced-forms',
  title: 'Advanced Forms: Multi-step Wizard, React Hook Form + Zod Schemas, Dynamic Fields (useFieldArray) and Form Persistence',
  module: 'Module 10: Advanced Industry Topics',
  day: 47,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Real products have big forms: KYC onboarding, checkout, job applications, GST invoices. You will combine React Hook Form 7 with Zod 3 schemas for type-safe validation, split long forms into a multi-step wizard that validates step by step, add and remove dynamic rows with useFieldArray, and save drafts to localStorage so users never lose their work.',
  objectives: [
    'Write Zod schemas (strings, numbers, enums, arrays, refine) and connect them with zodResolver',
    'Build a multi-step wizard that validates only the current step with trigger() and shows a review step',
    'Manage dynamic lists of fields with useFieldArray (append, remove) and compute live totals with useWatch',
    'Persist and restore a form draft safely with watch + localStorage and reset()',
    'Apply industry UX rules: inline errors, aria-invalid, disabled submit while submitting, server errors with setError',
  ],
  theory: [
    {
      heading: 'Why "advanced" forms need structure',
      content:
        'On Day 24 you used React Hook Form (RHF) for simple forms. Industry forms are harder:\n\n- **Long**: an insurance or loan application has 30+ fields\n- **Conditional**: show "GSTIN" only if "I am a business" is ticked\n- **Dynamic**: an invoice with any number of line items, a resume with many jobs\n- **Cross-field rules**: "confirm password must match", "end date after start date"\n- **Server rules**: "this email is already registered"\n- **Not losing work**: a refresh or accidental back button should not wipe 10 minutes of typing\n\nThe industry stack in 2025: **React Hook Form 7** (fast, uncontrolled inputs, minimal re-renders) + **Zod 3** (schema validation) + `@hookform/resolvers` to connect them. `npm install react-hook-form zod @hookform/resolvers`\n\nAnalogy: the form is a bank account opening process. Zod is the bank\'s rule book (what is a valid PAN, minimum age 18). RHF is the clerk who collects the papers, checks them against the rule book and tells you exactly which box is wrong. The wizard is the multiple counters you visit one after another.',
    },
    {
      heading: 'Zod schemas: one source of truth for validation',
      content:
        'A **Zod schema** describes the shape and rules of your data. `schema.parse(data)` returns typed data or throws; `safeParse` returns `{ success, data | error }`.\n\nCommon building blocks:\n- `z.string().min(2, \'Too short\').max(50)`, `.email()`, `.regex(/^[6-9]\\d{9}$/, \'Invalid mobile\')`, `.trim()`\n- `z.coerce.number().min(18)`: HTML inputs give strings; `coerce` converts to number\n- `z.enum([\'UPI\', \'Card\', \'COD\'])`, `z.boolean()`, `z.literal(true)` (must tick "I agree")\n- `z.array(itemSchema).min(1, \'Add at least one item\')`\n- `.optional()`, `.or(z.literal(\'\'))` for optional text inputs\n- `.refine(fn, { message, path })` for **cross-field** rules (attach the error to a specific field with `path`)\n- `z.infer<typeof schema>` gives the TypeScript type for free\n\nBecause the schema is plain JS, the **same schema can validate on the backend** (Node/Express), so frontend and backend rules never drift apart.',
      syntax:
        "import { z } from 'zod';\n\nexport const signupSchema = z\n  .object({\n    name: z.string().trim().min(2, 'Enter your full name'),\n    email: z.string().email('Enter a valid email'),\n    mobile: z.string().regex(/^[6-9]\\d{9}$/, 'Enter a 10-digit Indian mobile number'),\n    age: z.coerce.number().int().min(18, 'You must be 18+'),\n    password: z.string().min(8, 'Min 8 characters').regex(/[0-9]/, 'Add a number'),\n    confirm: z.string(),\n    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) }),\n  })\n  .refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });",
    },
    {
      heading: 'React Hook Form + zodResolver essentials',
      content:
        'Connect the schema with `useForm({ resolver: zodResolver(schema), defaultValues, mode })`.\n\n- `register(\'email\')` wires an input (name, ref, onChange, onBlur)\n- `handleSubmit(onValid)` validates, then calls your function with **parsed** data\n- `formState`: `errors`, `isSubmitting`, `isDirty`, `isValid`, `dirtyFields`\n- `mode: \'onTouched\'` shows errors after the user leaves a field (good UX); `onChange` validates on every keystroke; default is `onSubmit`\n- `setError(\'email\', { message: \'Already registered\' })` for **server-side** errors\n- `reset(values)` to load data (edit form) or clear after submit\n- `watch(\'field\')` / `useWatch({ control, name })` to react to values (conditional fields, totals)\n- `Controller` for non-native inputs (MUI Select, date pickers, react-select)\n\nAccessibility: add `aria-invalid={!!errors.email}` and link the error with `aria-describedby`. Disable the submit button while `isSubmitting` to prevent double orders.',
      syntax:
        "const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({\n  resolver: zodResolver(signupSchema),\n  defaultValues: { name: '', email: '', mobile: '', terms: false },\n  mode: 'onTouched',\n});\n\nconst onSubmit = async data => {\n  try { await api.post('/signup', data); }\n  catch (e) { if (e.response?.status === 409) setError('email', { message: 'Email already registered' }); }\n};\n\n<input {...register('email')} aria-invalid={!!errors.email} aria-describedby=\"email-err\" />\n{errors.email && <p id=\"email-err\" role=\"alert\">{errors.email.message}</p>}",
    },
    {
      heading: 'Multi-step wizards',
      content:
        'A wizard splits one long form into steps (Personal > Address > Payment > Review). Best practice in companies: **one `useForm` for the whole wizard**, not one per step. The steps are just different groups of inputs rendered conditionally.\n\nHow to validate only the current step:\n1. Keep an array of field names per step: `[[\'name\', \'email\'], [\'city\', \'pincode\'], ...]`\n2. On "Next", call `const ok = await trigger(stepFields[step])`; move forward only if `ok`\n3. On the last step, `handleSubmit` validates everything once more\n\nWith RHF, inputs of hidden steps unmount; set `shouldUnregister: false` (the default) so their values are kept. Show a **progress indicator** with `aria-current="step"`, allow going **Back** without validation, and show a **Review** step that reads values with `getValues()` and lets the user jump to edit a step.\n\nAlternative: one Zod schema per step and merge them (`step1.merge(step2)`) for the final submit.',
      tip: 'Move focus to the step heading when the step changes (ref.current.focus()) so keyboard and screen-reader users know the content changed.',
    },
    {
      heading: 'Dynamic fields with useFieldArray',
      content:
        '`useFieldArray({ control, name: \'items\' })` manages a list of field groups: invoice line items, family members, phone numbers, education history.\n\nIt returns `fields` (with a stable generated `id` for each row), and methods `append`, `remove`, `insert`, `move`, `swap`, `update`, `replace`.\n\nRules:\n- Use `key={field.id}` (NOT the index) so React keeps the right input state when rows are removed or reordered\n- Register nested names with the index: `register(`items.${index}.qty`)`\n- `append({ name: \'\', qty: 1, price: 0 })`: always pass a **complete** default object\n- Validate the array in Zod: `items: z.array(itemSchema).min(1)`\n- For live totals use `useWatch({ control, name: \'items\' })` and compute in render\n\nIndustry example: a GST invoice with items, quantity, rate, GST % and a live grand total in ₹.',
      syntax:
        "const { control, register } = useForm({ defaultValues: { items: [{ name: '', qty: 1, price: 0 }] } });\nconst { fields, append, remove } = useFieldArray({ control, name: 'items' });\nconst items = useWatch({ control, name: 'items' });\nconst total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);\n\n{fields.map((field, index) => (\n  <div key={field.id}>\n    <input {...register(`items.${index}.name`)} />\n    <input type=\"number\" {...register(`items.${index}.qty`)} />\n    <button type=\"button\" onClick={() => remove(index)}>Remove</button>\n  </div>\n))}\n<button type=\"button\" onClick={() => append({ name: '', qty: 1, price: 0 })}>Add item</button>",
    },
    {
      heading: 'Form state persistence (drafts)',
      content:
        'Users get interrupted: a phone call, a closed tab, a 2G network drop. Saving a **draft** is a small feature that users love.\n\nPattern:\n1. On mount, read the draft from `localStorage` (or sessionStorage for sensitive forms) and call `reset(draft)`, or pass it as `defaultValues`\n2. Subscribe to changes with `watch(callback)` (returns a subscription to unsubscribe in cleanup) and save **debounced** (every 500 ms, not every keystroke)\n3. Also save the current **step** of the wizard\n4. On successful submit, **remove** the draft\n5. Show "Draft saved" feedback and a "Discard draft" button\n\nSecurity: **never persist passwords, card numbers, CVV, OTPs or Aadhaar numbers**. Exclude them before saving. For multi-device drafts, save to the backend instead (`PATCH /applications/:id`), as Naukri and LinkedIn do.\n\nAlso warn before leaving with unsaved changes: the `beforeunload` event when `isDirty`, or React Router\'s `useBlocker` for in-app navigation.\n\nThe playground cannot import react-hook-form or zod, so the examples use a **tiny schema validator and form hook written in plain React** that mimic their APIs. The `code` blocks show the real libraries.',
    },
  ],
  examples: [
    {
      title: 'Signup form with a Zod schema, cross-field refine and server error',
      scenario:
        'A Kolkata ed-tech startup needs a signup form: name, email, Indian mobile, age 18+, password + confirm and terms. "test@taken.com" should show a server error under the email field.',
      steps: [
        'npm install react-hook-form zod @hookform/resolvers',
        'Create src/features/auth/schemas.js with signupSchema (refine for confirm password)',
        'Create SignupForm.jsx with useForm({ resolver: zodResolver(signupSchema), mode: "onTouched" })',
        'Register each input, show errors with aria-invalid and role="alert"',
        'In onSubmit call the API and use setError for a 409 "email taken" response',
        'Run the playground (mini zod + mini useForm)',
      ],
      code: `// src/features/auth/SignupForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from './schemas';
import { api } from '@/lib/axios';

function Field({ label, error, id, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={id + '-err'} role="alert" className="err">{error.message}</p>}
    </div>
  );
}

export default function SignupForm() {
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', mobile: '', age: '', password: '', confirm: '', terms: false },
    mode: 'onTouched',
  });

  const onSubmit = async data => {
    try {
      await api.post('/auth/signup', data);
      reset();
    } catch (err) {
      if (err.response?.status === 409) setError('email', { message: 'This email is already registered' });
      else setError('root', { message: 'Something went wrong, please try again' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Full name" id="name" error={errors.name}>
        <input id="name" {...register('name')} aria-invalid={!!errors.name} aria-describedby="name-err" />
      </Field>
      <Field label="Email" id="email" error={errors.email}>
        <input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
      </Field>
      {/* mobile, age, password, confirm ... */}
      <label><input type="checkbox" {...register('terms')} /> I accept the terms</label>
      {errors.terms && <p role="alert">{errors.terms.message}</p>}
      {errors.root && <p role="alert">{errors.root.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Sign up'}</button>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState, useRef } = React;

// ---------- mini Zod (learning version) ----------
const rule = (test, message) => ({ test, message });
function field(rules = []) {
  return {
    min: (n, m) => field([...rules, rule(v => String(v).trim().length >= n, m)]),
    regex: (re, m) => field([...rules, rule(v => re.test(String(v)), m)]),
    email: m => field([...rules, rule(v => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v), m)]),
    numberMin: (n, m) => field([...rules, rule(v => v !== '' && Number(v) >= n, m)]),
    isTrue: m => field([...rules, rule(v => v === true, m)]),
    check: v => { const bad = rules.find(r => !r.test(v)); return bad ? bad.message : null; },
  };
}
const z = { field: () => field() };
function object(shape, refinements = []) {
  return {
    refine: (fn, opts) => object(shape, [...refinements, { fn, ...opts }]),
    safeParse(data, only) {
      const errors = {};
      Object.keys(shape).forEach(k => { if (only && !only.includes(k)) return; const m = shape[k].check(data[k]); if (m) errors[k] = { message: m }; });
      refinements.forEach(r => { const k = r.path[0]; if ((!only || only.includes(k)) && !errors[k] && !r.fn(data)) errors[k] = { message: r.message }; });
      return Object.keys(errors).length ? { success: false, errors } : { success: true, data };
    },
  };
}

const signupSchema = object({
  name: z.field().min(2, 'Enter your full name'),
  email: z.field().email('Enter a valid email'),
  mobile: z.field().regex(/^[6-9]\\d{9}$/, 'Enter a 10-digit Indian mobile number'),
  age: z.field().numberMin(18, 'You must be 18+'),
  password: z.field().min(8, 'Min 8 characters').regex(/[0-9]/, 'Add at least one number'),
  confirm: z.field(),
  terms: z.field().isTrue('Please accept the terms'),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

// ---------- mini useForm (mode: onTouched) ----------
function useForm({ schema, defaultValues }) {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const touched = useRef({});
  const validate = (vals, only) => { const r = schema.safeParse(vals, only); return r.success ? {} : r.errors; };
  const register = name => ({
    name,
    id: name,
    ...(typeof defaultValues[name] === 'boolean' ? { checked: values[name] } : { value: values[name] }),
    onChange: e => {
      const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      const next = { ...values, [name]: v };
      setValues(next);
      const fields = Object.keys(touched.current);
      if (fields.length) setErrors(validate(next, fields));
    },
    onBlur: () => { touched.current[name] = true; setErrors(validate(values, Object.keys(touched.current))); },
  });
  const handleSubmit = onValid => async e => {
    e.preventDefault();
    Object.keys(defaultValues).forEach(k => { touched.current[k] = true; });
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try { await onValid(values); } finally { setSubmitting(false); }
  };
  const setError = (name, err) => setErrors(es => ({ ...es, [name]: err }));
  const reset = () => { setValues(defaultValues); setErrors({}); touched.current = {}; };
  return { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } };
}

const fakeApi = data => new Promise((res, rej) => setTimeout(() => (data.email === 'test@taken.com' ? rej({ status: 409 }) : res()), 800));

function Field({ label, error, name, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <p id={name + '-err'} role="alert" className="err">{error.message}</p>}
    </div>
  );
}

function App() {
  const [done, setDone] = useState(null);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({
    schema: signupSchema,
    defaultValues: { name: '', email: '', mobile: '', age: '', password: '', confirm: '', terms: false },
  });
  const onSubmit = async data => {
    try { await fakeApi(data); setDone(data.name); reset(); }
    catch (err) { if (err.status === 409) setError('email', { message: 'This email is already registered' }); }
  };
  const input = (name, type = 'text') => (
    <input type={type} {...register(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? name + '-err' : undefined} />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card">
      <h2>Create your account</h2>
      {done && <p className="ok">Welcome aboard, {done}!</p>}
      <Field label="Full name" name="name" error={errors.name}>{input('name')}</Field>
      <Field label="Email (try test@taken.com)" name="email" error={errors.email}>{input('email', 'email')}</Field>
      <div className="two">
        <Field label="Mobile" name="mobile" error={errors.mobile}>{input('mobile', 'tel')}</Field>
        <Field label="Age" name="age" error={errors.age}>{input('age', 'number')}</Field>
      </div>
      <Field label="Password" name="password" error={errors.password}>{input('password', 'password')}</Field>
      <Field label="Confirm password" name="confirm" error={errors.confirm}>{input('confirm', 'password')}</Field>
      <label className="check"><input type="checkbox" {...register('terms')} /> I accept the terms</label>
      {errors.terms && <p role="alert" className="err">{errors.terms.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Sign up'}</button>
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f5f3ff; margin: 0; padding: 16px; }
.card { max-width: 400px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; display: grid; gap: 10px; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
h2 { margin: 0; }
.field { display: grid; gap: 4px; }
.two { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }
label { font-size: 13px; color: #374151; }
input:not([type=checkbox]) { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
input[aria-invalid=true] { border-color: #dc2626; background: #fef2f2; }
.err { color: #dc2626; font-size: 12px; margin: 0; }
.ok { background: #dcfce7; color: #166534; padding: 8px; border-radius: 8px; margin: 0; }
.check { display: flex; gap: 6px; align-items: center; }
button { padding: 10px; border: 0; border-radius: 8px; background: #7c3aed; color: #fff; font-weight: 600; cursor: pointer; }
button:disabled { opacity: .6; }`,
      },
      result:
        'Errors appear only after you leave a field (onTouched). A mobile like 12345 shows the Indian mobile message, age 16 shows "You must be 18+", different passwords show "Passwords do not match" under Confirm. Submitting with test@taken.com shows "This email is already registered" under Email after a short delay; any other valid email shows a welcome message and resets the form.',
      explanation:
        'Plain-React version of RHF + Zod. The schema object is the single rule book; the refine rule attaches its error to the confirm field via path, exactly like Zod. The hook validates only touched fields during typing (mode onTouched), validates everything on submit, disables the button while the request runs, and setError maps a 409 server response to the email field.',
    },
    {
      title: 'Multi-step KYC wizard with per-step validation and a review step',
      scenario:
        'A Mumbai fintech app onboards users in three steps: Personal details, Address, and Review & submit. "Next" must validate only the visible step, "Back" never validates.',
      steps: [
        'Create one schema for the whole wizard and an array of field names per step',
        'Use one useForm; render the current step\'s inputs based on a step state',
        'On Next call await trigger(stepFields[step]) and advance only when it returns true',
        'Show a progress bar with aria-current="step" and move focus to the step heading',
        'On the Review step show getValues() with Edit buttons that jump to a step',
        'Submit with handleSubmit on the last step',
      ],
      code: `import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().min(2, 'Required'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN (e.g. ABCDE1234F)'),
  dob: z.string().min(1, 'Required'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(1, 'Select a state'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit PIN code'),
});
const STEPS = [
  { title: 'Personal details', fields: ['fullName', 'pan', 'dob'] },
  { title: 'Address', fields: ['city', 'state', 'pincode'] },
  { title: 'Review & submit', fields: [] },
];

export default function KycWizard() {
  const [step, setStep] = useState(0);
  const headingRef = useRef(null);
  const { register, trigger, getValues, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: { fullName: '', pan: '', dob: '', city: '', state: '', pincode: '' } });

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const next = async () => {
    const ok = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (ok) setStep(s => s + 1);
  };
  const onSubmit = async data => { await api.post('/kyc', data); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ol className="progress">
        {STEPS.map((s, i) => <li key={s.title} aria-current={i === step ? 'step' : undefined}>{s.title}</li>)}
      </ol>
      <h2 tabIndex={-1} ref={headingRef}>{STEPS[step].title}</h2>
      {step === 0 && <>{/* fullName, pan, dob inputs with register */}</>}
      {step === 1 && <>{/* city, state, pincode inputs */}</>}
      {step === 2 && <Review values={getValues()} onEdit={setStep} />}
      {step > 0 && <button type="button" onClick={() => setStep(s => s - 1)}>Back</button>}
      {step < STEPS.length - 1
        ? <button type="button" onClick={next}>Next</button>
        : <button disabled={isSubmitting}>Submit KYC</button>}
    </form>
  );
}`,
      playground: {
        jsx: `const { useState, useRef, useEffect } = React;

const rules = {
  fullName: v => (v.trim().length >= 2 ? null : 'Enter your full name'),
  pan: v => (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) ? null : 'Invalid PAN (e.g. ABCDE1234F)'),
  dob: v => {
    if (!v) return 'Select your date of birth';
    const age = (Date.now() - new Date(v).getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 18 ? null : 'You must be at least 18';
  },
  city: v => (v.trim().length >= 2 ? null : 'Enter your city'),
  state: v => (v ? null : 'Select a state'),
  pincode: v => (/^[1-9][0-9]{5}$/.test(v) ? null : 'Invalid 6-digit PIN code'),
};
const STEPS = [
  { title: 'Personal details', fields: ['fullName', 'pan', 'dob'] },
  { title: 'Address', fields: ['city', 'state', 'pincode'] },
  { title: 'Review & submit', fields: [] },
];
const LABELS = { fullName: 'Full name', pan: 'PAN', dob: 'Date of birth', city: 'City', state: 'State', pincode: 'PIN code' };
const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'West Bengal', 'Gujarat', 'Telangana'];

function App() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ fullName: '', pan: '', dob: '', city: '', state: '', pincode: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const headingRef = useRef(null);
  const first = useRef(true);

  useEffect(() => { if (first.current) { first.current = false; return; } headingRef.current.focus(); }, [step]);

  // like RHF trigger(fields): validate only these fields, return true/false
  function trigger(fields) {
    const errs = {};
    fields.forEach(f => { const m = rules[f](values[f]); if (m) errs[f] = m; });
    setErrors(e => { const n = { ...e }; fields.forEach(f => delete n[f]); return { ...n, ...errs }; });
    return Object.keys(errs).length === 0;
  }
  const set = name => e => {
    const v = name === 'pan' ? e.target.value.toUpperCase() : e.target.value;
    setValues(s => ({ ...s, [name]: v }));
    if (errors[name]) setErrors(es => ({ ...es, [name]: rules[name](v) }));
  };
  const next = () => { if (trigger(STEPS[step].fields)) setStep(s => s + 1); };
  async function submit(e) {
    e.preventDefault();
    if (!trigger(Object.keys(rules))) return;
    setStatus('submitting');
    await new Promise(r => setTimeout(r, 900));
    setStatus('done');
  }

  const input = (name, props) => (
    <div className="field" key={name}>
      <label htmlFor={name}>{LABELS[name]}</label>
      {name === 'state' ? (
        <select id={name} value={values.state} onChange={set('state')} aria-invalid={!!errors.state}>
          <option value="">Select...</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
      ) : (
        <input id={name} value={values[name]} onChange={set(name)} aria-invalid={!!errors[name]} {...props} />
      )}
      {errors[name] && <p className="err" role="alert">{errors[name]}</p>}
    </div>
  );

  if (status === 'done') return <div className="card"><h2>KYC submitted</h2><p>Thank you, {values.fullName}. Verification usually takes 24 hours.</p></div>;

  return (
    <form className="card" onSubmit={submit} noValidate>
      <ol className="progress">
        {STEPS.map((s, i) => (
          <li key={s.title} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i + 1}</span>{s.title}
          </li>
        ))}
      </ol>
      <div className="bar"><div style={{ width: ((step + 1) / STEPS.length) * 100 + '%' }} /></div>
      <h2 tabIndex={-1} ref={headingRef}>{STEPS[step].title}</h2>

      {step === 0 && [input('fullName'), input('pan', { maxLength: 10, placeholder: 'ABCDE1234F' }), input('dob', { type: 'date' })]}
      {step === 1 && [input('city'), input('state'), input('pincode', { inputMode: 'numeric', maxLength: 6 })]}
      {step === 2 && (
        <dl className="review">
          {Object.keys(LABELS).map((k, i) => (
            <div key={k}>
              <dt>{LABELS[k]}</dt>
              <dd>{values[k]} <button type="button" className="link" onClick={() => setStep(i < 3 ? 0 : 1)}>Edit</button></dd>
            </div>
          ))}
        </dl>
      )}

      <div className="nav">
        {step > 0 && <button type="button" className="ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < STEPS.length - 1
          ? <button type="button" onClick={next}>Next</button>
          : <button disabled={status === 'submitting'}>{status === 'submitting' ? 'Submitting...' : 'Submit KYC'}</button>}
      </div>
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #ecfeff; margin: 0; padding: 16px; }
.card { max-width: 440px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; display: grid; gap: 10px; }
.progress { display: flex; list-style: none; padding: 0; margin: 0; gap: 6px; font-size: 12px; color: #64748b; }
.progress li { flex: 1; display: flex; align-items: center; gap: 6px; }
.progress span { width: 22px; height: 22px; border-radius: 50%; background: #e2e8f0; display: grid; place-items: center; font-weight: 700; flex-shrink: 0; }
.progress .now { color: #0e7490; font-weight: 600; } .progress .now span { background: #0e7490; color: #fff; }
.progress .done span { background: #22c55e; color: #fff; }
.bar { height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.bar div { height: 100%; background: #0e7490; transition: width .3s; }
h2 { margin: 4px 0; outline: none; }
.field { display: grid; gap: 4px; }
label { font-size: 13px; }
input, select { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
[aria-invalid=true] { border-color: #dc2626; }
.err { color: #dc2626; font-size: 12px; margin: 0; }
.review { margin: 0; display: grid; gap: 6px; }
.review div { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 4px 0; }
dt { color: #64748b; font-size: 13px; } dd { margin: 0; font-weight: 600; }
.nav { display: flex; justify-content: flex-end; gap: 8px; }
button { padding: 9px 18px; border: 0; border-radius: 8px; background: #0e7490; color: #fff; cursor: pointer; font-weight: 600; }
.ghost { background: #fff; color: #0e7490; border: 1px solid #0e7490; }
.link { background: none; color: #0e7490; padding: 0 0 0 6px; font-weight: 400; text-decoration: underline; }`,
      },
      result:
        'Step 1 shows name, PAN and DOB. Clicking Next with empty fields shows three errors and stays on step 1; an invalid PAN like "ABC123" shows the PAN message; a DOB less than 18 years ago is rejected. After valid input, the progress moves to Address. Review lists all values with Edit links. Submit shows "Submitting..." then a success screen.',
      explanation:
        'Plain-React version of the RHF wizard pattern: one values object for all steps and a `trigger(fields)` function that validates only the current step\'s fields, exactly like RHF\'s trigger. Values survive moving between steps because they live in one state, not in the step components. Focus moves to the heading after each step change, and aria-current="step" announces progress.',
    },
    {
      title: 'GST invoice with dynamic line items (useFieldArray) and live totals',
      scenario:
        'A small Surat textile trader creates invoices with any number of items. Each row has name, quantity, rate and GST %. The total must update live and at least one item is required.',
      steps: [
        'Define itemSchema and invoiceSchema with items: z.array(itemSchema).min(1)',
        'Call useFieldArray({ control, name: "items" })',
        'Render fields.map with key={field.id} and register("items.0.qty") style names',
        'Add "Add item" (append) and "Remove" (remove(index)) buttons',
        'Compute subtotal, GST and grand total from useWatch',
        'Run the playground and add/remove rows',
      ],
      code: `import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(1, 'Item name required'),
  qty: z.coerce.number().int().min(1, 'Min 1'),
  rate: z.coerce.number().positive('Must be > 0'),
  gst: z.coerce.number().refine(v => [0, 5, 12, 18, 28].includes(v), 'Invalid GST slab'),
});
const invoiceSchema = z.object({
  customer: z.string().min(2, 'Customer name required'),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
});
const emptyItem = { name: '', qty: 1, rate: 0, gst: 5 };
const inr = n => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export default function InvoiceForm() {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { customer: '', items: [emptyItem] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });

  const subtotal = items.reduce((s, i) => s + (+i.qty || 0) * (+i.rate || 0), 0);
  const gst = items.reduce((s, i) => s + (+i.qty || 0) * (+i.rate || 0) * (+i.gst || 0) / 100, 0);

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('customer')} placeholder="Customer" />
      {fields.map((field, index) => (
        <div key={field.id} className="row">
          <input {...register(\`items.\${index}.name\`)} placeholder="Item" />
          <input type="number" {...register(\`items.\${index}.qty\`)} />
          <input type="number" {...register(\`items.\${index}.rate\`)} />
          <select {...register(\`items.\${index}.gst\`)}>{[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}</select>
          <button type="button" onClick={() => remove(index)} disabled={fields.length === 1}>Remove</button>
          {errors.items?.[index]?.name && <p>{errors.items[index].name.message}</p>}
        </div>
      ))}
      {errors.items?.root && <p>{errors.items.root.message}</p>}
      <button type="button" onClick={() => append(emptyItem)}>+ Add item</button>
      <p>Subtotal {inr(subtotal)} | GST {inr(gst)} | Total {inr(subtotal + gst)}</p>
      <button>Save invoice</button>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState, useRef } = React;

// mini useFieldArray: stable ids + append/remove on an array in state
function useFieldArray(initial) {
  const nextId = useRef(0);
  const withId = item => ({ ...item, id: 'f' + nextId.current++ });
  const [fields, setFields] = useState(() => initial.map(withId));
  return {
    fields,
    append: item => setFields(f => [...f, withId(item)]),
    remove: index => setFields(f => f.filter((_, i) => i !== index)),
    update: (index, patch) => setFields(f => f.map((it, i) => (i === index ? { ...it, ...patch } : it))),
  };
}

const SLABS = [0, 5, 12, 18, 28];
const emptyItem = { name: '', qty: 1, rate: '', gst: 5 };
const inr = n => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

function validate(customer, items) {
  const errors = { items: [] };
  if (customer.trim().length < 2) errors.customer = 'Customer name required';
  if (items.length === 0) errors.itemsRoot = 'Add at least one item';
  items.forEach((it, i) => {
    const e = {};
    if (!it.name.trim()) e.name = 'Item name required';
    if (!(Number(it.qty) >= 1)) e.qty = 'Min 1';
    if (!(Number(it.rate) > 0)) e.rate = 'Must be > 0';
    if (Object.keys(e).length) errors.items[i] = e;
  });
  const ok = !errors.customer && !errors.itemsRoot && errors.items.every(x => !x);
  return { ok, errors };
}

function App() {
  const [customer, setCustomer] = useState('Shree Krishna Fabrics');
  const { fields, append, remove, update } = useFieldArray([
    { name: 'Cotton saree', qty: 10, rate: 850, gst: 5 },
    { name: 'Silk dupatta', qty: 4, rate: 1250, gst: 12 },
  ]);
  const [errors, setErrors] = useState({ items: [] });
  const [saved, setSaved] = useState(null);

  const lineTotal = it => (Number(it.qty) || 0) * (Number(it.rate) || 0);
  const subtotal = fields.reduce((s, it) => s + lineTotal(it), 0);
  const gst = fields.reduce((s, it) => s + (lineTotal(it) * it.gst) / 100, 0);

  function submit(e) {
    e.preventDefault();
    const { ok, errors } = validate(customer, fields);
    setErrors(errors);
    if (ok) { setSaved({ customer, items: fields.map(({ id, ...rest }) => rest), total: subtotal + gst }); console.log('invoice', fields); }
  }
  const err = (i, k) => errors.items[i] && errors.items[i][k];

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>Tax invoice</h2>
      <label>Customer<input value={customer} onChange={e => setCustomer(e.target.value)} aria-invalid={!!errors.customer} /></label>
      {errors.customer && <p className="err">{errors.customer}</p>}
      <div className="head"><span>Item</span><span>Qty</span><span>Rate</span><span>GST</span><span>Amount</span><span /></div>
      {fields.map((field, index) => (
        <div className="row" key={field.id}>
          <input aria-label={'Item ' + (index + 1) + ' name'} value={field.name} onChange={e => update(index, { name: e.target.value })} aria-invalid={!!err(index, 'name')} placeholder="Item name" />
          <input aria-label="Quantity" type="number" min="1" value={field.qty} onChange={e => update(index, { qty: e.target.value })} aria-invalid={!!err(index, 'qty')} />
          <input aria-label="Rate" type="number" value={field.rate} onChange={e => update(index, { rate: e.target.value })} aria-invalid={!!err(index, 'rate')} placeholder="0" />
          <select aria-label="GST slab" value={field.gst} onChange={e => update(index, { gst: Number(e.target.value) })}>
            {SLABS.map(g => <option key={g} value={g}>{g}%</option>)}
          </select>
          <span className="amt">{inr(lineTotal(field))}</span>
          <button type="button" className="x" aria-label={'Remove item ' + (index + 1)} onClick={() => remove(index)}>x</button>
          {errors.items[index] && <p className="err full">{Object.values(errors.items[index]).join(' | ')}</p>}
        </div>
      ))}
      {errors.itemsRoot && fields.length === 0 && <p className="err">{errors.itemsRoot}</p>}
      <button type="button" className="ghost" onClick={() => append(emptyItem)}>+ Add item</button>
      <div className="totals">
        <p>Subtotal <b>{inr(subtotal)}</b></p>
        <p>GST <b>{inr(gst)}</b></p>
        <p className="grand">Grand total <b>{inr(subtotal + gst)}</b></p>
      </div>
      <button>Save invoice</button>
      {saved && <p className="ok">Saved invoice for {saved.customer}: {inr(saved.total)} ({saved.items.length} items)</p>}
    </form>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fefce8; margin: 0; padding: 16px; }
.card { max-width: 640px; margin: auto; background: #fff; padding: 18px; border-radius: 12px; display: grid; gap: 8px; }
h2 { margin: 0; }
label { display: grid; gap: 4px; font-size: 13px; }
input, select { padding: 7px 8px; border: 1px solid #d6d3d1; border-radius: 6px; font-size: 14px; min-width: 0; }
[aria-invalid=true] { border-color: #dc2626; background: #fef2f2; }
.head, .row { display: grid; grid-template-columns: 2.2fr .7fr 1fr .8fr 1.2fr 32px; gap: 6px; align-items: center; }
.head { font-size: 12px; color: #78716c; font-weight: 600; margin-top: 6px; }
.amt { text-align: right; font-size: 13px; font-variant-numeric: tabular-nums; }
.full { grid-column: 1 / -1; }
.x { background: #fee2e2; color: #b91c1c; border: 0; border-radius: 6px; height: 30px; cursor: pointer; }
.err { color: #dc2626; font-size: 12px; margin: 0; }
.totals { border-top: 2px dashed #e7e5e4; padding-top: 6px; }
.totals p { display: flex; justify-content: space-between; margin: 3px 0; }
.grand { font-size: 18px; }
button { padding: 9px 14px; border: 0; border-radius: 8px; background: #ca8a04; color: #fff; font-weight: 600; cursor: pointer; }
.ghost { background: #fff; color: #a16207; border: 1px dashed #ca8a04; }
.ok { background: #dcfce7; color: #166534; padding: 8px; border-radius: 8px; }`,
      },
      result:
        'Two rows appear with amounts ₹8,500.00 and ₹5,000.00, subtotal ₹13,500.00, GST ₹1,025.00 and grand total ₹14,525.00. Adding a row and leaving it empty then saving shows "Item name required | Must be > 0" under that row. Removing rows updates the totals instantly; removing all rows and saving shows "Add at least one item".',
      explanation:
        'Plain-React version of useFieldArray: each row gets a stable generated id used as the React key, so removing row 1 does not shift the typed text into the wrong inputs (which happens with index keys). Totals are derived during render from the current rows (like useWatch), never stored separately. Errors are per index, matching RHF\'s errors.items[index].field shape.',
    },
    {
      title: 'Auto-saving form drafts to localStorage',
      scenario:
        'A job portal\'s "Apply" form is long. If the candidate closes the tab, their answers (except sensitive fields) should be restored next time, with a clear "Draft saved" indicator and a Discard option.',
      steps: [
        'Read the draft from localStorage on mount and pass it as defaultValues (or call reset)',
        'Subscribe with watch(callback) and save debounced (500 ms) inside useEffect; unsubscribe in cleanup',
        'Strip sensitive fields (like a salary slip password or OTP) before saving',
        'Show "Saving..." / "Draft saved at 10:42" and a Discard draft button',
        'Remove the draft after a successful submit',
        'Run the playground, type something and click "Simulate refresh"',
      ],
      code: `import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const KEY = 'draft:job-application:v1';          // version the key when the shape changes
const SENSITIVE = ['otp', 'panCardNumber'];

const loadDraft = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? undefined; } catch { return undefined; }
};

export default function ApplyForm() {
  const [savedAt, setSavedAt] = useState(null);
  const { register, watch, reset, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: loadDraft() ?? { name: '', email: '', experience: '', coverLetter: '', otp: '' },
  });

  useEffect(() => {
    let timer;
    const subscription = watch(values => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const safe = { ...values };
        SENSITIVE.forEach(k => delete safe[k]);
        localStorage.setItem(KEY, JSON.stringify(safe));
        setSavedAt(new Date());
      }, 500);
    });
    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, [watch]);

  // warn before closing the tab with unsaved changes
  useEffect(() => {
    const handler = e => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onSubmit = async data => {
    await api.post('/applications', data);
    localStorage.removeItem(KEY);
    reset({ name: '', email: '', experience: '', coverLetter: '', otp: '' });
  };
  // ...inputs with register, plus:
  // {savedAt && <small>Draft saved at {savedAt.toLocaleTimeString('en-IN')}</small>}
}`,
      playground: {
        jsx: `const { useEffect, useRef, useState } = React;

const KEY = 'draft:job-application:v1';
const SENSITIVE = ['otp'];
const EMPTY = { name: '', email: '', role: 'Frontend Developer', experience: '', coverLetter: '', otp: '' };

function loadDraft() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function saveDraft(values) {
  const safe = { ...values };
  SENSITIVE.forEach(k => delete safe[k]);
  try { localStorage.setItem(KEY, JSON.stringify(safe)); } catch (e) {}
}
function clearDraft() { try { localStorage.removeItem(KEY); } catch (e) {} }

function ApplyForm({ onRefresh }) {
  const draft = useRef(loadDraft());
  const [values, setValues] = useState(() => ({ ...EMPTY, ...(draft.current || {}) }));
  const [status, setStatus] = useState(draft.current ? 'restored' : 'idle');
  const [savedAt, setSavedAt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const firstRender = useRef(true);

  // debounced autosave (like watch() subscription + setTimeout)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setStatus('saving');
    const t = setTimeout(() => { saveDraft(values); setSavedAt(new Date()); setStatus('saved'); }, 500);
    return () => clearTimeout(t);
  }, [values]);

  const set = k => e => setValues(v => ({ ...v, [k]: e.target.value }));
  const discard = () => { clearDraft(); setValues(EMPTY); setStatus('idle'); setSavedAt(null); firstRender.current = true; };
  async function submit(e) {
    e.preventDefault();
    if (!values.name || !values.email || values.otp !== '123456') { alertBox('Fill name, email and OTP 123456'); return; }
    await new Promise(r => setTimeout(r, 600));
    clearDraft();
    setSubmitted(true);
  }
  const [msg, setMsg] = useState('');
  function alertBox(m) { setMsg(m); setTimeout(() => setMsg(''), 2500); }

  if (submitted) return <div className="card"><h2>Application sent!</h2><p>The draft has been deleted.</p><button onClick={onRefresh}>Start again</button></div>;

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>Apply: Frontend Developer (Bengaluru)</h2>
      {status === 'restored' && (
        <div className="banner">We restored your saved draft. <button type="button" className="link" onClick={discard}>Discard draft</button></div>
      )}
      <label>Full name<input value={values.name} onChange={set('name')} /></label>
      <label>Email<input type="email" value={values.email} onChange={set('email')} /></label>
      <label>Years of experience
        <select value={values.experience} onChange={set('experience')}>
          <option value="">Select</option><option>Fresher</option><option>1-2</option><option>3-5</option><option>5+</option>
        </select>
      </label>
      <label>Cover letter<textarea rows="4" value={values.coverLetter} onChange={set('coverLetter')} /></label>
      <label>Email OTP (not saved in draft)<input value={values.otp} onChange={set('otp')} inputMode="numeric" placeholder="123456" /></label>
      {msg && <p className="err" role="alert">{msg}</p>}
      <div className="foot">
        <small aria-live="polite">
          {status === 'saving' && 'Saving draft...'}
          {status === 'saved' && savedAt && 'Draft saved at ' + savedAt.toLocaleTimeString('en-IN')}
        </small>
        <div>
          <button type="button" className="ghost" onClick={onRefresh}>Simulate refresh</button>
          <button>Submit</button>
        </div>
      </div>
    </form>
  );
}

function App() {
  const [mountKey, setMountKey] = useState(0);
  // remounting = like closing and reopening the page
  return <ApplyForm key={mountKey} onRefresh={() => setMountKey(k => k + 1)} />;
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f0f9ff; margin: 0; padding: 16px; }
.card { max-width: 460px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; display: grid; gap: 10px; }
h2 { margin: 0; font-size: 19px; }
label { display: grid; gap: 4px; font-size: 13px; color: #334155; }
input, select, textarea { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font: inherit; font-size: 14px; }
.banner { background: #fef9c3; padding: 8px 10px; border-radius: 8px; font-size: 13px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
small { color: #0369a1; }
button { padding: 9px 14px; border: 0; border-radius: 8px; background: #0284c7; color: #fff; font-weight: 600; cursor: pointer; margin-left: 6px; }
.ghost { background: #fff; color: #0284c7; border: 1px solid #0284c7; }
.link { background: none; color: #a16207; padding: 0; margin: 0; text-decoration: underline; font-weight: 400; }
.err { color: #dc2626; margin: 0; font-size: 13px; }`,
      },
      result:
        'Typing shows "Saving draft..." then "Draft saved at 10:42:05 am". Clicking "Simulate refresh" remounts the form: all fields come back except the OTP, and a yellow "We restored your saved draft" banner appears with Discard. Submitting with OTP 123456 deletes the draft.',
      explanation:
        'Plain-React version of RHF watch() + localStorage. The draft is loaded once (lazy useState) before the first render, so there is no flicker. Saving is debounced with setTimeout and cleanup, so fast typing writes to storage at most every 500 ms. Sensitive fields are stripped before saving, storage calls are wrapped in try/catch (private mode can throw), and the key includes a version so a future form shape change does not load incompatible old drafts.',
    },
  ],
  interview: [
    {
      q: 'Why do teams combine React Hook Form with Zod instead of writing validation in each input?',
      a: 'Zod gives one declarative schema as the single source of truth for rules (including cross-field rules), reusable on the backend and able to infer TypeScript types. RHF handles form state with uncontrolled inputs and minimal re-renders. zodResolver connects them, so components only register fields and display errors.',
      level: 'Easy',
    },
    {
      q: 'How do you validate only the current step of a multi-step form in React Hook Form?',
      a: 'Use a single useForm for the whole wizard, keep a list of field names per step, and on Next call const ok = await trigger(stepFields[step]); only advance when ok is true. The final step uses handleSubmit to validate everything. Values of earlier steps stay in the form state (shouldUnregister is false by default).',
      level: 'Medium',
    },
    {
      q: 'Why must you use field.id as the key in useFieldArray and not the index?',
      a: 'When a row is removed or reordered, indexes shift, so React would reuse the DOM inputs of the wrong rows, showing values or errors in the wrong place. field.id is a stable generated id per row, so React keeps each row\'s inputs attached to the right item.',
      level: 'Medium',
    },
    {
      q: 'How do you implement "confirm password must match" in Zod?',
      a: 'Use .refine (or .superRefine) on the object schema: z.object({ password, confirm }).refine(d => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] }). The path attaches the error to the confirm field so RHF shows it under that input.',
      level: 'Easy',
    },
    {
      q: 'What is z.coerce and why is it useful in forms?',
      a: 'HTML inputs always produce strings, even type="number". z.coerce.number() converts the input with Number() before validating, so "25" passes min(18) and the submitted data contains a real number. Alternatively use register("age", { valueAsNumber: true }).',
      level: 'Medium',
    },
    {
      q: 'How do you show a server-side validation error (like "email already registered") in RHF?',
      a: 'In the submit handler catch the API error and call setError("email", { type: "server", message: "..." }). For non-field errors use setError("root.serverError", {...}) and render errors.root. The error clears when the field is revalidated.',
      level: 'Medium',
    },
    {
      q: 'How would you persist a form draft, and what must you be careful about?',
      a: 'Subscribe to changes with watch(callback) in useEffect, debounce writes to localStorage (or save to the backend for multi-device drafts), restore with defaultValues or reset on mount, and remove the draft after successful submit. Never persist passwords, OTPs, card or ID numbers; version the storage key; wrap storage in try/catch; and consider expiry.',
      level: 'Medium',
    },
    {
      q: 'When do you need Controller in React Hook Form?',
      a: 'For components that do not expose a native input with ref/onChange/onBlur the way register expects: MUI Select/Autocomplete, react-select, date pickers, rich-text editors, custom sliders. Controller (or useController) passes value, onChange and onBlur props and keeps RHF in sync.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between watch and useWatch?',
      a: 'watch() from useForm re-renders the whole form component when watched values change (or, with a callback, subscribes without re-rendering). useWatch({ control, name }) isolates the re-render to the component that calls it, which is better for performance in big forms, for example a separate <InvoiceTotal control={control} /> component.',
      level: 'Hard',
    },
    {
      q: 'How do you show conditional fields, such as GSTIN only for business accounts, and validate them?',
      a: 'Watch the controlling field (const type = watch("accountType")) and render the extra input conditionally. In Zod use a discriminatedUnion on accountType, or superRefine to require gstin when accountType is "business". Decide whether hidden values should be kept or cleared (shouldUnregister or setValue).',
      level: 'Hard',
    },
    {
      q: 'List form UX practices you would check in a code review.',
      a: 'Labels linked to inputs, helpful placeholder-free labels, errors shown after blur not on first keystroke, aria-invalid and aria-describedby, focus on the first error on submit, disabled submit while submitting (no double orders), server errors mapped to fields, input types and inputMode for mobile keyboards, autocomplete attributes, preserving data on errors, and drafts for long forms.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Add a conditional "Company GSTIN" field that is required only when "I am buying for a business" is checked. Use RHF + Zod superRefine.',
      hint: 'GSTIN format: 15 characters, regex /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.',
      solution: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const schema = z.object({
  name: z.string().min(2),
  isBusiness: z.boolean(),
  gstin: z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.isBusiness && !GSTIN.test(d.gstin ?? '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gstin'], message: 'Enter a valid 15-character GSTIN' });
  }
});

export default function BillingForm() {
  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', isBusiness: false, gstin: '' },
  });
  const isBusiness = watch('isBusiness');
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register('name')} placeholder="Name" />
      <label><input type="checkbox" {...register('isBusiness')} /> I am buying for a business</label>
      {isBusiness && (
        <>
          <input {...register('gstin', { setValueAs: v => v.toUpperCase() })} placeholder="27ABCDE1234F1Z5" />
          {errors.gstin && <p role="alert">{errors.gstin.message}</p>}
        </>
      )}
      <button>Continue</button>
    </form>
  );
}`,
    },
    {
      task: 'Write a reusable FormField component that takes label, name, register, errors and renders an accessible input with error message, then use it for 3 fields.',
      hint: 'Use useId for unique ids; errors[name]?.message.',
      solution: `import { useId } from 'react';

export function FormField({ label, name, register, errors, type = 'text', ...rest }) {
  const id = useId();
  const error = errors[name];
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? id + '-error' : undefined}
        {...rest}
      />
      {error && <p id={id + '-error'} role="alert" className="error">{error.message}</p>}
    </div>
  );
}

// usage
// const { register, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
<FormField label="Full name" name="name" register={register} errors={errors} />
<FormField label="Email" name="email" type="email" register={register} errors={errors} autoComplete="email" />
<FormField label="Mobile" name="mobile" type="tel" inputMode="numeric" register={register} errors={errors} />`,
    },
    {
      task: 'Build an "Education history" section with useFieldArray where users can add up to 5 entries, remove entries, and move an entry up or down.',
      hint: 'useFieldArray returns move(from, to). Disable Add when fields.length === 5.',
      solution: `import { useForm, useFieldArray } from 'react-hook-form';

const emptyEdu = { degree: '', college: '', year: '' };

export default function EducationForm() {
  const { control, register, handleSubmit } = useForm({ defaultValues: { education: [emptyEdu] } });
  const { fields, append, remove, move } = useFieldArray({ control, name: 'education' });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, i) => (
        <fieldset key={field.id}>
          <legend>Education {i + 1}</legend>
          <input {...register(\`education.\${i}.degree\`)} placeholder="Degree (B.Tech, BCA...)" />
          <input {...register(\`education.\${i}.college\`)} placeholder="College" />
          <input {...register(\`education.\${i}.year\`)} placeholder="Year" inputMode="numeric" />
          <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0}>Up</button>
          <button type="button" onClick={() => move(i, i + 1)} disabled={i === fields.length - 1}>Down</button>
          <button type="button" onClick={() => remove(i)} disabled={fields.length === 1}>Remove</button>
        </fieldset>
      ))}
      <button type="button" onClick={() => append(emptyEdu)} disabled={fields.length >= 5}>
        + Add education ({fields.length}/5)
      </button>
      <button>Save</button>
    </form>
  );
}`,
    },
    {
      task: 'Make a custom hook useFormDraft(key, watch, reset, { exclude }) that restores and autosaves any RHF form, and returns { savedAt, clearDraft }.',
      hint: 'Restore once in a mount effect with reset(draft, { keepDefaultValues: true }); subscribe with watch(cb).',
      solution: `import { useCallback, useEffect, useState } from 'react';

export function useFormDraft(key, { watch, reset }, { exclude = [], delay = 500 } = {}) {
  const [savedAt, setSavedAt] = useState(null);

  // restore once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) reset(JSON.parse(raw), { keepDefaultValues: true });
    } catch { /* ignore bad JSON / blocked storage */ }
  }, [key, reset]);

  // autosave
  useEffect(() => {
    let t;
    const sub = watch(values => {
      clearTimeout(t);
      t = setTimeout(() => {
        const safe = { ...values };
        exclude.forEach(k => delete safe[k]);
        try { localStorage.setItem(key, JSON.stringify(safe)); setSavedAt(new Date()); } catch {}
      }, delay);
    });
    return () => { sub.unsubscribe(); clearTimeout(t); };
  }, [key, watch, delay, exclude.join(',')]);

  const clearDraft = useCallback(() => { try { localStorage.removeItem(key); } catch {} setSavedAt(null); }, [key]);
  return { savedAt, clearDraft };
}

// usage
// const form = useForm({ defaultValues });
// const { savedAt, clearDraft } = useFormDraft('draft:checkout:v1', form, { exclude: ['cardNumber', 'cvv'] });`,
    },
    {
      task: 'Plain React (playground-ready): a 2-step "Book a table" wizard (Step 1: name + phone, Step 2: date + guests 1-10) that blocks Next until step 1 is valid and shows a summary at the end.',
      hint: 'One values object, an errors object, and a validateStep(step) function.',
      solution: `const { useState } = React;

const steps = [
  { fields: ['name', 'phone'] },
  { fields: ['date', 'guests'] },
];
const rules = {
  name: v => (v.trim().length >= 2 ? '' : 'Enter your name'),
  phone: v => (/^[6-9]\\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile'),
  date: v => (v ? '' : 'Pick a date'),
  guests: v => (Number(v) >= 1 && Number(v) <= 10 ? '' : 'Guests must be 1 to 10'),
};

function App() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ name: '', phone: '', date: '', guests: '2' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const validateStep = s => {
    const errs = {};
    steps[s].fields.forEach(f => { const m = rules[f](values[f]); if (m) errs[f] = m; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const set = k => e => setValues({ ...values, [k]: e.target.value });

  if (done) return <p>Table booked for {values.guests} on {values.date}. See you, {values.name}!</p>;
  return (
    <form onSubmit={e => { e.preventDefault(); if (validateStep(1)) setDone(true); }}>
      <h3>Step {step + 1} of 2</h3>
      {step === 0 ? (
        <>
          <input placeholder="Name" value={values.name} onChange={set('name')} /> <small>{errors.name}</small><br />
          <input placeholder="Mobile" value={values.phone} onChange={set('phone')} /> <small>{errors.phone}</small><br />
          <button type="button" onClick={() => validateStep(0) && setStep(1)}>Next</button>
        </>
      ) : (
        <>
          <input type="date" value={values.date} onChange={set('date')} /> <small>{errors.date}</small><br />
          <input type="number" value={values.guests} onChange={set('guests')} /> <small>{errors.guests}</small><br />
          <button type="button" onClick={() => { setErrors({}); setStep(0); }}>Back</button>
          <button>Book</button>
        </>
      )}
    </form>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'Which React Hook Form function validates only specific fields, ideal for a wizard\'s Next button?',
      options: ['handleSubmit', 'trigger', 'reset', 'register'],
      answer: 1,
      explanation: 'trigger(["name", "email"]) validates those fields and resolves to true/false.',
    },
    {
      question: 'In Zod, how do you attach a "passwords do not match" error to the confirm field?',
      options: ['z.match("password")', 'confirm: z.string().equals("password")', '.refine(fn, { message, path: ["confirm"] })', 'It is impossible in Zod'],
      answer: 2,
      explanation: 'refine on the object with path targets the specific field.',
    },
    {
      question: 'What should you use as the React key for rows from useFieldArray?',
      options: ['field.id', 'The index', 'Math.random()', 'JSON.stringify(field)'],
      answer: 0,
      explanation: 'field.id is stable per row; indexes shift on remove/reorder.',
    },
    {
      question: 'Which value should NEVER be saved in a localStorage form draft?',
      options: ['Delivery city', 'Cover letter text', 'Selected plan', 'OTP or card CVV'],
      answer: 3,
      explanation: 'Sensitive values must not be persisted in browser storage.',
    },
    {
      question: 'Why use z.coerce.number() for an "age" input?',
      options: ['To round decimals', 'Because HTML inputs return strings, coerce converts them to numbers before validation', 'To make the field optional', 'To display numbers in Indian format'],
      answer: 1,
      explanation: 'Input values are strings; coerce converts "25" to 25 so number rules work.',
    },
  ],
};
