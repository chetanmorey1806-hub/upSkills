export default {
  id: 'extra-07-dialog-element',
  title: 'Dialog Element: Modal and Non-Modal Dialogs with <dialog>',
  module: 'Extra: Elements & Attributes',
  extraNo: 7,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'The native <dialog> element creates pop-up boxes such as confirmations, forms and alerts. With showModal() the browser handles focus trapping, the Escape key, the backdrop and accessibility for you, replacing a lot of custom JavaScript.',
  objectives: [
    'Create a dialog and open it with show() and showModal()',
    'Explain the difference between modal and non-modal dialogs',
    'Close a dialog with close(), the Escape key and <form method="dialog">',
    'Read returnValue and handle the close and cancel events',
    'Style the dialog and its ::backdrop',
  ],
  theory: [
    {
      heading: 'What is <dialog>?',
      content: `A dialog is a small window that appears on top of the page to ask or tell the user something: "Delete this file?", a login form, a cookie notice.

Before \`<dialog>\`, developers built these from \`<div>\`s and had to write a lot of JavaScript: blocking the page behind, moving focus inside, handling Escape, returning focus afterwards, and adding ARIA roles. \`<dialog>\` does all of that natively.

A dialog is hidden by default. You open it with JavaScript (or with the \`open\` attribute for a non-modal dialog).`,
      syntax: `<dialog id="hello">
  <p>Hello from a dialog!</p>
  <button id="close">Close</button>
</dialog>
<button id="open">Open</button>`,
    },
    {
      heading: 'Modal vs non-modal',
      content: `- \`dialog.showModal()\` → **modal**: shown in the top layer, above everything; the rest of the page becomes inert (cannot be clicked or tabbed to); a \`::backdrop\` covers the page; Escape closes it. Use for confirmations and forms that need an answer.
- \`dialog.show()\` → **non-modal**: appears but the page is still usable. Like a small floating toolbox or chat widget.
- \`dialog.close(value)\` → closes it, optionally setting \`returnValue\`.

The \`open\` attribute shows whether it is open. Avoid adding \`open\` manually for modals: it opens the dialog as non-modal and without the modal behaviour.`,
      tip: 'Restaurant analogy: a modal dialog is like the waiter blocking your table until you choose a dish; a non-modal dialog is a menu card left on the table while you keep chatting.',
    },
    {
      heading: 'Closing with <form method="dialog">',
      content: `Inside a dialog, a form with \`method="dialog"\` does not send anything to a server. Instead, submitting it **closes the dialog** and sets \`dialog.returnValue\` to the \`value\` of the button that was clicked.

This gives you "OK / Cancel" buttons with no JavaScript click handlers. You then listen for the \`close\` event and check \`returnValue\`.

Validation still runs: if an input inside is \`required\` and empty, the dialog will not close (except with a button that has \`formnovalidate\`).`,
      syntax: `<dialog id="confirm">
  <form method="dialog">
    <p>Delete this photo?</p>
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>`,
    },
    {
      heading: 'Events: close and cancel',
      content: `- \`close\` fires whenever the dialog closes (by \`close()\`, form submit, or Escape).
- \`cancel\` fires when the user presses Escape on a modal. You can call \`event.preventDefault()\` to stop it closing, e.g. if there are unsaved changes (browsers may still allow a second Escape).

**Light dismiss** (closing when clicking the backdrop) is not automatic in all browsers. You can add it: listen for clicks on the dialog and close if the click target is the dialog itself (the backdrop area counts as the dialog element). Newer browsers also support \`closedby="any"\`.`,
      syntax: `dialog.addEventListener('close', () => {
  console.log('Result:', dialog.returnValue);
});`,
    },
    {
      heading: 'Styling and accessibility',
      content: `- Style the box with normal CSS on \`dialog\` (padding, border-radius, max-width).
- Style the overlay with \`dialog::backdrop { background: rgb(0 0 0 / .5); }\`.
- Give the dialog an accessible name: \`aria-labelledby\` pointing to its heading.
- Focus moves into the dialog on open (to the first focusable element, or use \`autofocus\` on a specific control) and returns to the opening button on close.
- Always provide a visible close/cancel button; not everyone knows Escape.`,
      tip: 'Coming from day 18/19? Do not confuse <dialog> with window.alert(). alert() blocks the whole JS thread and cannot be styled; <dialog> is a normal, stylable element.',
    },
  ],
  examples: [
    {
      title: 'Basic modal with backdrop',
      scenario: 'A "Terms" button opens a modal that can be closed with a button or the Escape key.',
      steps: [
        'Create a <dialog> with a heading, text and a Close button',
        'Add an Open button outside the dialog',
        'In JS, call showModal() on open and close() on close',
        'Style dialog::backdrop',
        'Click Run, open the dialog, try Tab and Escape',
      ],
      code: `const dlg = document.getElementById('terms');
openBtn.addEventListener('click', () => dlg.showModal());
closeBtn.addEventListener('click', () => dlg.close());`,
      playground: {
        html: `<button id="openBtn">Read terms</button>
<p>Try clicking this text while the dialog is open – you can't.</p>
<dialog id="terms" aria-labelledby="terms-title">
  <h2 id="terms-title">Terms of use</h2>
  <p>Be kind. Do not share your password.</p>
  <button id="closeBtn" autofocus>Close</button>
</dialog>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
dialog { border: none; border-radius: 12px; padding: 20px 24px; max-width: 320px; box-shadow: 0 10px 30px rgb(0 0 0 / .3); }
dialog::backdrop { background: rgb(20 20 40 / .55); }`,
        js: `const dlg = document.getElementById('terms');
document.getElementById('openBtn').addEventListener('click', () => dlg.showModal());
document.getElementById('closeBtn').addEventListener('click', () => dlg.close());
dlg.addEventListener('close', () => console.log('Dialog closed. open =', dlg.open));`,
      },
      result: 'Clicking "Read terms" dims the page and shows a centered box. Tab stays inside the box. Close or Escape hides it and the console logs "Dialog closed. open = false".',
      explanation: 'showModal() puts the dialog in the top layer, makes the page inert, and shows ::backdrop. Focus goes to the autofocus button. close() hides it and fires the close event.',
    },
    {
      title: 'Confirm dialog with form method="dialog" and returnValue',
      scenario: 'Deleting an item asks for confirmation; the item is removed only if the user picks Delete.',
      steps: [
        'Create a list item with a Delete button',
        'Create a dialog containing <form method="dialog"> with Cancel and Delete buttons that have values',
        'Open it with showModal()',
        'On the close event, check returnValue and remove the item if it is "delete"',
        'Click Run and try both buttons',
      ],
      code: `<dialog id="confirm">
  <form method="dialog">
    <p>Delete "Holiday.jpg"?</p>
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>`,
      playground: {
        html: `<ul><li id="item">Holiday.jpg <button id="del">Delete</button></li></ul>
<dialog id="confirm" aria-labelledby="c-title">
  <form method="dialog">
    <h3 id="c-title">Delete "Holiday.jpg"?</h3>
    <p>This cannot be undone.</p>
    <menu>
      <button value="cancel" autofocus>Cancel</button>
      <button value="delete" class="danger">Delete</button>
    </menu>
  </form>
</dialog>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
dialog { border: 1px solid #ccc; border-radius: 10px; }
dialog::backdrop { background: rgb(0 0 0 / .4); }
menu { display: flex; gap: 8px; justify-content: flex-end; padding: 0; margin: 0; }
.danger { background: crimson; color: white; border: none; padding: 6px 12px; border-radius: 6px; }`,
        js: `const dlg = document.getElementById('confirm');
document.getElementById('del').addEventListener('click', () => {
  dlg.returnValue = '';
  dlg.showModal();
});
dlg.addEventListener('close', () => {
  console.log('returnValue:', JSON.stringify(dlg.returnValue));
  if (dlg.returnValue === 'delete') {
    document.getElementById('item').remove();
    console.log('Item deleted');
  }
});`,
      },
      result: 'Cancel or Escape keeps the item (returnValue "cancel" or ""). Delete removes it and logs "Item deleted".',
      explanation: 'Submitting a method="dialog" form closes the dialog and sets returnValue to the clicked button\'s value. We reset returnValue before opening so an Escape is not mistaken for the previous answer.',
    },
    {
      title: 'Non-modal dialog and click-outside to close',
      scenario: 'Compare show() (page stays usable) with showModal() + closing when the backdrop is clicked.',
      steps: [
        'Create two dialogs: a help panel and a modal',
        'Open the help panel with show()',
        'Open the modal with showModal() and close it when the click target is the dialog itself',
        'Click Run and test both',
      ],
      code: `modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close(); // clicked the backdrop area
});`,
      playground: {
        html: `<button id="help">Show help (non-modal)</button>
<button id="modalBtn">Show modal (click outside to close)</button>
<p><input placeholder="You can still type here with non-modal"></p>
<dialog id="helpDlg">
  <p>Tip: use Tab to move between fields.</p>
  <button id="helpClose">Got it</button>
</dialog>
<dialog id="modal">
  <div class="inner">
    <p>Click the dark area to close me.</p>
  </div>
</dialog>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#helpDlg { position: fixed; bottom: 16px; right: 16px; left: auto; top: auto; margin: 0; border: 2px solid teal; border-radius: 8px; }
#modal { padding: 0; border: none; border-radius: 10px; }
#modal .inner { padding: 24px; }
#modal::backdrop { background: rgb(0 0 0 / .5); }`,
        js: `const help = document.getElementById('helpDlg');
const modal = document.getElementById('modal');
document.getElementById('help').onclick = () => help.show();
document.getElementById('helpClose').onclick = () => help.close();
document.getElementById('modalBtn').onclick = () => modal.showModal();
modal.addEventListener('click', (e) => {
  if (e.target === modal) { modal.close(); console.log('Closed by clicking backdrop'); }
});
modal.addEventListener('cancel', () => console.log('Escape pressed (cancel event)'));`,
      },
      result: 'The help dialog appears bottom-right while the input stays usable. The modal dims the page and closes when you click the dark area or press Escape.',
      explanation: 'show() does not make the page inert and has no backdrop. For the modal, the inner div has the padding, so clicks inside hit .inner/p while clicks on the backdrop target the dialog element itself.',
    },
  ],
  interview: [
    { q: 'What is the <dialog> element?', a: 'A native HTML element representing a dialog box or modal. It provides show(), showModal() and close() methods, a ::backdrop, focus management, Escape handling and the correct accessibility role.', level: 'Easy' },
    { q: 'What is the difference between show() and showModal()?', a: 'show() opens a non-modal dialog; the rest of the page stays interactive. showModal() opens it in the top layer, makes the rest of the page inert, shows ::backdrop and enables Escape to close.', level: 'Easy' },
    { q: 'What does <form method="dialog"> do?', a: 'Submitting the form closes the parent dialog instead of making an HTTP request, and sets dialog.returnValue to the submitter button\'s value.', level: 'Medium' },
    { q: 'How do you style the overlay behind a modal dialog?', a: 'With the ::backdrop pseudo-element, e.g. dialog::backdrop { background: rgb(0 0 0 / .5); backdrop-filter: blur(2px); }.', level: 'Easy' },
    { q: 'What is the difference between the close and cancel events?', a: 'cancel fires when the user tries to dismiss a modal with Escape (preventable). close fires after the dialog has closed by any means.', level: 'Medium' },
    { q: 'How do you close a modal dialog when the user clicks outside it?', a: 'Listen for click on the dialog and close if event.target === dialog (backdrop clicks target the dialog itself), keeping content inside a padded inner wrapper; or use closedby="any" in supporting browsers.', level: 'Hard' },
    { q: 'Why is <dialog> better than a custom div modal?', a: 'It automatically traps focus (inert background), handles Escape, uses the top layer (no z-index wars), restores focus, and exposes role="dialog" and aria-modal semantics without extra code.', level: 'Medium' },
    { q: 'How do you give a dialog an accessible name?', a: 'Use aria-labelledby pointing to the dialog\'s heading id, or aria-label.', level: 'Medium' },
    { q: 'Why should you not use the open attribute to show a modal?', a: 'Adding open shows the dialog non-modally: no backdrop, no inert background, no Escape handling. Use showModal() for modal behaviour.', level: 'Medium' },
    { q: 'What is the "top layer"?', a: 'A special browser layer above all other content used by modal dialogs, popovers and fullscreen elements; they appear on top regardless of z-index or overflow of ancestors.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a "Subscribe" button that opens a modal with an email input and Subscribe/Cancel buttons. Log the email if subscribed.',
      hint: 'Use form method="dialog", give the Cancel button formnovalidate.',
      solution: `<button id="open">Subscribe</button>
<dialog id="d">
  <form method="dialog">
    <label>Email <input id="email" type="email" required></label>
    <button value="cancel" formnovalidate>Cancel</button>
    <button value="ok">Subscribe</button>
  </form>
</dialog>
<script>
  const d = document.getElementById('d');
  document.getElementById('open').onclick = () => d.showModal();
  d.addEventListener('close', () => {
    if (d.returnValue === 'ok') console.log('Subscribed:', document.getElementById('email').value);
  });
</script>`,
    },
    {
      task: 'Style a dialog with rounded corners and a blurred, semi-transparent backdrop.',
      hint: 'Use backdrop-filter on ::backdrop.',
      solution: `<style>
  dialog { border: none; border-radius: 16px; padding: 24px; }
  dialog::backdrop { background: rgb(0 0 0 / .4); backdrop-filter: blur(3px); }
</style>
<dialog id="d"><p>Pretty!</p><form method="dialog"><button>OK</button></form></dialog>
<button onclick="document.getElementById('d').showModal()">Open</button>`,
    },
    {
      task: 'Prevent a modal from closing with Escape while a textarea inside has text.',
      hint: 'Listen to cancel and call preventDefault conditionally.',
      solution: `<dialog id="d">
  <textarea id="t"></textarea>
  <button onclick="this.closest('dialog').close()">Close</button>
</dialog>
<button onclick="document.getElementById('d').showModal()">Open</button>
<script>
  document.getElementById('d').addEventListener('cancel', (e) => {
    if (document.getElementById('t').value.trim()) {
      e.preventDefault();
      console.log('You have unsaved text!');
    }
  });
</script>`,
    },
    {
      task: 'Build a cookie banner using a non-modal dialog that opens on page load and closes when "Accept" is clicked.',
      hint: 'Call show() on load; position it fixed at the bottom.',
      solution: `<style>#cookie { position: fixed; bottom: 0; left: 0; right: 0; margin: 0; width: 100%; border: none; background: #222; color: #fff; }</style>
<dialog id="cookie">
  We use cookies. <form method="dialog" style="display:inline"><button>Accept</button></form>
</dialog>
<script>document.getElementById('cookie').show();</script>`,
    },
  ],
  quiz: [
    { question: 'Which method opens a dialog that blocks interaction with the rest of the page?', options: ['show()', 'open()', 'showModal()', 'display()'], answer: 2, explanation: 'showModal() opens a modal dialog and makes the rest of the page inert.' },
    { question: 'Which pseudo-element styles the overlay behind a modal dialog?', options: ['::overlay', '::backdrop', '::before', '::shadow'], answer: 1, explanation: '::backdrop is rendered behind modal dialogs.' },
    { question: 'What happens when a <form method="dialog"> inside a dialog is submitted?', options: ['The dialog closes and returnValue is set to the button value', 'The form is sent to the server', 'The page reloads', 'Nothing'], answer: 0, explanation: 'method="dialog" closes the dialog and sets returnValue.' },
    { question: 'Which event can you preventDefault() to stop Escape from closing a modal?', options: ['close', 'keydown on body', 'blur', 'cancel'], answer: 3, explanation: 'The cancel event fires on Escape and is cancelable.' },
    { question: 'Which property tells you whether a dialog is currently shown?', options: ['dialog.visible', 'dialog.open', 'dialog.shown', 'dialog.active'], answer: 1, explanation: 'dialog.open reflects the open attribute.' },
  ],
};
