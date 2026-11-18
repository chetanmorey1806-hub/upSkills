export default {
  id: 'day-14-react-bootstrap-best-practices-accessibility',
  title: 'Bootstrap with React (react-bootstrap), Best Practices and Accessibility',
  module: 'Module 3: Professional Bootstrap',
  day: 14,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Use Bootstrap inside React apps the right way with react-bootstrap components (Container, Row, Col, Navbar, Modal, Form, Toast), understand why you should not mix Bootstrap\'s DOM-manipulating JS with React, and apply professional best practices for performance, maintainability and accessibility.',
  objectives: [
    'Install and set up react-bootstrap with Vite and import Bootstrap CSS once',
    'Build layouts and components with react-bootstrap: grid, Navbar, Card, Button, Modal, Form, Toast, Tabs',
    'Control interactive components with React state (show/onHide) instead of data-bs-* attributes',
    'Apply best practices: semantic HTML, minimal custom CSS, purge/tree-shaking, consistent spacing',
    'Make Bootstrap UIs accessible: labels, ARIA, focus, contrast, keyboard and reduced motion',
  ],
  theory: [
    {
      heading: 'Options for Bootstrap in React',
      content: '1. **Plain Bootstrap CSS + className** – import `bootstrap/dist/css/bootstrap.min.css` and write `className="btn btn-primary"`. Perfect for layout, utilities and CSS-only components.\n2. **react-bootstrap** – Bootstrap components rebuilt as real React components (`<Button>`, `<Modal show>`). Uses Bootstrap\'s CSS but **not** Bootstrap\'s JS; behaviour is React state.\n3. **reactstrap** – a similar alternative library.\n\nWhy not use `bootstrap.bundle.js` with `data-bs-toggle` in React? Bootstrap\'s JS manipulates the DOM directly (adds classes, moves elements). React also owns the DOM through its virtual DOM. Two owners = state getting out of sync, components that don\'t re-render, memory leaks. react-bootstrap keeps React in control.\n\nAnalogy: having both React and Bootstrap JS change the same DOM is like two drivers sharing one steering wheel.',
      tip: 'You can still import a single Bootstrap JS plugin in React (e.g. Tooltip in a useEffect with cleanup), but react-bootstrap is the cleaner option.',
    },
    {
      heading: 'Setup with Vite',
      content: '```\nnpm create vite@latest shop -- --template react\ncd shop\nnpm i react-bootstrap bootstrap\n```\n\nIn `main.jsx` import the CSS **once**:\n\n```\nimport "bootstrap/dist/css/bootstrap.min.css";\n```\n\nThen import components individually (tree-shakable):\n\n```\nimport Button from "react-bootstrap/Button";\nimport { Container, Row, Col } from "react-bootstrap";\n```\n\nreact-bootstrap 2.x targets Bootstrap 5. Icons: `npm i bootstrap-icons` and import the CSS, or use `react-bootstrap-icons`.',
    },
    {
      heading: 'Key react-bootstrap Components and Props',
      content: '- **Layout**: `<Container fluid>`, `<Row xs={1} md={3} className="g-4">`, `<Col md={6} lg={{ span: 4, offset: 2 }}>`\n- **Button**: `<Button variant="outline-primary" size="lg" disabled onClick={...}>`; `as="a"` / `href` for links\n- **Navbar**: `<Navbar expand="lg" bg="dark" data-bs-theme="dark">` with `<Navbar.Brand>`, `<Navbar.Toggle aria-controls>`, `<Navbar.Collapse>`, `<Nav className="ms-auto">`, `<Nav.Link>`, `<NavDropdown>`\n- **Card**: `<Card>`, `<Card.Img variant="top">`, `<Card.Body>`, `<Card.Title>`, `<Card.Text>`\n- **Modal**: `<Modal show={show} onHide={close} centered>` + `<Modal.Header closeButton>`, `<Modal.Title>`, `<Modal.Body>`, `<Modal.Footer>`\n- **Form**: `<Form noValidate validated={validated} onSubmit>`, `<Form.Group controlId>`, `<Form.Label>`, `<Form.Control isInvalid>`, `<Form.Control.Feedback type="invalid">`, `<Form.Select>`, `<Form.Check type="switch">`, `<FloatingLabel>`, `<InputGroup>`\n- **Feedback**: `<Alert variant dismissible onClose>`, `<Toast show onClose delay autohide>`, `<ToastContainer position="bottom-end">`, `<Spinner animation="border">`, `<ProgressBar now={60} label="60%">`\n- **Others**: `<Tabs>/<Tab eventKey title>`, `<Accordion>`, `<Carousel>`, `<Offcanvas show onHide>`, `<OverlayTrigger overlay={<Tooltip>}>`, `<Table striped hover responsive>`\n\nThe `variant` prop maps to Bootstrap classes (`variant="danger"` → `btn-danger`), and `className` is still available for utilities.',
    },
    {
      heading: 'Best Practices for Professional Bootstrap',
      content: '1. **Customise via Sass/CSS variables**, not by overriding with heavy selectors or !important\n2. **Use utilities first**, extract a component class when the same long utility combination repeats\n3. **Keep semantic HTML**: `<nav>`, `<main>`, `<button>` for actions, `<a>` for navigation, real heading order\n4. **Mobile-first**: design xs layout first, add breakpoint classes upward\n5. **Don\'t fight the grid**: container > row > col, no extra margins on columns\n6. **Performance**: import only needed Sass partials and JS plugins; PurgeCSS for unused classes; serve minified files; lazy-load images (`loading="lazy"`)\n7. **Consistency**: use the spacing scale (1–5) and theme colours rather than random pixel values\n8. **Versioning**: pin the Bootstrap version (`5.3.3`), read the migration guide before upgrading\n9. **Avoid** jQuery-era patterns and mixing Bootstrap JS with React/Vue DOM ownership\n10. **Test** on real devices and with DevTools device mode at each breakpoint',
    },
    {
      heading: 'Accessibility (a11y) with Bootstrap',
      content: 'Bootstrap gives a good start but **you** must keep it accessible:\n\n- **Labels**: every input has a `<label>` (or `.visually-hidden` label / `aria-label`)\n- **Icon-only buttons**: `aria-label`; decorative icons `aria-hidden="true"`\n- **Colour contrast**: at least 4.5:1 for normal text; be careful with `text-bg-warning`/`-info` + custom colours; don\'t use colour alone to convey meaning\n- **Keyboard**: all interactive things reachable with Tab and usable with Enter/Space; don\'t make `<div>`s clickable; keep the visible focus ring (`:focus-visible`)\n- **ARIA states**: keep `aria-expanded`, `aria-current`, `aria-selected`, `aria-invalid` correct (Bootstrap/react-bootstrap do this for their own components)\n- **Modals**: `aria-labelledby` to the title; focus moves in and returns on close\n- **Live regions**: alerts `role="alert"`, toasts `aria-live`\n- **Skip link**: `<a class="visually-hidden-focusable" href="#main">Skip to content</a>`\n- **Reduced motion**: Bootstrap respects `prefers-reduced-motion` for its transitions ($enable-reduced-motion)\n- **Tools**: Lighthouse, axe DevTools, WAVE, screen readers (NVDA, VoiceOver)',
      points: [
        'In React, aria attributes are written in lowercase with hyphens (aria-label), and "for" becomes htmlFor',
        'react-bootstrap\'s controlId on Form.Group links label and input automatically',
        'Coming next (Day 15): final project – landing page + admin dashboard, test and interview prep',
      ],
    },
  ],
  examples: [
    {
      title: 'react-bootstrap Navbar + Grid + Cards (Product Page)',
      scenario: 'Rebuild a product listing page with react-bootstrap components: a collapsing navbar and a responsive card grid rendered from an array.',
      steps: [
        'npm i react-bootstrap bootstrap and import bootstrap.min.css in main.jsx',
        'Import Container, Row, Col, Navbar, Nav, Card, Button, Badge from react-bootstrap',
        'Render products with products.map inside <Row xs={1} sm={2} lg={3} className="g-4">',
        'Track the cart count in useState and show it in a Badge in the navbar',
        'The playground shows the same UI using plain Bootstrap classes with className and React state',
      ],
      code: `// main.jsx
import 'bootstrap/dist/css/bootstrap.min.css';

// App.jsx
import { useState } from 'react';
import { Container, Row, Col, Navbar, Nav, Card, Button, Badge } from 'react-bootstrap';

const products = [
  { id: 1, name: 'Laptop', price: 54999, img: 'https://picsum.photos/id/0/400/250' },
  { id: 2, name: 'Headphones', price: 2999, img: 'https://picsum.photos/id/1/400/250' },
  { id: 3, name: 'Camera', price: 25999, img: 'https://picsum.photos/id/250/400/250' },
];

export default function App() {
  const [cart, setCart] = useState(0);
  return (
    <>
      <Navbar expand="md" bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#">ReactShop</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              <Nav.Link href="#" active>Home</Nav.Link>
              <Nav.Link href="#">Deals</Nav.Link>
            </Nav>
            <Button variant="outline-light">
              Cart <Badge bg="danger">{cart}</Badge>
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="py-4">
        <Row xs={1} sm={2} lg={3} className="g-4">
          {products.map(p => (
            <Col key={p.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={p.img} alt={p.name} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{p.name}</Card.Title>
                  <Card.Text className="fw-bold">Rs {p.price.toLocaleString('en-IN')}</Card.Text>
                  <Button className="mt-auto" onClick={() => setCart(c => c + 1)}>Add to cart</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}`,
      playground: {
        libs: ['bootstrap'],
        jsx: `const { useState } = React;
const products = [
  { id: 1, name: 'Laptop', price: 54999, img: 'https://picsum.photos/id/0/400/250' },
  { id: 2, name: 'Headphones', price: 2999, img: 'https://picsum.photos/id/1/400/250' },
  { id: 3, name: 'Camera', price: 25999, img: 'https://picsum.photos/id/250/400/250' }
];
function App() {
  const [cart, setCart] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
        <div className="container">
          <a className="navbar-brand" href="#">ReactShop</a>
          <button className="navbar-toggler" type="button" aria-controls="main-nav" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(o => !o)}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={'collapse navbar-collapse' + (open ? ' show' : '')} id="main-nav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><a className="nav-link active" aria-current="page" href="#">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#">Deals</a></li>
            </ul>
            <button className="btn btn-outline-light">Cart <span className="badge bg-danger">{cart}</span></button>
          </div>
        </div>
      </nav>
      <div className="container py-4">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {products.map(p => (
            <div className="col" key={p.id}>
              <div className="card h-100 shadow-sm">
                <img src={p.img} className="card-img-top" alt={p.name} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text fw-bold">Rs {p.price.toLocaleString('en-IN')}</p>
                  <button className="btn btn-primary mt-auto" onClick={() => setCart(c => c + 1)}>Add to cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}`,
      },
      result: 'A dark navbar with a Cart button and red count badge, and three product cards. Clicking "Add to cart" increases the badge number. On narrow widths the hamburger toggles the menu (handled by React state).',
      explanation: 'react-bootstrap components output the same Bootstrap classes (Row xs={1} → row-cols-1). State lives in React, so the badge re-renders automatically. The playground mirrors this with className strings and toggles .show via state instead of Bootstrap JS.',
    },
    {
      title: 'Controlled Modal and Toast with React State',
      scenario: 'A "Delete account" button opens a confirmation modal; confirming closes it and shows a toast. No data-bs-* attributes – everything is driven by state.',
      steps: [
        'Import Modal, Button, Toast, ToastContainer from react-bootstrap',
        'Keep showModal and showToast in useState',
        'Pass show and onHide to <Modal>; onClose, delay and autohide to <Toast>',
        'Playground: equivalent markup rendered conditionally with Bootstrap classes (d-block + backdrop)',
      ],
      code: `import { useState } from 'react';
import { Modal, Button, Toast, ToastContainer } from 'react-bootstrap';

export default function DeleteAccount() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const confirm = () => { setShowModal(false); setShowToast(true); };

  return (
    <>
      <Button variant="danger" onClick={() => setShowModal(true)}>Delete account</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered aria-labelledby="del-title">
        <Modal.Header closeButton>
          <Modal.Title id="del-title">Delete account?</Modal.Title>
        </Modal.Header>
        <Modal.Body>This permanently removes your data.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirm}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Body className="text-white">Account deleted.</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}`,
      playground: {
        libs: ['bootstrap'],
        jsx: `const { useState, useEffect, useRef } = React;
function App() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!showModal) return;
    cancelRef.current && cancelRef.current.focus();
    const onKey = e => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  const confirm = () => { setShowModal(false); setShowToast(true); console.log('Account deleted'); };

  return (
    <div className="container py-4">
      <button className="btn btn-danger" onClick={() => setShowModal(true)}>Delete account</button>

      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={() => setShowModal(false)}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="del-title">Delete account?</h1>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">This permanently removes your data.</div>
                <div className="modal-footer">
                  <button ref={cancelRef} className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirm}>Delete</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div className={'toast text-bg-success' + (showToast ? ' show' : '')} role="status" aria-live="polite" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Account deleted.</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setShowToast(false)}></button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      },
      result: 'Clicking "Delete account" shows a centred modal with a dark backdrop; Cancel, X, Esc or clicking outside closes it. Clicking Delete closes it and shows a green toast in the bottom-right that disappears after 3 seconds.',
      explanation: 'In react-bootstrap, <Modal show onHide> handles backdrop, focus trap, Esc and animation for you. The playground reproduces the idea with conditional rendering: React decides whether the modal exists and whether the toast has .show, so no Bootstrap JS touches the DOM.',
    },
    {
      title: 'Accessible, Validated Form (react-bootstrap Form API)',
      scenario: 'A signup form with labels linked via controlId, validation feedback via isInvalid, and accessible error messages.',
      steps: [
        'Use <Form noValidate validated={validated} onSubmit={handleSubmit}>',
        'Use Form.Group controlId so labels and inputs are linked',
        'Show <Form.Control.Feedback type="invalid"> messages',
        'Playground: equivalent markup with htmlFor, aria-invalid, aria-describedby and is-invalid classes driven by state',
      ],
      code: `import { useState } from 'react';
import { Form, Button, FloatingLabel } from 'react-bootstrap';

export default function Signup() {
  const [validated, setValidated] = useState(false);
  const handleSubmit = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    if (form.checkValidity()) alert('Welcome!');
    setValidated(true);
  };
  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control required minLength={3} />
        <Form.Control.Feedback type="invalid">At least 3 characters.</Form.Control.Feedback>
      </Form.Group>
      <FloatingLabel controlId="email" label="Email" className="mb-3">
        <Form.Control type="email" placeholder="x" required />
        <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
      </FloatingLabel>
      <Form.Check type="switch" id="news" label="Subscribe" className="mb-3" />
      <Button type="submit">Sign up</Button>
    </Form>
  );
}`,
      playground: {
        libs: ['bootstrap'],
        jsx: `const { useState } = React;
function App() {
  const [values, setValues] = useState({ name: '', email: '', news: false });
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const errors = {
    name: values.name.trim().length < 3 ? 'Name must be at least 3 characters.' : '',
    email: /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(values.email) ? '' : 'Enter a valid email address.'
  };
  const valid = !errors.name && !errors.email;
  const change = e => {
    const { name, value, type, checked } = e.target;
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };
  const submit = e => {
    e.preventDefault();
    setTouched(true);
    setDone(valid);
    console.log(valid ? 'Submitted: ' + JSON.stringify(values) : 'Errors: ' + JSON.stringify(errors));
  };
  const cls = field => 'form-control' + (touched ? (errors[field] ? ' is-invalid' : ' is-valid') : '');
  return (
    <div className="container py-4" style={{ maxWidth: 420 }}>
      <a className="visually-hidden-focusable" href="#signup">Skip to form</a>
      <form id="signup" noValidate onSubmit={submit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input id="name" name="name" className={cls('name')} value={values.name} onChange={change}
            aria-invalid={touched && !!errors.name} aria-describedby="name-err" />
          <div id="name-err" className="invalid-feedback">{errors.name}</div>
        </div>
        <div className="form-floating mb-3">
          <input id="email" name="email" type="email" placeholder="x" className={cls('email')} value={values.email} onChange={change}
            aria-invalid={touched && !!errors.email} aria-describedby="email-err" />
          <label htmlFor="email">Email</label>
          <div id="email-err" className="invalid-feedback">{errors.email}</div>
        </div>
        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" role="switch" id="news" name="news" checked={values.news} onChange={change} />
          <label className="form-check-label" htmlFor="news">Subscribe to newsletter</label>
        </div>
        <button type="submit" className="btn btn-primary w-100">Sign up</button>
      </form>
      {done && <div className="alert alert-success mt-3" role="alert">Welcome, {values.name}!</div>}
    </div>
  );
}`,
      },
      result: 'Submitting empty shows red fields with specific messages; fixing them turns fields green and shows "Welcome, <name>!". Pressing Tab first reveals a "Skip to form" link.',
      explanation: 'React computes errors from state and applies is-invalid/is-valid classes; Bootstrap CSS shows the sibling .invalid-feedback. aria-invalid and aria-describedby make screen readers announce the error. In react-bootstrap, isInvalid and controlId produce the same markup.',
    },
    {
      title: 'Accessibility Audit: Fixing Common Bootstrap Mistakes',
      scenario: 'Compare an inaccessible snippet with a fixed version: clickable div, icon-only button, missing label, low-contrast badge, and missing aria-current.',
      steps: [
        'Write the "bad" version: div onclick, icon button without label, input with only placeholder',
        'Write the "good" version using button, aria-label, label/visually-hidden, aria-current',
        'Run a quick check in JS that counts inputs without labels and buttons without names',
        'Compare the console output for both versions',
      ],
      code: `<!-- BAD -->
<div class="btn btn-primary" onclick="save()">Save</div>
<button class="btn btn-light"><i class="bi bi-trash"></i></button>
<input class="form-control" placeholder="Email">

<!-- GOOD -->
<button type="button" class="btn btn-primary" onclick="save()">Save</button>
<button type="button" class="btn btn-light" aria-label="Delete item"><i class="bi bi-trash" aria-hidden="true"></i></button>
<label for="em" class="visually-hidden">Email</label>
<input id="em" type="email" class="form-control" placeholder="Email" autocomplete="email">`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3">
  <div class="row g-4">
    <div class="col-md-6" id="bad">
      <h6 class="text-danger">Bad</h6>
      <div class="btn btn-primary mb-2">Save (div)</div>
      <button class="btn btn-light mb-2"><i class="bi bi-trash"></i></button>
      <input class="form-control mb-2" placeholder="Email">
      <span class="badge" style="background:#ffe066;color:#fff">Low contrast</span>
      <ul class="nav nav-pills mt-2"><li class="nav-item"><a class="nav-link active" href="#">Home</a></li><li class="nav-item"><a class="nav-link" href="#">About</a></li></ul>
    </div>
    <div class="col-md-6" id="good">
      <h6 class="text-success">Good</h6>
      <button type="button" class="btn btn-primary mb-2">Save</button>
      <button type="button" class="btn btn-light mb-2" aria-label="Delete item"><i class="bi bi-trash" aria-hidden="true"></i></button>
      <label for="em" class="visually-hidden">Email</label>
      <input id="em" type="email" class="form-control mb-2" placeholder="Email" autocomplete="email">
      <span class="badge text-bg-warning">Good contrast</span>
      <ul class="nav nav-pills mt-2"><li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li><li class="nav-item"><a class="nav-link" href="#">About</a></li></ul>
    </div>
  </div>
  <pre id="report" class="bg-body-tertiary p-2 mt-3 small"></pre>
</div>`,
        js: `function audit(root) {
  const issues = [];
  root.querySelectorAll('div.btn, span.btn').forEach(function () { issues.push('Clickable non-button element'); });
  root.querySelectorAll('button').forEach(function (b) {
    if (!b.textContent.trim() && !b.getAttribute('aria-label')) issues.push('Button without accessible name');
  });
  root.querySelectorAll('input').forEach(function (i) {
    const labelled = (i.id && root.querySelector('label[for="' + i.id + '"]')) || i.getAttribute('aria-label');
    if (!labelled) issues.push('Input without label');
  });
  root.querySelectorAll('.nav-link.active').forEach(function (a) {
    if (!a.getAttribute('aria-current')) issues.push('Active link missing aria-current');
  });
  root.querySelectorAll('i.bi').forEach(function (i) {
    if (i.getAttribute('aria-hidden') !== 'true') issues.push('Decorative icon not aria-hidden');
  });
  return issues;
}
const bad = audit(document.getElementById('bad'));
const good = audit(document.getElementById('good'));
const text = 'BAD: ' + bad.length + ' issues\\n - ' + bad.join('\\n - ') + '\\n\\nGOOD: ' + good.length + ' issues';
document.getElementById('report').textContent = text;
console.log(text);`,
      },
      result: 'Both columns look almost the same, but the report shows "BAD: 5 issues" (clickable div, unnamed button, unlabeled input, missing aria-current, icon not hidden) and "GOOD: 0 issues". The low-contrast badge is visibly hard to read.',
      explanation: 'Visual similarity hides accessibility problems. Real buttons are focusable and keyboard-operable; aria-label names icon buttons; labels name inputs; aria-current tells assistive tech the current page. Tools like axe and Lighthouse automate these checks.',
    },
  ],
  interview: [
    { q: 'Why shouldn\'t you use Bootstrap\'s data-bs-* JavaScript in a React app?', a: 'Bootstrap JS mutates the DOM directly while React manages the DOM via the virtual DOM. Both changing the same nodes leads to out-of-sync state and bugs. Use react-bootstrap (state-driven components) or manage plugins carefully in useEffect with cleanup.', level: 'Medium' },
    { q: 'What is react-bootstrap?', a: 'A library that re-implements Bootstrap components as React components, using Bootstrap\'s CSS but no Bootstrap JS or jQuery. Behaviour is controlled with props/state (e.g. <Modal show onHide>).', level: 'Easy' },
    { q: 'How do you install and set up react-bootstrap?', a: 'npm i react-bootstrap bootstrap; import "bootstrap/dist/css/bootstrap.min.css" once in main.jsx; import components like import Button from "react-bootstrap/Button".', level: 'Easy' },
    { q: 'How do you create a responsive grid with react-bootstrap?', a: '<Container><Row xs={1} md={3} className="g-4"><Col>...</Col></Row></Container>; Col accepts props like md={6} or lg={{ span: 4, offset: 2 }}.', level: 'Medium' },
    { q: 'How is a react-bootstrap Modal opened and closed?', a: 'With a state variable: <Modal show={show} onHide={() => setShow(false)}>. A button sets show to true. onHide is called on Esc, backdrop click or close button.', level: 'Easy' },
    { q: 'What does controlId do on Form.Group?', a: 'It sets the id on the Form.Control and htmlFor on the Form.Label inside the group, linking label and input for accessibility.', level: 'Medium' },
    { q: 'react-bootstrap vs reactstrap vs MUI?', a: 'react-bootstrap and reactstrap both use Bootstrap CSS with React components (react-bootstrap more widely used, no Bootstrap JS). MUI implements Material Design with its own styling system (Emotion) and a larger component set.', level: 'Medium' },
    { q: 'List some Bootstrap best practices.', a: 'Customise via Sass/CSS variables, avoid !important, use utilities and the spacing scale, keep semantic HTML, mobile-first, import only needed parts, purge unused CSS, pin versions, test across breakpoints and with accessibility tools.', level: 'Medium' },
    { q: 'How do you make icon-only buttons accessible?', a: 'Add aria-label (or visually-hidden text) to the button and aria-hidden="true" to the icon.', level: 'Easy' },
    { q: 'What is .visually-hidden-focusable used for?', a: 'For skip links: the element is hidden until it receives keyboard focus, then it becomes visible so keyboard users can jump to main content.', level: 'Medium' },
    { q: 'How does Bootstrap handle users who prefer reduced motion?', a: 'With $enable-reduced-motion (true by default), transitions and animations are disabled inside @media (prefers-reduced-motion: reduce).', level: 'Hard' },
    { q: 'How would you use a Bootstrap tooltip in React without react-bootstrap?', a: 'Use a ref and useEffect: const t = new bootstrap.Tooltip(ref.current); return () => t.dispose(); so the instance is created after mount and cleaned up on unmount.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a react-bootstrap component <AlertBox> that shows a dismissible Alert and a "Show alert" button to bring it back.',
      hint: 'useState(true); <Alert show={show} variant="warning" onClose={...} dismissible>.',
      solution: `import { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';

export default function AlertBox() {
  const [show, setShow] = useState(true);
  return (
    <>
      <Alert show={show} variant="warning" onClose={() => setShow(false)} dismissible>
        <Alert.Heading>Heads up!</Alert.Heading>
        <p>Your trial ends in 3 days.</p>
      </Alert>
      {!show && <Button onClick={() => setShow(true)}>Show alert</Button>}
    </>
  );
}`,
    },
    {
      task: 'Build a react-bootstrap Tabs component with three tabs (Home, Profile, Contact) and a controlled active key.',
      hint: '<Tabs activeKey={key} onSelect={k => setKey(k)}>.',
      solution: `import { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

export default function ProfileTabs() {
  const [key, setKey] = useState('home');
  return (
    <Tabs id="profile-tabs" activeKey={key} onSelect={k => setKey(k)} className="mb-3">
      <Tab eventKey="home" title="Home">Welcome home.</Tab>
      <Tab eventKey="profile" title="Profile">Your profile.</Tab>
      <Tab eventKey="contact" title="Contact">Contact us.</Tab>
    </Tabs>
  );
}`,
    },
    {
      task: 'Write a plain React (no react-bootstrap) Collapse/"Read more" component using Bootstrap classes and state.',
      hint: 'Toggle the "show" class on a .collapse div; keep aria-expanded in sync.',
      solution: `function ReadMore() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <p>Bootstrap is a CSS framework.</p>
      <div id="more" className={'collapse' + (open ? ' show' : '')}>
        <p>It has a grid, components, utilities and dark mode.</p>
      </div>
      <button className="btn btn-link p-0" aria-expanded={open} aria-controls="more" onClick={() => setOpen(o => !o)}>
        {open ? 'Read less' : 'Read more'}
      </button>
    </div>
  );
}`,
    },
    {
      task: 'Audit and fix this snippet for accessibility: <div class="card" onclick="openPost()"><img src="a.jpg"><div class="card-body"><h5>Post</h5></div></div>',
      hint: 'Use a real link with stretched-link, add alt text.',
      solution: `<div class="card">
  <img src="a.jpg" class="card-img-top" alt="Developer working on a laptop">
  <div class="card-body">
    <h5 class="card-title"><a href="/posts/1" class="stretched-link text-decoration-none">Post title</a></h5>
  </div>
</div>`,
    },
  ],
  quiz: [
    { question: 'In react-bootstrap, how do you show a Modal?', options: ['data-bs-toggle="modal"', 'modal.show() from bootstrap', '<Modal show={true}> controlled by state', 'Adding class "show" manually'], answer: 2, explanation: 'react-bootstrap components are controlled with props.' },
    { question: 'What must you import once to style react-bootstrap components?', options: ['bootstrap/dist/css/bootstrap.min.css', 'react-bootstrap/style.css', 'bootstrap.bundle.js', 'Nothing'], answer: 0, explanation: 'react-bootstrap does not ship CSS; it uses Bootstrap\'s.' },
    { question: 'In JSX, the label attribute "for" is written as:', options: ['for', 'labelFor', 'forId', 'htmlFor'], answer: 3, explanation: 'for is a reserved word in JS.' },
    { question: 'Which is the accessible way to make an icon-only delete button?', options: ['<i class="bi bi-trash" onclick>', '<button aria-label="Delete"><i class="bi bi-trash" aria-hidden="true"></i></button>', '<div class="btn"><i class="bi bi-trash"></i></div>', '<button title=""><i class="bi bi-trash"></i></button>'], answer: 1, explanation: 'A real button with an accessible name; decorative icon hidden.' },
    { question: 'react-bootstrap <Row xs={1} md={3}> outputs which classes?', options: ['row col-xs-1 col-md-3', 'row xs-1 md-3', 'row row-cols-1 row-cols-md-3', 'row g-1 g-md-3'], answer: 2, explanation: 'Row size props map to row-cols-* classes.' },
  ],
};
