export default {
  id: 'day-24-react-hook-form-validation',
  title: 'Forms at Scale: React Hook Form, Validation Rules, Errors and Schema Validation (Zod)',
  module: 'Module 4: Routing & State Management',
  day: 24,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Big forms with many fields and rules quickly become messy with one useState per field. React Hook Form (RHF) handles registration, validation, errors and submission with very little code and very few re-renders. You will also see schema validation with Zod.',
  objectives: [
    'Explain the problems of hand-written controlled forms at scale',
    'Use useForm, register, handleSubmit and formState.errors',
    'Apply built-in rules: required, minLength, maxLength, min, max, pattern, validate',
    'Use watch, reset, isSubmitting and default values',
    'Validate with a schema (Zod + zodResolver) and integrate controlled UI components with Controller',
  ],
  theory: [
    {
      heading: 'Why a form library?',
      content:
        'On Day 9 you built controlled forms: every input has `value` + `onChange` + state. That is perfect for small forms. For a 20-field registration form you also need:\n- Validation rules per field and error messages\n- "Touched" and "dirty" tracking (only show errors after the user leaves a field)\n- Disabling the button while submitting\n- Resetting the form\n\nWriting this by hand is repetitive, and controlled inputs **re-render the whole form on every keystroke**.\n\n**React Hook Form** solves this. It mostly uses **uncontrolled inputs** with refs, so typing does not re-render the form. It reads values only when needed (validation or submit).\n\nAnalogy: instead of a teacher checking every student\'s answer after every word they write (controlled), the teacher collects all answer sheets at the end and checks them (uncontrolled + validate on submit).',
    },
    {
      heading: 'Core API: useForm, register, handleSubmit, errors',
      content:
        'Install: `npm install react-hook-form`\n\n- `const { register, handleSubmit, formState: { errors } } = useForm()`\n- `register(\'email\', rules)` returns `{ name, onChange, onBlur, ref }`; spread it on the input: `<input {...register(\'email\', { required: true })} />`\n- `handleSubmit(onValid)` returns an onSubmit handler that **prevents default, validates**, and calls `onValid(data)` only when all fields are valid\n- `errors.email?.message` contains the error message for that field',
      syntax:
        "import { useForm } from 'react-hook-form';\n\nfunction Signup() {\n  const { register, handleSubmit, formState: { errors } } = useForm();\n  const onSubmit = data => console.log(data);   // { email: '...', password: '...' }\n  return (\n    <form onSubmit={handleSubmit(onSubmit)} noValidate>\n      <input {...register('email', { required: 'Email is required' })} />\n      {errors.email && <p>{errors.email.message}</p>}\n      <button>Sign up</button>\n    </form>\n  );\n}",
    },
    {
      heading: 'Validation rules',
      content:
        'Rules mirror HTML validation attributes, and each can carry a custom message with `{ value, message }`:\n\n- `required: \'Name is required\'`\n- `minLength: { value: 8, message: \'At least 8 characters\' }`\n- `maxLength: { value: 20, message: \'Max 20 characters\' }`\n- `min` / `max` for numbers: `min: { value: 18, message: \'Must be 18+\' }`\n- `pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: \'Invalid email\' }`\n- `validate: value => value === getValues(\'password\') || \'Passwords do not match\'` for custom logic (return true or an error string)\n- `valueAsNumber: true` converts the input string to a number\n\nThe `mode` option controls **when** validation runs: `onSubmit` (default), `onBlur`, `onChange`, `onTouched` or `all`.',
      tip: 'Add noValidate to the <form> so the browser\'s own popups do not compete with your React error messages.',
    },
    {
      heading: 'Useful extras: defaultValues, watch, reset, isSubmitting',
      content:
        '- `useForm({ defaultValues: { country: \'India\' } })` sets starting values (needed for reset and edit forms)\n- `watch(\'plan\')` subscribes to a field so you can show live UI (e.g. show GST field only for business plan)\n- `reset()` clears the form back to defaults; `reset(data)` fills it (edit forms)\n- `formState.isSubmitting` is true while an async onSubmit runs: disable the button\n- `formState.isValid`, `isDirty`, `touchedFields` for advanced UI\n- `setError(\'email\', { message: \'Email already taken\' })` shows server-side errors',
    },
    {
      heading: 'Schema validation with Zod',
      content:
        'For big forms, keep all rules in one **schema** object instead of scattering them in register calls. **Zod** is a popular TypeScript-first schema library.\n\n`npm install zod @hookform/resolvers`\n\nThe schema becomes the single source of truth for validation, and with TypeScript (Day 28) it also gives you the form\'s type for free. The same schema can validate data on a Node backend.',
      syntax:
        "import { z } from 'zod';\nimport { zodResolver } from '@hookform/resolvers/zod';\n\nconst schema = z.object({\n  name: z.string().min(2, 'Name is too short'),\n  email: z.string().email('Invalid email'),\n  age: z.coerce.number().min(18, 'Must be 18+'),\n  password: z.string().min(8, 'Min 8 characters'),\n  confirm: z.string(),\n}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });\n\nconst { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });",
    },
    {
      heading: 'Controller for custom components, and the playground note',
      content:
        '`register` works with native inputs. For third-party controlled components (date pickers, MUI Select, rich editors) that do not expose a ref, use `<Controller name="date" control={control} render={({ field }) => <DatePicker {...field} />} />`.\n\nThe single-file playground cannot install react-hook-form, so the playground examples use a **small hand-written useForm** that copies RHF\'s API (register, handleSubmit, errors, watch, reset, isSubmitting). This shows exactly what the library does for you. The `code` blocks show the real library code.\n\nComing next: Day 25 starts Advanced React with code splitting, React.lazy and Suspense.',
    },
  ],
  examples: [
    {
      title: 'Registration form with React Hook Form rules',
      scenario: 'A signup form with name, email, age, password and confirm password, each with validation and messages.',
      steps: [
        'npm install react-hook-form',
        'Call useForm({ mode: "onTouched" })',
        'Spread register("field", rules) on each input',
        'Show errors.field?.message below each input',
        'Wrap your submit function with handleSubmit',
        'Run the playground: a mini useForm reproduces the same API',
      ],
      code: `import { useForm } from 'react-hook-form';

export default function Signup() {
  const { register, handleSubmit, getValues, reset, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });

  async function onSubmit(data) {
    await new Promise(r => setTimeout(r, 1000)); // fake API call
    alert('Welcome ' + data.name);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input placeholder="Name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} />
      <p>{errors.name?.message}</p>

      <input placeholder="Email" {...register('email', { required: 'Email is required', pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: 'Invalid email' } })} />
      <p>{errors.email?.message}</p>

      <input type="number" placeholder="Age" {...register('age', { valueAsNumber: true, min: { value: 18, message: 'Must be 18+' } })} />
      <p>{errors.age?.message}</p>

      <input type="password" placeholder="Password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
      <p>{errors.password?.message}</p>

      <input type="password" placeholder="Confirm" {...register('confirm', { validate: v => v === getValues('password') || 'Passwords do not match' })} />
      <p>{errors.confirm?.message}</p>

      <button disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</button>
    </form>
  );
}`,
      playground: {
        jsx: `// ---- a tiny useForm that mimics React Hook Form's API (learning version) ----
function useForm({ defaultValues = {}, mode = 'onSubmit' } = {}) {
  const values = React.useRef({ ...defaultValues });
  const rules = React.useRef({});
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [, force] = React.useState(0);

  function validateField(name) {
    const r = rules.current[name] || {};
    const v = values.current[name] ?? '';
    const msg = (rule, fallback) => (typeof rule === 'object' && rule.message) || (typeof rule === 'string' ? rule : fallback);
    const val = rule => (typeof rule === 'object' ? rule.value : rule);
    if (r.required && (v === '' || v === undefined || Number.isNaN(v))) return msg(r.required, 'Required');
    if (v === '' || v === undefined) return null;
    if (r.minLength && String(v).length < val(r.minLength)) return msg(r.minLength, 'Too short');
    if (r.maxLength && String(v).length > val(r.maxLength)) return msg(r.maxLength, 'Too long');
    if (r.min && Number(v) < val(r.min)) return msg(r.min, 'Too small');
    if (r.max && Number(v) > val(r.max)) return msg(r.max, 'Too big');
    if (r.pattern && !val(r.pattern).test(String(v))) return msg(r.pattern, 'Invalid format');
    if (r.validate) { const res = r.validate(v, values.current); if (res !== true) return res || 'Invalid'; }
    return null;
  }
  function runValidation(name) {
    const m = validateField(name);
    setErrors(prev => { const n = { ...prev }; if (m) n[name] = { message: m }; else delete n[name]; return n; });
    return m;
  }
  function register(name, r = {}) {
    rules.current[name] = r;
    return {
      name,
      defaultValue: defaultValues[name],
      onChange: e => {
        const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        values.current[name] = r.valueAsNumber ? (raw === '' ? NaN : Number(raw)) : raw;
        if (mode === 'onChange' || errors[name]) runValidation(name);
        force(x => x + 1);
      },
      onBlur: () => { if (mode === 'onBlur' || mode === 'onTouched') runValidation(name); },
    };
  }
  const handleSubmit = onValid => async e => {
    e.preventDefault();
    const all = {};
    Object.keys(rules.current).forEach(n => { const m = validateField(n); if (m) all[n] = { message: m }; });
    setErrors(all);
    if (Object.keys(all).length) return;
    setSubmitting(true);
    try { await onValid({ ...values.current }); } finally { setSubmitting(false); }
  };
  const reset = (formEl) => { values.current = { ...defaultValues }; setErrors({}); if (formEl) formEl.reset(); };
  const watch = name => values.current[name];
  const getValues = name => (name ? values.current[name] : { ...values.current });
  return { register, handleSubmit, reset, watch, getValues, formState: { errors, isSubmitting } };
}
// ---- end mini useForm ----

function App() {
  const formRef = React.useRef(null);
  const { register, handleSubmit, getValues, reset, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });
  const [result, setResult] = React.useState(null);

  async function onSubmit(data) {
    await new Promise(r => setTimeout(r, 1000));
    setResult(data);
    reset(formRef.current);
  }

  const field = { display: 'block', width: 240, padding: 6, marginTop: 8 };
  const err = { color: 'crimson', margin: '2px 0', fontSize: 13, minHeight: 16 };
  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate style={{ fontFamily: 'sans-serif' }}>
      <input style={field} placeholder="Name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })} />
      <p style={err}>{errors.name?.message}</p>
      <input style={field} placeholder="Email" {...register('email', { required: 'Email is required', pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: 'Invalid email' } })} />
      <p style={err}>{errors.email?.message}</p>
      <input style={field} type="number" placeholder="Age" {...register('age', { valueAsNumber: true, required: 'Age is required', min: { value: 18, message: 'Must be 18+' } })} />
      <p style={err}>{errors.age?.message}</p>
      <input style={field} type="password" placeholder="Password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
      <p style={err}>{errors.password?.message}</p>
      <input style={field} type="password" placeholder="Confirm password" {...register('confirm', { required: 'Please confirm', validate: v => v === getValues('password') || 'Passwords do not match' })} />
      <p style={err}>{errors.confirm?.message}</p>
      <button disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create account'}</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}`,
      },
      result: 'Leaving a field empty and moving away shows its error in red. Invalid email, age under 18, short password and mismatched passwords show their messages. With valid data the button shows "Creating..." for one second, then the submitted JSON appears and the form clears.',
      explanation:
        'register connects each input to the form with rules. Because inputs are uncontrolled, values are kept in a ref. handleSubmit validates every registered field and only calls onSubmit when there are no errors. isSubmitting disables the button during the async call.',
    },
    {
      title: 'watch: show fields conditionally',
      scenario: 'A checkout form where a GST number field appears only when the "Business purchase" checkbox is ticked.',
      steps: [
        'Register a checkbox named isBusiness',
        'Call watch("isBusiness") to read its live value',
        'Render the GST input only when it is true, with a pattern rule',
        'Run and tick the checkbox',
      ],
      code: `const { register, watch, handleSubmit, formState: { errors } } = useForm({ defaultValues: { isBusiness: false } });
const isBusiness = watch('isBusiness');

<label><input type="checkbox" {...register('isBusiness')} /> Business purchase</label>
{isBusiness && (
  <input placeholder="GSTIN" {...register('gst', {
    required: 'GSTIN is required for business',
    pattern: { value: /^[0-9A-Z]{15}$/, message: 'GSTIN must be 15 letters/digits' },
  })} />
)}`,
      playground: {
        jsx: `// Simplified controlled version to show the idea of watch()
function App() {
  const [values, setValues] = React.useState({ name: '', isBusiness: false, gst: '' });
  const [errors, setErrors] = React.useState({});
  const [done, setDone] = React.useState(null);
  const watch = name => values[name];

  const register = name => ({
    name,
    value: typeof values[name] === 'boolean' ? undefined : values[name],
    checked: typeof values[name] === 'boolean' ? values[name] : undefined,
    onChange: e => setValues(v => ({ ...v, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
  });

  function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!values.name.trim()) errs.name = 'Name is required';
    if (values.isBusiness) {
      if (!values.gst) errs.gst = 'GSTIN is required for business';
      else if (!/^[0-9A-Z]{15}$/.test(values.gst)) errs.gst = 'GSTIN must be 15 letters/digits';
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) setDone(values);
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ fontFamily: 'sans-serif' }}>
      <input placeholder="Full name" {...register('name')} />
      <p style={{ color: 'crimson' }}>{errors.name}</p>
      <label><input type="checkbox" {...register('isBusiness')} /> Business purchase</label>
      {watch('isBusiness') && (
        <div>
          <input placeholder="GSTIN (15 chars)" {...register('gst')} />
          <p style={{ color: 'crimson' }}>{errors.gst}</p>
        </div>
      )}
      <p><button>Place order</button></p>
      {done && <p>Order placed for {done.name}{done.isBusiness ? ' (GST ' + done.gst + ')' : ''}</p>}
    </form>
  );
}`,
      },
      result: 'The GSTIN field is hidden at first. Ticking "Business purchase" shows it; submitting with a wrong GSTIN shows an error; a 15-character value succeeds.',
      explanation:
        'watch subscribes to a field\'s live value so the UI can react. In RHF, a field that is unmounted (the hidden GST input) is unregistered by default when shouldUnregister is true, or keeps its last value otherwise.',
    },
    {
      title: 'Schema validation with Zod (and a plain-JS schema in the playground)',
      scenario: 'Move all rules into one schema object and validate the whole form at once.',
      steps: [
        'npm install zod @hookform/resolvers',
        'Write the schema with z.object and refine for the password match',
        'Pass resolver: zodResolver(schema) to useForm',
        'Register inputs without rules: the schema handles validation',
        'Run the playground: it uses a tiny schema function with the same idea',
      ],
      code: `import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(data => console.log(data))} noValidate>
      <input {...register('email')} placeholder="Email" />
      <p>{errors.email?.message}</p>
      <input type="password" {...register('password')} placeholder="Password" />
      <p>{errors.password?.message}</p>
      <input type="password" {...register('confirm')} placeholder="Confirm" />
      <p>{errors.confirm?.message}</p>
      <button>Submit</button>
    </form>
  );
}`,
      playground: {
        jsx: `// A tiny "schema": one function that validates the whole object and returns errors
const schema = data => {
  const errors = {};
  if (!/^\\S+@\\S+\\.\\S+$/.test(data.email)) errors.email = 'Enter a valid email';
  if (data.password.length < 8) errors.password = 'Min 8 characters';
  if (data.password !== data.confirm) errors.confirm = 'Passwords do not match';
  return errors;
};

function App() {
  const [data, setData] = React.useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = React.useState({});
  const [ok, setOk] = React.useState(false);
  const onChange = e => setData(d => ({ ...d, [e.target.name]: e.target.value }));

  function onSubmit(e) {
    e.preventDefault();
    const errs = schema(data);
    setErrors(errs);
    setOk(Object.keys(errs).length === 0);
  }

  const row = name => <p style={{ color: 'crimson', margin: '2px 0 8px' }}>{errors[name]}</p>;
  return (
    <form onSubmit={onSubmit} noValidate style={{ fontFamily: 'sans-serif', display: 'grid', maxWidth: 260 }}>
      <input name="email" placeholder="Email" value={data.email} onChange={onChange} />{row('email')}
      <input name="password" type="password" placeholder="Password" value={data.password} onChange={onChange} />{row('password')}
      <input name="confirm" type="password" placeholder="Confirm" value={data.confirm} onChange={onChange} />{row('confirm')}
      <button>Submit</button>
      {ok && <p style={{ color: 'green' }}>All valid! Ready to send.</p>}
    </form>
  );
}`,
      },
      result: 'Submitting with bad data shows all three errors at once. Fixing them and submitting shows "All valid! Ready to send."',
      explanation:
        'With a schema, validation rules live in one place and can be reused on the server. zodResolver translates Zod errors into RHF\'s errors object, so the JSX does not change.',
    },
  ],
  interview: [
    { q: 'What is React Hook Form?', a: 'A performant form library for React built around hooks. It registers inputs (mostly uncontrolled via refs), handles validation, errors and submission, and minimises re-renders.', level: 'Easy' },
    { q: 'Why is React Hook Form faster than typical controlled forms?', a: 'It does not store every keystroke in React state; inputs are uncontrolled and values are read from refs. Only components subscribed to changed form state re-render.', level: 'Medium' },
    { q: 'What does register return?', a: 'An object { name, onChange, onBlur, ref } that you spread onto an input to connect it with the form and its validation rules.', level: 'Medium' },
    { q: 'What does handleSubmit do?', a: 'It returns a submit handler that prevents the default browser submission, validates all fields, and calls your onValid(data) only if the form is valid (optionally onInvalid(errors) otherwise).', level: 'Easy' },
    { q: 'Name the built-in validation rules in register.', a: 'required, min, max, minLength, maxLength, pattern, validate (custom function or object of functions), plus helpers valueAsNumber, valueAsDate, setValueAs.', level: 'Easy' },
    { q: 'How do you validate that two passwords match?', a: 'Use validate on the confirm field: validate: v => v === getValues("password") || "Passwords do not match", or a schema refine with Zod/Yup.', level: 'Medium' },
    { q: 'What does the mode option control?', a: 'When validation runs: onSubmit (default), onBlur, onChange, onTouched (first blur then every change), or all.', level: 'Medium' },
    { q: 'What is watch used for?', a: 'To subscribe to the live value of one or more fields, for conditional UI or derived displays. It triggers re-renders when those fields change.', level: 'Medium' },
    { q: 'When do you need Controller?', a: 'For controlled third-party components (UI library selects, date pickers) that do not expose a native input ref. Controller provides field.value/onChange/onBlur to the component.', level: 'Hard' },
    { q: 'Why use a schema library like Zod with forms?', a: 'It centralises validation in one declarative schema, can be shared with the backend, gives TypeScript types via z.infer, and plugs in with resolvers.', level: 'Medium' },
    { q: 'How do you show a server-side error such as "email already registered"?', a: 'After the API responds, call setError("email", { type: "server", message: "Email already registered" }).', level: 'Hard' },
    { q: 'Is client-side validation enough?', a: 'No. It improves UX, but anyone can bypass it. The server must always validate input again.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a "Contact us" form with React Hook Form: name (required), email (required + pattern), subject (select, required) and message (min 20 chars). Show errors and disable the button while submitting.',
      hint: 'Use formState: { errors, isSubmitting } and an async onSubmit.',
      solution: `import { useForm } from 'react-hook-form';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async data => {
    await new Promise(r => setTimeout(r, 800));
    console.log(data);
    reset();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input placeholder="Name" {...register('name', { required: 'Name is required' })} />
      <p>{errors.name?.message}</p>
      <input placeholder="Email" {...register('email', { required: 'Email is required', pattern: { value: /^\\S+@\\S+\\.\\S+$/, message: 'Invalid email' } })} />
      <p>{errors.email?.message}</p>
      <select {...register('subject', { required: 'Choose a subject' })} defaultValue="">
        <option value="" disabled>Subject</option>
        <option>Support</option>
        <option>Sales</option>
      </select>
      <p>{errors.subject?.message}</p>
      <textarea {...register('message', { minLength: { value: 20, message: 'At least 20 characters' } })} />
      <p>{errors.message?.message}</p>
      <button disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send'}</button>
    </form>
  );
}`,
    },
    {
      task: 'Create an "Edit profile" form that loads existing data with defaultValues and a "Reset changes" button that restores them.',
      hint: 'useForm({ defaultValues }) and reset() with no arguments.',
      solution: `import { useForm } from 'react-hook-form';

const profile = { name: 'Meera', city: 'Pune', bio: 'Frontend developer' };

export default function EditProfile() {
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({ defaultValues: profile });
  return (
    <form onSubmit={handleSubmit(d => alert(JSON.stringify(d)))}>
      <input {...register('name')} />
      <input {...register('city')} />
      <textarea {...register('bio')} />
      <button type="button" onClick={() => reset()} disabled={!isDirty}>Reset changes</button>
      <button disabled={!isDirty}>Save</button>
    </form>
  );
}`,
    },
    {
      task: 'Write a Zod schema for a job application: fullName (min 3), email, experience (number 0-40), skills (at least 1 item from a list of checkboxes), and hook it up with zodResolver.',
      hint: 'z.array(z.string()).min(1, "...") for skills; z.coerce.number() for experience.',
      solution: `import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  fullName: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  experience: z.coerce.number().min(0).max(40, 'Max 40 years'),
  skills: z.array(z.string()).min(1, 'Pick at least one skill'),
});

export default function Apply() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { skills: [] },
  });
  return (
    <form onSubmit={handleSubmit(d => console.log(d))} noValidate>
      <input placeholder="Full name" {...register('fullName')} /><p>{errors.fullName?.message}</p>
      <input placeholder="Email" {...register('email')} /><p>{errors.email?.message}</p>
      <input type="number" placeholder="Years" {...register('experience')} /><p>{errors.experience?.message}</p>
      {['React', 'Node', 'CSS'].map(s => (
        <label key={s}><input type="checkbox" value={s} {...register('skills')} /> {s}</label>
      ))}
      <p>{errors.skills?.message}</p>
      <button>Apply</button>
    </form>
  );
}`,
    },
    {
      task: 'Without any library, write a small useSimpleForm(initialValues, validate) hook returning { values, errors, handleChange, handleSubmit } and use it for a login form.',
      hint: 'validate(values) returns an errors object; handleSubmit(onValid) returns an event handler.',
      solution: `function useSimpleForm(initialValues, validate) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const handleChange = e => setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  const handleSubmit = onValid => e => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onValid(values);
  };
  return { values, errors, handleChange, handleSubmit };
}

function App() {
  const { values, errors, handleChange, handleSubmit } = useSimpleForm(
    { email: '', password: '' },
    v => {
      const e = {};
      if (!v.email.includes('@')) e.email = 'Invalid email';
      if (v.password.length < 6) e.password = 'Min 6 characters';
      return e;
    }
  );
  return (
    <form onSubmit={handleSubmit(v => alert('Logged in as ' + v.email))} noValidate>
      <input name="email" value={values.email} onChange={handleChange} placeholder="Email" />
      <p>{errors.email}</p>
      <input name="password" type="password" value={values.password} onChange={handleChange} placeholder="Password" />
      <p>{errors.password}</p>
      <button>Login</button>
    </form>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'How do you connect an input to React Hook Form?',
      options: ['<input value={form.email} />', '<input {...register("email")} />', '<input hook="email" />', '<Field name="email" />'],
      answer: 1,
      explanation: 'register returns name, onChange, onBlur and ref to spread on the input.',
    },
    {
      question: 'Where do you read the error message for the "email" field?',
      options: ['errors.email?.message', 'register.email.error', 'handleSubmit.errors.email', 'watch("email").error'],
      answer: 0,
      explanation: 'formState.errors holds an object per invalid field with a message.',
    },
    {
      question: 'Which rule checks a value against a regular expression?',
      options: ['validate', 'match', 'regex', 'pattern'],
      answer: 3,
      explanation: 'pattern: { value: /regex/, message: "..." }.',
    },
    {
      question: 'Why does React Hook Form usually re-render less than controlled forms?',
      options: ['It uses class components', 'It disables validation', 'It keeps input values in refs (uncontrolled) instead of state on each keystroke', 'It uses Redux internally'],
      answer: 2,
      explanation: 'Uncontrolled inputs avoid state updates on every key press.',
    },
    {
      question: 'Which option plugs a Zod schema into useForm?',
      options: ['schema: zod', 'resolver: zodResolver(schema)', 'validate: schema', 'rules: schema'],
      answer: 1,
      explanation: 'Resolvers from @hookform/resolvers adapt schema libraries to RHF.',
    },
  ],
};
