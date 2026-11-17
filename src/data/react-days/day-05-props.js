export default {
  id: 'day-05-props',
  title: 'Props: Passing Data, Destructuring, Default Values and children',
  module: 'Module 1: React Fundamentals',
  day: 5,
  level: 'Beginner',
  duration: '1.5 hours',
  summary:
    'Props let a parent component pass data to a child, making components reusable. Learn to pass any type of value, destructure props, set default values, and use the special children prop for wrapper components.',
  objectives: [
    'Pass strings, numbers, booleans, arrays, objects and functions as props',
    'Read props with destructuring in the function parameters',
    'Provide default values for optional props',
    'Use the children prop to build wrapper components like Card and Modal',
    'Explain why props are read-only',
  ],
  theory: [
    {
      heading: 'What are props?',
      content:
        '**Props** (short for properties) are the inputs of a component. A parent passes them like HTML attributes, and the child receives them as **one object** in its first parameter.\n\nAnalogy: a component is like a coffee machine, and props are the buttons you press: size, sugar, milk. Same machine, different coffee every time.',
      syntax: `// Parent passes props
<Greeting name="Asha" age={22} />

// Child receives an object: { name: "Asha", age: 22 }
function Greeting(props) {
  return <p>Hi {props.name}, you are {props.age}</p>;
}`,
      tip: 'Strings can use quotes; every other type (numbers, booleans, arrays, objects, functions, variables) must use curly braces: age={22}, not age="22".',
    },
    {
      heading: 'Destructuring props',
      content:
        'Writing `props.` everywhere is noisy. Use **object destructuring** directly in the parameter list. This also documents which props the component expects.',
      syntax: `function Greeting({ name, age }) {
  return <p>Hi {name}, you are {age}</p>;
}

// Rest syntax collects remaining props
function Button({ label, ...rest }) {
  return <button {...rest}>{label}</button>;
}`,
      points: [
        '`{ name, age }` pulls the properties out of the props object',
        '`...rest` gathers any other props, which you can spread onto an element with `{...rest}`',
      ],
    },
    {
      heading: 'Default values',
      content:
        'If a parent does not pass a prop, its value is `undefined`. Give defaults with **default parameter syntax** inside destructuring. Defaults apply only when the value is `undefined` (not for `null` or `""`).',
      syntax: `function Avatar({ size = 48, shape = "circle", src }) {
  return <img src={src} width={size} className={shape} alt="" />;
}

<Avatar src="a.png" />            // size 48, circle
<Avatar src="a.png" size={96} />  // size 96`,
      tip: 'Component.defaultProps is deprecated for function components. Use default parameters instead.',
    },
    {
      heading: 'Passing different data types',
      content: 'Props can be any JavaScript value:',
      syntax: `<Product
  title="Phone"              // string
  price={14999}               // number
  inStock={true}              // boolean (or just: inStock)
  tags={["5G", "128GB"]}      // array
  seller={{ name: "Ravi" }}   // object
  onBuy={() => alert("Bought")} // function
/>`,
      points: [
        'A prop with no value (`<Product inStock />`) is `true`',
        'Passing functions lets a child "talk back" to the parent (more on Day 8 and Day 10)',
        'Spread an object as props: `<Product {...productData} />`',
      ],
    },
    {
      heading: 'The children prop',
      content:
        'Whatever you place **between** the opening and closing tags of a component arrives as `props.children`. This lets you build **wrapper/layout components** (Card, Modal, Layout) that do not need to know what they contain.\n\nAnalogy: a gift box. The box (Card) provides the shape and wrapping paper; the gift inside (children) can be anything.',
      syntax: `function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="Profile">
  <p>Any JSX can go here</p>
  <button>Edit</button>
</Card>`,
    },
    {
      heading: 'Props are read-only (one-way data flow)',
      content:
        'A component must **never modify its own props**. Props belong to the parent. `props.name = "X"` is a bug: React will not re-render and in strict mode props objects are frozen.\n\nData flows **down** from parent to child. If a child needs to change something, the parent passes a function as a prop and the child calls it. If a component needs data that changes over time, it uses **state** (Day 7).',
      tip: 'Coming next (Day 6): showing or hiding parts of the UI with conditions and rendering lists of components from arrays.',
    },
  ],
  examples: [
    {
      title: 'One component, many products',
      scenario: 'A ProductCard receives name, price and image as props so it can display any product.',
      steps: [
        'Create ProductCard with destructured props name, price, image',
        'Render it three times in App with different values',
        'Run and see three different cards from one component',
      ],
      code: `function ProductCard({ name, price, image }) {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>₹{price}</p>
    </div>
  );
}

function App() {
  return (
    <div className="grid">
      <ProductCard name="Headphones" price={1999} image="https://picsum.photos/id/1/200/120" />
      <ProductCard name="Laptop Bag" price={1299} image="https://picsum.photos/id/2/200/120" />
      <ProductCard name="Keyboard" price={899} image="https://picsum.photos/id/3/200/120" />
    </div>
  );
}`,
      playground: {
        jsx: `function ProductCard({ name, price, image }) {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p className="price">₹{price.toLocaleString("en-IN")}</p>
    </div>
  );
}

function App() {
  return (
    <div className="grid">
      <ProductCard name="Headphones" price={1999} image="https://picsum.photos/id/1/200/120" />
      <ProductCard name="Laptop Bag" price={1299} image="https://picsum.photos/id/2/200/120" />
      <ProductCard name="Keyboard" price={899} image="https://picsum.photos/id/3/200/120" />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.card { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.card img { width: 100%; display: block; }
.card h3, .card p { margin: 8px 10px; }
.price { color: #16a34a; font-weight: bold; }`,
      },
      result: 'Three product cards with different images, names and prices.',
      explanation:
        'The parent decides the data, the child decides how it looks. price is passed with braces so it stays a number and toLocaleString can format it.',
    },
    {
      title: 'Default prop values',
      scenario: 'A Badge component has an optional color and size. Some usages pass them, others rely on defaults.',
      steps: [
        'Destructure text, color = "gray" and size = "md" in Badge',
        'Render badges with and without the optional props',
        'Run and compare the results',
      ],
      code: `function Badge({ text, color = "gray", size = "md" }) {
  return <span className={"badge " + color + " " + size}>{text}</span>;
}

<Badge text="Default" />
<Badge text="New" color="green" />
<Badge text="Sale" color="red" size="lg" />`,
      playground: {
        jsx: `function Badge({ text, color = "gray", size = "md" }) {
  return <span className={"badge " + color + " " + size}>{text}</span>;
}

function App() {
  return (
    <div>
      <Badge text="Default" />
      <Badge text="New" color="green" />
      <Badge text="Sale" color="red" size="lg" />
      <Badge text="Tiny" size="sm" color="blue" />
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.badge { display: inline-block; margin: 4px; border-radius: 999px; color: #fff; }
.gray { background: #64748b; } .green { background: #16a34a; } .red { background: #dc2626; } .blue { background: #2563eb; }
.sm { font-size: 11px; padding: 2px 8px; } .md { font-size: 14px; padding: 4px 12px; } .lg { font-size: 20px; padding: 6px 16px; }`,
      },
      result: 'Four badges: a grey medium "Default", green "New", large red "Sale" and small blue "Tiny".',
      explanation:
        'When color or size are not passed they are undefined, so the default parameter values kick in. Passed values override the defaults.',
    },
    {
      title: 'The children prop: a reusable Card wrapper',
      scenario: 'Create a Card that adds a title, border and shadow around ANY content passed between its tags.',
      steps: [
        'Create Card with props title and children',
        'Place different JSX inside two Card usages',
        'Run and see the same frame around different content',
      ],
      code: `function Card({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="body">{children}</div>
    </section>
  );
}

function App() {
  return (
    <>
      <Card title="About me"><p>Frontend developer from Jaipur.</p></Card>
      <Card title="Skills">
        <ul><li>HTML</li><li>CSS</li><li>React</li></ul>
      </Card>
    </>
  );
}`,
      playground: {
        jsx: `function Card({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="body">{children}</div>
    </section>
  );
}

function App() {
  return (
    <>
      <Card title="About me">
        <p>Frontend developer from Jaipur.</p>
      </Card>
      <Card title="Skills">
        <ul><li>HTML</li><li>CSS</li><li>React</li></ul>
      </Card>
      <Card title="Contact">
        <button onClick={() => alert("Message sent!")}>Say hello</button>
      </Card>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f8fafc; }
.card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 12px; overflow: hidden; }
.card h3 { margin: 0; padding: 10px 14px; background: #0ea5e9; color: #fff; }
.body { padding: 4px 14px 10px; }`,
      },
      result: 'Three cards with blue headers containing a paragraph, a list and a button respectively.',
      explanation:
        'Everything between <Card> and </Card> is passed as children. Card renders it wherever it places {children}, so Card works for any content.',
    },
    {
      title: 'Passing objects, arrays, booleans and functions',
      scenario: 'A UserProfile receives a user object, a skills array, an isOnline flag and an onFollow function.',
      steps: [
        'Define a user object and a handleFollow function in App',
        'Pass them as props with curly braces; pass isOnline as a bare prop',
        'Click Follow to call the parent function from the child',
      ],
      code: `function UserProfile({ user, skills, isOnline = false, onFollow }) {
  return (
    <div>
      <h3>{user.name} {isOnline ? "🟢" : "⚪"}</h3>
      <p>{user.role}</p>
      <p>{skills.join(", ")}</p>
      <button onClick={() => onFollow(user.name)}>Follow</button>
    </div>
  );
}

<UserProfile
  user={{ name: "Dev", role: "UI Engineer" }}
  skills={["React", "Figma"]}
  isOnline
  onFollow={name => alert("Following " + name)}
/>`,
      playground: {
        jsx: `function UserProfile({ user, skills, isOnline = false, onFollow }) {
  return (
    <div className="profile">
      <img src={user.avatar} alt={user.name} />
      <div>
        <h3>{user.name} <span title={isOnline ? "online" : "offline"}>{isOnline ? "🟢" : "⚪"}</span></h3>
        <p>{user.role}</p>
        <p className="skills">{skills.join(" · ")}</p>
        <button onClick={() => onFollow(user.name)}>Follow</button>
      </div>
    </div>
  );
}

function App() {
  const [msg, setMsg] = React.useState("");
  const handleFollow = name => setMsg("You are now following " + name + "!");
  return (
    <>
      <UserProfile
        user={{ name: "Dev Patel", role: "UI Engineer", avatar: "https://picsum.photos/id/64/80" }}
        skills={["React", "Figma", "CSS"]}
        isOnline
        onFollow={handleFollow}
      />
      <UserProfile
        user={{ name: "Sara Khan", role: "Backend Dev", avatar: "https://picsum.photos/id/65/80" }}
        skills={["Node", "SQL"]}
        onFollow={handleFollow}
      />
      <p className="msg">{msg}</p>
    </>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.profile { display: flex; gap: 12px; align-items: center; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; margin-bottom: 10px; }
.profile img { border-radius: 50%; }
.profile h3, .profile p { margin: 2px 0; }
.skills { color: #6b7280; font-size: .9rem; }
.msg { color: #7c3aed; font-weight: bold; }`,
      },
      result: 'Two profiles (one online, one offline). Clicking Follow shows a message rendered by the parent.',
      explanation:
        'Objects and arrays are passed with braces. isOnline with no value means true; the second profile uses the default false. onFollow is a function from the parent; calling it from the child is how children communicate upward.',
    },
  ],
  interview: [
    { q: 'What are props?', a: 'Read-only inputs passed from a parent component to a child, received by the child as a single object. They make components reusable and configurable.', level: 'Easy' },
    { q: 'Can a component modify its own props?', a: 'No. Props are read-only. A component must behave like a pure function with respect to its props. To change data, the owner (parent) updates its state, or the child uses its own state.', level: 'Easy' },
    { q: 'What is props.children?', a: 'A special prop containing whatever JSX is placed between a component\'s opening and closing tags. Used to build wrapper/layout components such as Card, Modal or Layout.', level: 'Easy' },
    { q: 'How do you set default values for props in a function component?', a: 'With default parameters in destructuring: function Button({ size = "md" }) {...}. defaultProps on function components is deprecated.', level: 'Easy' },
    { q: 'What is the difference between props and state?', a: 'Props are passed in from the parent and are read-only for the child. State is private data owned and managed by the component itself, and changing it triggers a re-render.', level: 'Medium' },
    { q: 'What is prop drilling?', a: 'Passing props through several intermediate components that do not need them, just to reach a deeply nested child. It can be solved with composition (children) or Context (Day 16).', level: 'Medium' },
    { q: 'How can a child component send data to its parent?', a: 'The parent passes a callback function as a prop; the child calls it with data as arguments, e.g. onSelect(item).', level: 'Medium' },
    { q: 'What does <Comp {...obj} /> do?', a: 'It spreads all properties of obj as individual props, equivalent to writing each key={value}. Useful but can pass unwanted props, so use carefully.', level: 'Medium' },
    { q: 'What is the value of a prop passed with no value, e.g. <Modal open />?', a: 'true. It is shorthand for open={true}.', level: 'Easy' },
    { q: 'Why does a default value not apply when the parent passes null?', a: 'Default parameters only apply when the value is undefined. null is a real value, so the default is skipped.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a WeatherCard that takes city, temp and condition props and render it for three cities.',
      hint: 'Pass temp as a number: temp={31}.',
      solution: `function WeatherCard({ city, temp, condition }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 10, margin: 6, borderRadius: 8 }}>
      <h3>{city}</h3>
      <p>{temp}°C · {condition}</p>
    </div>
  );
}

function App() {
  return (
    <>
      <WeatherCard city="Delhi" temp={31} condition="Sunny" />
      <WeatherCard city="Mumbai" temp={28} condition="Humid" />
      <WeatherCard city="Shimla" temp={12} condition="Cloudy" />
    </>
  );
}`,
    },
    {
      task: 'Make a Button component with props label, variant (default "primary") and onClick. Style primary and secondary differently.',
      hint: 'Use variant in an inline style or className.',
      solution: `function Button({ label, variant = "primary", onClick }) {
  const styles = {
    primary: { background: "#2563eb", color: "#fff" },
    secondary: { background: "#e5e7eb", color: "#111" },
  };
  return (
    <button style={{ ...styles[variant], border: 0, padding: "8px 14px", borderRadius: 6, margin: 4 }} onClick={onClick}>
      {label}
    </button>
  );
}

function App() {
  return (
    <>
      <Button label="Save" onClick={() => alert("Saved")} />
      <Button label="Cancel" variant="secondary" onClick={() => alert("Cancelled")} />
    </>
  );
}`,
    },
    {
      task: 'Build an Alert wrapper that receives a type ("success" | "error") and children, and shows the children inside a coloured box.',
      hint: 'Pick a background color based on type.',
      solution: `function Alert({ type = "success", children }) {
  const bg = type === "error" ? "#fee2e2" : "#dcfce7";
  return <div style={{ background: bg, padding: 12, borderRadius: 8, margin: 8 }}>{children}</div>;
}

function App() {
  return (
    <>
      <Alert>Profile updated <b>successfully</b>.</Alert>
      <Alert type="error">Payment failed. Please try again.</Alert>
    </>
  );
}`,
    },
    {
      task: 'Pass a whole movie object with spread syntax ({...movie}) to a MovieRow component that destructures title, year and rating.',
      hint: '<MovieRow {...movie} /> passes each key as a prop.',
      solution: `const movie = { title: "3 Idiots", year: 2009, rating: 8.4 };

function MovieRow({ title, year, rating }) {
  return <p>{title} ({year}) ⭐ {rating}</p>;
}

function App() {
  return <MovieRow {...movie} />;
}`,
    },
  ],
  quiz: [
    { question: 'How do you pass the number 25 as a prop?', options: ['age="25"', 'age={25}', 'age=(25)', 'age:25'], answer: 1, explanation: 'Non-string values use curly braces.' },
    { question: 'Which prop contains JSX placed between a component\'s tags?', options: ['props.inner', 'props.content', 'props.body', 'props.children'], answer: 3, explanation: 'Nested content is passed as children.' },
    { question: 'What is the correct way to give a default value to the prop size?', options: ['function Box({ size = 10 })', 'function Box({ size: default 10 })', 'Box.size = 10', 'function Box(size || 10)'], answer: 0, explanation: 'Use default parameters in destructuring.' },
    { question: 'Can a child component change the props it receives?', options: ['Yes, always', 'Only strings', 'No, props are read-only', 'Only inside useEffect'], answer: 2, explanation: 'Props are owned by the parent and must not be mutated.' },
    { question: 'What value does <Toggle on /> pass for on?', options: ['"on"', 'true', 'undefined', '1'], answer: 1, explanation: 'A prop with no value defaults to true.' },
  ],
};
