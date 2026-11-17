export default {
  id: 'extra-10-drag-and-drop-api',
  title: 'Drag and Drop API: draggable, dataTransfer and Drop Zones',
  module: 'Extra: HTML5 Browser APIs',
  extraNo: 10,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'The HTML Drag and Drop API lets users drag elements (or files from their computer) and drop them onto targets. You will learn the drag events, how dataTransfer carries data, how to create drop zones, and how to accept dropped files.',
  objectives: [
    'Make elements draggable and understand the drag event sequence',
    'Pass data with dataTransfer.setData / getData',
    'Create drop zones with dragover + preventDefault and drop',
    'Give visual feedback with dragenter/dragleave and dropEffect',
    'Accept files dropped from the desktop and know the API\'s accessibility limits',
  ],
  theory: [
    {
      heading: 'The big picture',
      content: `Drag and drop is like moving a sticky note from one board to another: you **pick it up** (drag source), **carry it** over other things, and **put it down** on a board that accepts it (drop target).

In HTML:
- The **drag source** needs \`draggable="true"\` (images, links and selected text are draggable by default).
- The **drop target** is any element that **cancels the \`dragover\` event**. By default, elements do NOT accept drops.
- The data being carried lives in \`event.dataTransfer\`.`,
      syntax: `<div id="card" draggable="true">Drag me</div>
<div id="zone">Drop here</div>`,
    },
    {
      heading: 'The drag events',
      content: `On the **dragged element**:
- \`dragstart\` – the drag begins. Put data into dataTransfer here.
- \`drag\` – fires repeatedly while dragging.
- \`dragend\` – the drag finished (dropped or cancelled). Clean up styles here.

On the **drop target**:
- \`dragenter\` – something entered this element (highlight it).
- \`dragover\` – fires every few ms while over it. **Call \`preventDefault()\`** to say "drops are allowed here".
- \`dragleave\` – the drag left this element (remove highlight).
- \`drop\` – the item was released here. Call \`preventDefault()\` to stop the browser's default (e.g. opening a dropped file or link) and read the data.`,
      tip: 'Number one bug: the drop event never fires because dragover did not call event.preventDefault().',
    },
    {
      heading: 'dataTransfer: the carrying bag',
      content: `\`event.dataTransfer\` holds what is being dragged.
- \`setData(type, string)\` in dragstart, e.g. \`setData('text/plain', card.id)\`.
- \`getData(type)\` in drop to read it back. (For security, getData returns an empty string during dragover/dragenter; only drop can read it.)
- \`effectAllowed\` (source) and \`dropEffect\` (target): \`copy\`, \`move\`, \`link\` or \`none\` – controls the cursor icon.
- \`setDragImage(element, x, y)\` – use a custom drag preview.
- \`files\` – the list of files when the user drags files from the computer.
- \`types\` – which data types are available (usable during dragover).`,
      syntax: `card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', card.id);
  e.dataTransfer.effectAllowed = 'move';
});
zone.addEventListener('dragover', (e) => e.preventDefault());
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  zone.appendChild(document.getElementById(id));
});`,
    },
    {
      heading: 'Dropping files',
      content: `When the user drags files from the desktop into the page, \`e.dataTransfer.files\` is a \`FileList\` in the drop event. Each item is a \`File\` (name, size, type) that you can preview with \`URL.createObjectURL(file)\` or read with \`FileReader\`, or upload with FormData.

Always call \`preventDefault()\` in both \`dragover\` and \`drop\`; otherwise the browser navigates away to open the file.`,
    },
    {
      heading: 'Limits and accessibility',
      content: `- The native API does **not work with touch** on many mobile browsers and cannot be used with the keyboard alone.
- Screen-reader users cannot perform drag and drop.

So always provide an **alternative**: buttons such as "Move to Done", a select menu, or a normal \`<input type="file">\` next to a file drop zone. Libraries like SortableJS or dnd-kit add touch and keyboard support for complex boards.`,
      tip: 'dragenter/dragleave also fire when moving over child elements inside the drop zone, causing flicker. Use pointer-events: none on children while dragging or a counter to track enter/leave.',
    },
  ],
  examples: [
    {
      title: 'Move cards between two columns (mini Kanban)',
      scenario: 'Drag task cards from "To do" to "Done" and back.',
      steps: [
        'Create two column divs with class="zone"',
        'Add cards with draggable="true" and unique ids',
        'On dragstart, store the card id in dataTransfer',
        'On dragover of a zone, call preventDefault()',
        'On drop, append the card to the zone',
        'Click Run and drag the cards',
      ],
      code: `card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', card.id));
zone.addEventListener('dragover', (e) => e.preventDefault());
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.appendChild(document.getElementById(e.dataTransfer.getData('text/plain')));
});`,
      playground: {
        html: `<div class="board">
  <div class="zone" id="todo"><h3>To do</h3>
    <div class="card" draggable="true" id="t1">Learn HTML</div>
    <div class="card" draggable="true" id="t2">Learn CSS</div>
    <div class="card" draggable="true" id="t3">Learn JS</div>
  </div>
  <div class="zone" id="done"><h3>Done</h3></div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.board { display: flex; gap: 16px; }
.zone { flex: 1; min-height: 200px; background: #f1f3f7; border-radius: 10px; padding: 10px; border: 2px dashed transparent; }
.zone.over { border-color: royalblue; background: #e6edff; }
.card { background: white; padding: 10px; margin: 8px 0; border-radius: 6px; box-shadow: 0 1px 3px rgb(0 0 0 / .2); cursor: grab; }
.card.dragging { opacity: .4; }`,
        js: `document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));
});
document.querySelectorAll('.zone').forEach((zone) => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });
  zone.addEventListener('dragenter', () => zone.classList.add('over'));
  zone.addEventListener('dragleave', (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('over');
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('over');
    const id = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(id);
    if (card) {
      zone.appendChild(card);
      console.log(card.textContent, '→', zone.id);
    }
  });
});`,
      },
      result: 'Cards can be dragged between columns; the target column is highlighted while hovering and the console logs "Learn HTML → done".',
      explanation: 'dragstart stores the id; dragover with preventDefault marks the zone as a valid target; drop reads the id and moves the element with appendChild (which moves, not copies). dragend removes the faded style. The relatedTarget check avoids flicker when moving over child cards.',
    },
    {
      title: 'Drop files from your computer',
      scenario: 'A drop zone that lists dropped files and previews images, with a normal file input as an accessible alternative.',
      steps: [
        'Create a drop zone div and an <input type="file" multiple>',
        'Prevent default on dragover and drop',
        'Read e.dataTransfer.files in drop',
        'Show name/size and an image preview with URL.createObjectURL',
        'Click Run and drag an image file from your desktop onto the zone',
      ],
      code: `zone.addEventListener('drop', (e) => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) {
    console.log(file.name, file.size, file.type);
  }
});`,
      playground: {
        html: `<div id="drop" tabindex="0">Drag files here</div>
<p>or <label>choose files <input type="file" id="picker" multiple></label></p>
<ul id="list"></ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#drop { border: 3px dashed #999; border-radius: 12px; padding: 40px; text-align: center; color: #666; }
#drop.over { border-color: seagreen; background: #eefbf2; color: seagreen; }
#list img { max-width: 120px; display: block; margin-top: 4px; border-radius: 4px; }`,
        js: `const drop = document.getElementById('drop');
const list = document.getElementById('list');
function showFiles(files) {
  for (const file of files) {
    const li = document.createElement('li');
    li.textContent = file.name + ' – ' + Math.round(file.size / 1024) + ' KB (' + (file.type || 'unknown') + ')';
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      li.appendChild(img);
    }
    list.appendChild(li);
    console.log('Received', file.name);
  }
}
['dragenter', 'dragover'].forEach((type) => drop.addEventListener(type, (e) => {
  e.preventDefault();
  drop.classList.add('over');
}));
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  showFiles(e.dataTransfer.files);
});
document.getElementById('picker').addEventListener('change', (e) => showFiles(e.target.files));`,
      },
      result: 'Dropping files lists their names and sizes, and images get a thumbnail preview. The file picker does the same for keyboard and touch users.',
      explanation: 'dataTransfer.files is a FileList available in drop. preventDefault on dragover and drop stops the browser from opening the file. URL.createObjectURL creates a temporary local URL for previewing without uploading.',
    },
    {
      title: 'Reorder a list with drag and drop (plus buttons)',
      scenario: 'Reorder a priority list by dragging items above/below each other, with Up buttons as an accessible alternative.',
      steps: [
        'Create a <ul> with draggable <li> items',
        'Track the dragged item in a variable on dragstart',
        'On dragover of another li, insert the dragged item before or after it depending on mouse position',
        'Add an "Up" button in each li that moves it up without dragging',
        'Click Run and reorder',
      ],
      code: `list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('li');
  if (!target || target === dragged) return;
  const box = target.getBoundingClientRect();
  const after = e.clientY > box.top + box.height / 2;
  target[after ? 'after' : 'before'](dragged);
});`,
      playground: {
        html: `<ul id="list">
  <li draggable="true">1. Fix login bug <button class="up" aria-label="Move up">↑</button></li>
  <li draggable="true">2. Write tests <button class="up" aria-label="Move up">↑</button></li>
  <li draggable="true">3. Update docs <button class="up" aria-label="Move up">↑</button></li>
  <li draggable="true">4. Deploy <button class="up" aria-label="Move up">↑</button></li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
ul { list-style: none; padding: 0; max-width: 320px; }
li { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #ccc; border-radius: 6px; padding: 8px 10px; margin: 6px 0; cursor: grab; }
li.dragging { opacity: .5; border-style: dashed; }`,
        js: `const list = document.getElementById('list');
let dragged = null;
list.addEventListener('dragstart', (e) => {
  dragged = e.target.closest('li');
  dragged.classList.add('dragging');
  e.dataTransfer.setData('text/plain', '');
  e.dataTransfer.effectAllowed = 'move';
});
list.addEventListener('dragend', () => {
  dragged.classList.remove('dragging');
  console.log('New order:', [...list.children].map((li) => li.firstChild.textContent.trim()).join(' | '));
  dragged = null;
});
list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('li');
  if (!target || target === dragged) return;
  const box = target.getBoundingClientRect();
  const after = e.clientY > box.top + box.height / 2;
  if (after) target.after(dragged); else target.before(dragged);
});
list.addEventListener('drop', (e) => e.preventDefault());
list.addEventListener('click', (e) => {
  if (!e.target.matches('.up')) return;
  const li = e.target.closest('li');
  if (li.previousElementSibling) li.previousElementSibling.before(li);
  e.target.focus();
});`,
      },
      result: 'Dragging an item over another moves it live into position; the console prints the new order on drop. The ↑ buttons reorder without a mouse.',
      explanation: 'We store the dragged li in a variable (simpler than dataTransfer inside the same page). During dragover we compare the mouse Y with the target\'s middle to decide before/after. Some browsers (Firefox) require setData in dragstart for the drag to start, so we set an empty string.',
    },
  ],
  interview: [
    { q: 'How do you make an element draggable?', a: 'Add draggable="true". Images, links and text selections are draggable by default.', level: 'Easy' },
    { q: 'Why does my drop event not fire?', a: 'Because elements reject drops by default. You must call event.preventDefault() in the dragover (and usually dragenter) handler of the target.', level: 'Medium' },
    { q: 'List the drag and drop events in order.', a: 'On the source: dragstart, drag (repeating), dragend. On targets: dragenter, dragover (repeating), dragleave, and drop when released over a valid target. dragend fires on the source last.', level: 'Medium' },
    { q: 'What is dataTransfer?', a: 'An object on drag events that holds the dragged data (setData/getData), the allowed and chosen effects (effectAllowed/dropEffect), any dragged files (files), and lets you set a custom drag image.', level: 'Medium' },
    { q: 'Why does getData return an empty string in dragover?', a: 'For security, the data store is in "protected mode" during dragenter/dragover; only the types are visible. Data can be read only in the drop event.', level: 'Hard' },
    { q: 'How do you handle files dropped from the desktop?', a: 'Prevent default on dragover and drop, then read e.dataTransfer.files (a FileList) in drop. Preview with URL.createObjectURL or FileReader, or upload with FormData.', level: 'Medium' },
    { q: 'What is the difference between effectAllowed and dropEffect?', a: 'effectAllowed is set by the source (in dragstart) to list permitted operations; dropEffect is set by the target (in dragover) to choose the operation and cursor. If they do not match, the drop is not allowed.', level: 'Hard' },
    { q: 'What are the accessibility problems with native drag and drop?', a: 'It does not work with keyboard or screen readers and has poor touch support. Provide alternative controls such as buttons, menus or a file input.', level: 'Medium' },
    { q: 'Why does dragleave fire when hovering over a child element of the drop zone?', a: 'Entering a child counts as leaving the parent. Fix with relatedTarget checks (zone.contains(e.relatedTarget)), an enter/leave counter, or pointer-events:none on children while dragging.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Drag a coloured square into a box; when dropped, the box shows "Dropped!" and turns green.',
      hint: 'dragover preventDefault + drop handler.',
      solution: `<div id="sq" draggable="true" style="width:50px;height:50px;background:tomato"></div>
<div id="box" style="width:200px;height:120px;border:2px dashed #555;margin-top:10px">Drop here</div>
<script>
  const box = document.getElementById('box');
  document.getElementById('sq').addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', 'sq'));
  box.addEventListener('dragover', (e) => e.preventDefault());
  box.addEventListener('drop', (e) => {
    e.preventDefault();
    box.textContent = 'Dropped!';
    box.style.background = 'lightgreen';
  });
</script>`,
    },
    {
      task: 'Create a "trash" zone: dropping any list item on it deletes the item.',
      hint: 'Store the item id in dataTransfer and call remove().',
      solution: `<ul>
  <li id="a" draggable="true">Item A</li>
  <li id="b" draggable="true">Item B</li>
</ul>
<div id="trash" style="padding:20px;border:2px solid red">🗑 Trash</div>
<script>
  document.querySelectorAll('li').forEach((li) =>
    li.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', li.id)));
  const t = document.getElementById('trash');
  t.addEventListener('dragover', (e) => e.preventDefault());
  t.addEventListener('drop', (e) => {
    e.preventDefault();
    document.getElementById(e.dataTransfer.getData('text/plain'))?.remove();
  });
</script>`,
    },
    {
      task: 'Make a drop zone that accepts only image files and shows an error for other types.',
      hint: 'Check file.type.startsWith("image/").',
      solution: `<div id="z" style="padding:40px;border:3px dashed #888">Drop images</div>
<p id="msg"></p>
<script>
  const z = document.getElementById('z');
  z.addEventListener('dragover', (e) => e.preventDefault());
  z.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    const bad = files.filter((f) => !f.type.startsWith('image/'));
    document.getElementById('msg').textContent = bad.length
      ? 'Not allowed: ' + bad.map((f) => f.name).join(', ')
      : files.length + ' image(s) accepted';
  });
</script>`,
    },
    {
      task: 'Copy instead of move: dragging a word chip into a sentence box adds a copy of the word.',
      hint: 'effectAllowed = "copy", dropEffect = "copy", append a new span with the text.',
      solution: `<span class="chip" draggable="true">Hello</span>
<span class="chip" draggable="true">World</span>
<div id="sentence" style="min-height:40px;border:1px solid #333;margin-top:10px"></div>
<script>
  document.querySelectorAll('.chip').forEach((c) => c.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', c.textContent);
    e.dataTransfer.effectAllowed = 'copy';
  }));
  const s = document.getElementById('sentence');
  s.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  s.addEventListener('drop', (e) => {
    e.preventDefault();
    s.append(e.dataTransfer.getData('text/plain') + ' ');
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'What must a drop target do for drop to be allowed?', options: ['Have draggable="true"', 'Call preventDefault() in dragover', 'Have the dropzone class', 'Call stopPropagation() in drop'], answer: 1, explanation: 'Cancelling dragover signals that the element accepts drops.' },
    { question: 'In which event should you call dataTransfer.setData()?', options: ['dragstart', 'dragover', 'drop', 'dragend'], answer: 0, explanation: 'Data is put into the drag at dragstart.' },
    { question: 'Where are files dropped from the desktop available?', options: ['e.target.files', 'e.dataTransfer.items only in dragstart', 'e.files', 'e.dataTransfer.files in drop'], answer: 3, explanation: 'dataTransfer.files holds the FileList during drop.' },
    { question: 'Which event fires on the source element when a drag ends (dropped or cancelled)?', options: ['drop', 'dragleave', 'dragend', 'mouseup'], answer: 2, explanation: 'dragend fires on the source after the operation finishes.' },
    { question: 'What is a key limitation of the native Drag and Drop API?', options: ['It only works with images', 'It is not keyboard/screen-reader accessible and weak on touch', 'It requires a server', 'It works only in Chrome'], answer: 1, explanation: 'Provide alternatives such as buttons for keyboard and touch users.' },
  ],
};
