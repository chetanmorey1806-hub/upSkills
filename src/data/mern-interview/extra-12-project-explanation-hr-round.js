export default {
  id: 'extra-12-project-explanation-hr-round',
  title: 'Project Explanation & HR Round for MERN Developers: 2-Minute Pitch, Architecture Questions, Resume Tips, Model HR Answers',
  module: 'Interview: Full Stack',
  extraNo: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'For freshers, your project IS your experience. This topic teaches you how to explain your MERN project in 2 minutes, answer deep architecture questions about it, build an honest ATS-friendly resume, and handle common HR questions (TCS/Infosys/Wipro style and startup style) with model answers you can adapt.',
  objectives: [
    'Explain any MERN project in a 2-minute structured pitch (problem, features, stack, architecture, your role, challenge, result)',
    'Answer follow-up questions on auth flow, schema design, API structure, state management, deployment and security of your own project',
    'Write strong resume bullets using action verb + what + how + result',
    'Answer common HR questions with the STAR method and honest, positive model answers',
    'Avoid red flags: copied projects, vague answers, badmouthing, salary and bond mistakes',
  ],
  theory: [
    {
      heading: 'The 2-minute project pitch: a fixed structure',
      content: `When the interviewer says "Tell me about your project", they test **clarity, ownership and depth**. Use this 7-part structure (about 15-20 seconds each):

1. **One-line summary + problem**: "ShopKart is a full-stack e-commerce web app where small local sellers can list products and customers can order online."
2. **Key features (3-4 only)**: JWT login with roles, product search and filters, cart and Razorpay checkout, admin dashboard for orders.
3. **Tech stack and why**: React 19 + Vite, Redux Toolkit / Context, Node + Express 5 REST API, MongoDB Atlas with Mongoose, Cloudinary for images, deployed on Vercel + Render.
4. **Architecture in one breath**: "The React app calls the Express REST API with Axios; Express has routes, controllers, middleware for auth and validation, and Mongoose models; MongoDB stores users, products and orders."
5. **Your role**: what YOU built (if it was a team project, be precise: "I owned the backend and the cart flow").
6. **One challenge + how you solved it**: a real bug or design decision (e.g. preventing overselling with an atomic \`$inc\` update, or fixing CORS with cookies).
7. **Result/learning + what next**: "Deployed live with ~40 test users; learned indexing and error handling; next I'd add Redis caching and tests."

**Practice it aloud with a timer** until it sounds natural, not memorised. Keep the live link and GitHub ready.`,
      tip: 'Do not start with "So basically, in this project we have used MERN stack...". Start with what the app does for whom. Interviewers remember problems, not stack lists.',
    },
    {
      heading: 'Architecture questions about YOUR project (prepare these)',
      content: `After the pitch, interviewers dig into whatever you said. Prepare a 30-60 second answer for each:

- **Folder structure**: \`client/\` (components, pages, hooks, store, api) and \`server/\` (routes, controllers, models, middleware, config, utils).
- **Request flow**: "User clicks Add to Cart -> React dispatches an action -> Axios POST /api/cart with the token -> Express route -> auth middleware verifies JWT -> validation -> controller -> Mongoose updates the cart -> JSON response -> state updates -> UI re-renders."
- **Authentication**: signup hashes the password with bcrypt; login returns a JWT (where stored: httpOnly cookie or memory/localStorage, and why); protected routes on the frontend AND middleware on the backend; role-based access for admin.
- **Database schema**: collections, important fields, which relations are embedded vs referenced and why, which indexes you added.
- **State management**: why Context or Redux Toolkit or React Query; what is global vs local state.
- **Error handling and validation**: central error middleware, Joi/zod/express-validator, consistent JSON error shape, frontend error/loading states.
- **Security**: hashed passwords, JWT expiry, CORS whitelist, Helmet, rate limiting on login, no secrets in Git, input sanitisation.
- **Deployment**: where each part is hosted, env variables, CI/CD.
- **Scaling and improvements**: "If 10,000 users came tomorrow..." -> indexes, pagination, caching, image CDN, horizontal scaling.

**Golden rule**: never claim something you did not do. "I have not implemented refresh tokens yet, but here is how I would..." is a strong answer.`,
      points: [
        'Know every line of the code you show; interviewers may ask you to open GitHub and explain a file',
        'Know your numbers: how many APIs, collections, pages, users',
        'Have one diagram in your head: React -> Express -> MongoDB, plus third-party services',
      ],
    },
    {
      heading: 'Resume tips for MERN freshers',
      content: `Recruiters spend about 6-10 seconds on the first scan, and many companies filter resumes with an **ATS** (Applicant Tracking System).

- **One page**, simple single-column layout, standard headings (Summary, Skills, Projects, Education, Certifications), PDF format, no photos or tables for ATS safety.
- **Header**: name, phone, professional email, LinkedIn, GitHub, portfolio/live links.
- **Skills grouped**: Languages (JavaScript ES2024, TypeScript basics), Frontend (React 19, Redux Toolkit, Tailwind CSS), Backend (Node.js 22, Express 5, REST APIs, JWT), Database (MongoDB 8, Mongoose, SQL basics), Tools (Git, GitHub Actions, Docker basics, Postman, Vercel, Render). List only what you can answer questions on.
- **Projects (most important for freshers)**: 2-3 projects, each with live link + GitHub, stack, and 3-4 bullets using **Action verb + what + how + measurable result**:
  - Weak: "Made login page."
  - Strong: "Built JWT-based authentication with role-based access (user/admin) and bcrypt password hashing, securing 18 REST endpoints."
  - Strong: "Reduced product list API response time from 1.2s to 180ms by adding compound MongoDB indexes and pagination."
- Internship/experience, hackathons, open source and certifications go after projects.
- **Avoid**: spelling mistakes, "Hardworking, team player" without proof, skill bars like "React 90%", tutorial clones listed as unique ideas, CGPA lies, unprofessional email IDs.

Tailor keywords to the job description (e.g. "REST API", "MongoDB aggregation", "Redux") honestly.`,
      tip: 'A clean README on GitHub with screenshots, features, tech stack, setup steps and a live link makes your project look professional in 30 seconds.',
    },
    {
      heading: 'HR round basics and the STAR method',
      content: `The HR round checks **communication, attitude, culture fit, stability and expectations**. It can eliminate you, so prepare it as seriously as the technical round.

**STAR method** for behavioural questions ("Tell me about a time when..."):
- **S**ituation: short context (1-2 lines)
- **T**ask: what you had to achieve
- **A**ction: what YOU did (most of the answer, use "I")
- **R**esult: outcome with a number if possible, plus what you learned

**General rules:**
- Be honest, positive and specific; give a short example for every claim.
- Never badmouth previous college, teachers, teammates or employers.
- Research the company: products/services, clients, recent news, values. For service companies (TCS, Infosys, Wipro, Accenture, Cognizant) know about training programs, relocation and bond policies; for startups know their product and users.
- Common service-company HR topics: willingness to relocate, night shifts, service agreement/bond, joining date, gap year explanation, higher studies plans.
- Prepare 2-3 questions to ask them: "What would my first 3 months look like?", "What tech stack will the team use?", "How do you support learning for freshers?"`,
      tip: 'Answer length: 45-90 seconds for most HR questions. Stop when you have answered; long answers sound unprepared.',
    },
    {
      heading: 'Salary, bond, relocation and offer questions',
      content: `**Expected salary (fresher)**: for mass recruiters the package is usually fixed; say "I am comfortable with the standard package for this role; my priority is learning and growth." For startups/product companies, research ranges (Glassdoor, AmbitionBox, seniors) and give a range: "Based on my research for MERN developer roles in Pune, I am expecting 5-7 LPA, but I am flexible for the right learning opportunity."

**Bond/service agreement**: read it carefully before saying yes. A professional answer: "Yes, I understand the service agreement. I am looking for a long-term start to my career, so it is fine with me."

**Relocation/shifts**: if flexible, say so clearly. If you have a real constraint, be honest and polite, do not lie and then refuse at joining.

**Multiple offers**: "I have an offer from X, but your role matches my MERN skills better and I am excited about your product. Can you share the timeline?" Never fake offers.

**Notice period / joining date**: freshers usually say "I can join immediately after my final exams in June."

**Questions about gaps or backlogs**: be factual, brief and show what you did: "I took a gap year to prepare for GATE; when I decided on development, I built three MERN projects and completed an internship."`,
      points: [
        'Never say "I only want money" or "I will leave if I get a better offer"',
        'Never commit to something you will not honour (relocation, bond)',
        'Thank the interviewer and follow up politely by email if appropriate',
      ],
    },
    {
      heading: 'Red flags to avoid and how to recover from mistakes',
      content: `**Red flags interviewers notice:**
- Cannot explain own project code ("my friend did that part") -> shows the project is copied.
- Uses buzzwords without understanding ("we used microservices, Kafka, Kubernetes" in a 2-week college project).
- Says "I know everything" or gives a long answer to a question they did not understand.
- Arrogance, interrupting, checking the phone, poor camera/audio in virtual interviews.
- Inconsistency between resume and answers.

**When you do not know the answer:** "I have not worked with that yet. From what I understand it is ... If I needed it, I would read the docs and build a small example." This is far better than guessing confidently.

**When you make a mistake:** "Sorry, let me correct that: useEffect with an empty array runs after the first render, not before." Self-correction shows honesty and knowledge.

**Virtual interview checklist:** stable internet, quiet room, camera at eye level, laptop charged, code editor and project already open, resume printed beside you, join 5 minutes early.`,
      tip: 'End every interview with a short, genuine line: "Thank you, I enjoyed discussing my project. I would be excited to contribute to your team."',
    },
  ],
  examples: [
    {
      title: 'Model 2-minute pitch for a MERN e-commerce project',
      scenario: 'Interviewer: "Explain your project." Below is a complete answer following the 7-part structure. Replace the details with your own project.',
      steps: [
        'Say the one-line summary and problem',
        'List 3-4 key features',
        'Name the stack and why',
        'Explain the architecture in one sentence',
        'State your role, one challenge and the result',
      ],
      code: `"My main project is ShopKart, a full-stack e-commerce web app for small local sellers who
cannot afford their own online store.

Customers can sign up, search and filter products, add them to a cart and pay with Razorpay.
Sellers and admins have a dashboard to manage products and order status.

I built it with the MERN stack: React 19 with Vite and Redux Toolkit on the frontend,
Node.js with Express 5 for a REST API, and MongoDB Atlas with Mongoose. Images are stored on
Cloudinary. The frontend is on Vercel and the API on Render.

The React app talks to around 20 REST endpoints through Axios. On the backend I followed a
routes - controllers - models structure, with middleware for JWT authentication, role checks,
validation using zod, and a central error handler.

I built it individually. The most interesting challenge was overselling: two users could buy
the last item at the same time. I fixed it with an atomic MongoDB update that decrements stock
only if stock >= quantity, and a transaction when creating the order.

It is live, about 40 friends tested it, and it taught me schema design, indexing and
deployment. Next I want to add Redis caching and automated tests."`,
      result: 'A clear ~2-minute answer (about 250 words) that invites good follow-up questions: JWT, atomic updates, transactions, deployment.',
      explanation: `Why it works: it starts with the problem and user, not the tech. Features are limited to the important ones. The stack has a reason. The challenge is real, technical and shows depth (the interviewer will now ask about atomic updates, which you have prepared). Numbers (20 endpoints, 40 users) make it believable. It ends with "what next", showing growth mindset. Speak at a calm pace and pause after each part so the interviewer can interrupt.`,
    },
    {
      title: 'Explaining the request flow of your project (runnable demo)',
      scenario: 'Follow-up question: "What happens when a logged-in user opens My Orders?" This tiny simulation shows the route -> middleware -> controller chain that Express uses, so you can explain it confidently.',
      steps: [
        'auth() reads the Bearer token; if invalid it ends the request with 401',
        'If valid it attaches req.user, like real JWT middleware',
        'getMyOrders() filters orders by req.user.id (users only see their own orders)',
        'Click Run to see one request without a token and one with a token',
      ],
      code: `// Request flow of a typical MERN project: route -> middlewares -> controller
const users = { 't0k3n': { id: 'u1', name: 'Asha', role: 'user' } };
const orders = [{ id: 'o1', userId: 'u1', total: 1299 }, { id: 'o2', userId: 'u2', total: 450 }];
function auth(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = users[token];
  if (!user) return { status: 401, body: { error: 'Not logged in' } };
  req.user = user;
}
function getMyOrders(req) {
  const mine = orders.filter((o) => o.userId === req.user.id);
  return { status: 200, body: mine };
}
function handle(req, chain) {
  console.log('->', req.method, req.url);
  for (const step of chain) {
    const res = step(req);
    if (res) { console.log('<-', res.status, JSON.stringify(res.body)); return; }
  }
}
handle({ method: 'GET', url: '/api/orders/me', headers: {} }, [auth, getMyOrders]);
handle({ method: 'GET', url: '/api/orders/me', headers: { authorization: 'Bearer t0k3n' } }, [auth, getMyOrders]);`,
      playground: {
        html: '<h3>Request flow: auth middleware + controller - open the console</h3>',
        js: `const users = { 't0k3n': { id: 'u1', name: 'Asha', role: 'user' } };
const orders = [{ id: 'o1', userId: 'u1', total: 1299 }, { id: 'o2', userId: 'u2', total: 450 }];
function auth(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = users[token];
  if (!user) return { status: 401, body: { error: 'Not logged in' } };
  req.user = user;
}
function getMyOrders(req) {
  const mine = orders.filter((o) => o.userId === req.user.id);
  return { status: 200, body: mine };
}
function handle(req, chain) {
  console.log('->', req.method, req.url);
  for (const step of chain) {
    const res = step(req);
    if (res) { console.log('<-', res.status, JSON.stringify(res.body)); return; }
  }
}
handle({ method: 'GET', url: '/api/orders/me', headers: {} }, [auth, getMyOrders]);
handle({ method: 'GET', url: '/api/orders/me', headers: { authorization: 'Bearer t0k3n' } }, [auth, getMyOrders]);`,
      },
      result: `-> GET /api/orders/me
<- 401 {"error":"Not logged in"}
-> GET /api/orders/me
<- 200 [{"id":"o1","userId":"u1","total":1299}]`,
      explanation: `How to say it in the interview: "The React My Orders page calls GET /api/orders/me with the JWT. In Express the route is router.get('/me', protect, getMyOrders). protect verifies the token with jwt.verify, loads the user and sets req.user, or responds 401. The controller runs Order.find({ user: req.user._id }).sort({ createdAt: -1 }) so a user can never see someone else's orders, then returns JSON. On the frontend I show a loader, then the list, or an error message." Mentioning that the filter uses req.user (not a userId from the query string) shows security awareness.`,
    },
    {
      title: '"Tell me about yourself": model answer for a MERN fresher',
      scenario: 'Usually the first question in both technical and HR rounds. Use Present -> Past -> Future in about 60-90 seconds.',
      steps: [
        'Present: who you are and your focus',
        'Past: education + 1-2 proof points (projects, internship, achievements)',
        'Future: why this role/company',
        'Do not repeat your full resume or personal details like family members',
      ],
      code: `"Hi, I am Rohan. I recently completed my B.Tech in Computer Engineering from Pune University
with 8.1 CGPA, and I am a full-stack developer focused on the MERN stack.

During college I built three full-stack projects. The main one is ShopKart, an e-commerce app
with JWT authentication, Razorpay payments and an admin dashboard, which is deployed on Vercel
and Render. I also did a 3-month internship at a local startup where I built REST APIs in
Express and fixed UI bugs in their React dashboard, and I practise DSA regularly on LeetCode,
around 250 problems so far.

I enjoy turning ideas into working products and learning things properly, like how indexing
made my APIs much faster. I am now looking for a developer role where I can work on real
products with an experienced team, and your company's work on [their product/clients] is
exactly the kind of environment where I can contribute and grow."`,
      result: 'A confident 75-second introduction that leads the interviewer towards your strongest project.',
      explanation: `Present-Past-Future keeps it structured. Each sentence is evidence (projects, internship, numbers), not adjectives. Ending with the company shows you researched it. Avoid: reading from the resume, hobbies that take half the time, "I am from a middle-class family..." unless asked, and memorised-sounding speed. For service companies, you can add willingness to learn any technology: "I am also comfortable learning Java or .NET if the project needs it."`,
    },
    {
      title: 'Rewriting weak resume bullets into strong ones',
      scenario: 'Your resume says "Made a MERN project with login and CRUD". Let us upgrade it with Action + What + How + Result.',
      steps: [
        'Start with a strong past-tense verb (Built, Designed, Implemented, Reduced, Deployed)',
        'Say what you built and the technology',
        'Add a measurable result or scale where honest',
        'Keep each bullet to 1-2 lines',
      ],
      code: `WEAK                                   ->  STRONG
"Made login and signup"                ->  "Implemented JWT authentication with bcrypt hashing, httpOnly
                                            refresh-token cookies and role-based access for 3 user roles."
"Did CRUD operations"                  ->  "Designed 20+ RESTful Express 5 endpoints with zod validation
                                            and a centralized error handler."
"Used MongoDB"                         ->  "Modelled 6 MongoDB collections with Mongoose; added compound
                                            indexes and cursor pagination, cutting list API time from
                                            1.2 s to 180 ms."
"Deployed project"                     ->  "Deployed React (Vercel) and Node API (Render) with GitHub
                                            Actions CI running 45 Jest/Supertest tests on every PR."
"Worked in a team of 4"                ->  "Led backend development in a 4-member team, reviewing PRs
                                            and maintaining API docs in Postman."`,
      result: 'Bullets that pass ATS keyword filters (JWT, REST, MongoDB, Jest, CI) and give the interviewer specific things to ask about.',
      explanation: `Numbers attract attention and show impact, but they must be true and explainable: if you write "1.2 s to 180 ms", be ready to say how you measured it (browser Network tab, Postman, or explain() in MongoDB). Every keyword on your resume is a potential question, so remove anything you cannot discuss for 2 minutes.`,
    },
    {
      title: 'STAR answer: "Tell me about a challenging bug you fixed"',
      scenario: 'Behavioural + technical question asked in almost every MERN interview. Use STAR with a real bug.',
      steps: [
        'Situation: where and when',
        'Task: what had to work',
        'Action: how you debugged step by step (the longest part)',
        'Result: what improved and what you learned',
      ],
      code: `S: "In my ShopKart project, after deploying, users were logged out every time they refreshed
    the page, although login worked locally."
T: "I had to find out why authentication broke only in production."
A: "I opened DevTools and saw the login response had a Set-Cookie header, but the browser was
    not storing the cookie. The frontend was on vercel.app and the API on onrender.com, so it
    was a cross-site cookie. I set the cookie with sameSite 'none' and secure true, enabled
    credentials: true in CORS with the exact frontend origin instead of '*', added
    withCredentials: true in Axios, and app.set('trust proxy', 1) because Render sits behind
    a proxy. I tested it in an incognito window and on mobile."
R: "Login persisted after refresh. I learned how SameSite, CORS credentials and proxies
    interact, and I now test auth on the deployed URL before calling a feature done."`,
      result: 'A specific, technical story that proves real debugging experience instead of a generic "I searched on Google and fixed it".',
      explanation: `Interviewers love deployment bugs because they cannot be copied from a tutorial. The Action part shows a method: observe (DevTools), form a hypothesis (cross-site cookie), fix several layers (cookie flags, CORS, Axios, proxy), verify. Other good stories: a useEffect infinite loop, a slow query fixed by an index, a CORS error, a race condition in stock updates.`,
    },
  ],
  interview: [
    { q: 'Tell me about yourself.', level: 'Easy', a: `Use Present -> Past -> Future in 60-90 seconds.\nModel: "I am Priya, a 2026 B.E. IT graduate and a MERN stack developer. I have built three full-stack projects; the main one is a job-portal app with React, Express and MongoDB that includes role-based dashboards for recruiters and candidates, resume upload to Cloudinary, and email notifications, deployed on Vercel and Render. I also completed a two-month internship where I wrote REST APIs and fixed React bugs. I enjoy solving problems end to end, from database design to UI. I am looking for a role where I can work on real products, learn from experienced engineers and grow into a strong full-stack developer, which is why this opportunity excites me."\nAvoid reciting your resume line by line or talking about family unless asked.` },
    { q: 'Explain your project in 2 minutes.', level: 'Easy', a: `Structure: (1) one-line summary and problem, (2) 3-4 key features, (3) tech stack and why, (4) architecture in one sentence, (5) your role, (6) one technical challenge and the solution, (7) result and next steps.\nModel opening: "My project is CampusEats, a food pre-ordering app for our college canteen, so students skip queues. Students order and pay online, the canteen sees live orders on a dashboard and marks them ready, and students get a real-time notification. I built it with React and Tailwind, Node/Express REST APIs, MongoDB Atlas, and Socket.IO for live order status..." Then the challenge (e.g. handling duplicate orders on double-click with an idempotency key) and result (used by 150+ students in a pilot week).` },
    { q: 'Why did you choose the MERN stack for your project?', level: 'Easy', a: `"MERN uses JavaScript across the whole stack, so I could share knowledge and even validation logic between frontend and backend and move fast as a single developer. React gives a component-based UI with a huge ecosystem; Node and Express are lightweight and great for JSON REST APIs and I/O-heavy work; MongoDB's flexible document model mapped naturally to my JSON data (products with variable attributes) and Atlas gave free hosting with backups. For a project with strict relations and complex transactions, like accounting, I would consider PostgreSQL instead."\nShowing you know the trade-off is the key.` },
    { q: 'Explain the architecture and folder structure of your project.', level: 'Medium', a: `"It is a client-server architecture with two folders. client/ is a Vite React app: pages (routes), components (reusable UI), hooks (useAuth, useDebounce), store or context for global state, and api/ with an Axios instance that adds the token and base URL. server/ is an Express app: routes define URLs, controllers contain request logic, models hold Mongoose schemas, middleware has auth, role check, validation and error handling, config has DB connection, utils has helpers. The client calls REST endpoints like /api/products; the server talks to MongoDB Atlas; images go to Cloudinary."\nIf asked, mention you could add a services layer to keep controllers thin.` },
    { q: 'How does authentication work in your project?', level: 'Medium', a: `Model answer (adapt to yours): "On signup I validate input and hash the password with bcrypt (salt rounds 10-12) before saving. On login I compare with bcrypt.compare, then sign a JWT with the user id and role using a secret from env, expiring in 15 minutes, plus a refresh token valid for 7 days stored in an httpOnly, secure, SameSite cookie. The frontend keeps the access token in memory and Axios interceptors attach it as Authorization: Bearer. On 401, the interceptor calls /api/auth/refresh to get a new access token. A protect middleware verifies the JWT and sets req.user; an authorize('admin') middleware checks roles. On the frontend, a ProtectedRoute component redirects unauthenticated users to /login, but real security is always enforced on the backend."` },
    { q: 'Where do you store the JWT on the client and why?', level: 'Medium', a: `Options:\n- localStorage: simple, survives refresh, but readable by any JavaScript, so an XSS bug can steal it.\n- httpOnly cookie: JavaScript cannot read it (protects against XSS theft), sent automatically; needs CSRF protection (SameSite=Lax/Strict, CSRF token) and CORS with credentials for cross-site setups.\n- Memory + refresh token in httpOnly cookie: best balance; access token is short-lived and lost on refresh, then silently renewed.\nHonest answer if you used localStorage: "I used localStorage for simplicity; I know the XSS risk, and in production I would move to httpOnly cookies with short-lived access tokens."` },
    { q: 'Explain your database schema. Why did you embed or reference?', level: 'Medium', a: `Example: "I have users, products, carts and orders. Order items embed a snapshot of product name, price and quantity because the price at purchase time must never change even if the product is edited later. Orders reference the user by ObjectId because users are independent and have many orders. Reviews are a separate collection referencing product and user because they can grow without limit. The shipping address is embedded in the order because it belongs only to that order. I added indexes on email (unique), products { category: 1, price: 1 } for filtering, and orders { user: 1, createdAt: -1 } for 'my orders'."\nRule: embed what is read together and bounded; reference what is shared, large or unbounded.` },
    { q: 'How did you handle errors and validation in your API?', level: 'Medium', a: `"Incoming data is validated with zod (or Joi/express-validator) in a middleware before reaching controllers, returning 400 with field messages. Mongoose schema validation is a second layer. Controllers are async, and in Express 5 rejected promises are passed to the error handler automatically (in Express 4 I used an asyncHandler wrapper). I have a custom AppError class with a status code, and one central error middleware that sends { success: false, message } with the right status: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 duplicate key, 500 unknown. Stack traces are hidden in production. On the frontend I show toast messages and form errors, and loading/empty states."` },
    { q: 'What was the most challenging part of your project and how did you solve it?', level: 'Medium', a: `Use STAR with a real technical problem. Model: "Situation: on the product list page, filtering became slow as I seeded 50,000 products. Task: bring the API response under 300 ms. Action: I used explain('executionStats') and saw a COLLSCAN examining all documents. I added a compound index { category: 1, price: 1 }, switched from skip/limit to cursor pagination, used .lean() and a projection to return only needed fields, and debounced the search input on the frontend. Result: the response went from about 1.2 s to 150 ms, and I learned to measure before optimising."` },
    { q: 'If your app suddenly had 10,000 concurrent users, what would you change?', level: 'Hard', a: `"First I would measure with monitoring to find the real bottleneck. Likely steps: (1) make sure all frequent queries use indexes and pagination; (2) cache hot read endpoints (product list, product details) in Redis with TTL and serve images via a CDN; (3) run the Node API in cluster mode/PM2 or multiple containers behind a load balancer, keeping servers stateless (JWT or Redis sessions); (4) move slow work like emails and invoice PDFs to a queue (BullMQ) with workers; (5) add rate limiting; (6) upgrade the Atlas tier and use read replicas for heavy reads. Sharding only if data or writes outgrow one replica set."` },
    { q: 'How did you deploy your project? What problems did you face?', level: 'Medium', a: `Model: "Frontend on Vercel (auto-deploy from main), API on Render, DB on MongoDB Atlas. Env variables (MONGO_URI, JWT_SECRET, CLIENT_URL, CLOUDINARY keys) are configured in the dashboards, never committed. Problems I faced: (1) CORS errors because the API allowed only localhost, fixed by reading allowed origins from env; (2) 404 on page refresh for React Router routes, fixed with a rewrite to index.html; (3) cookies not saved cross-site, fixed with sameSite 'none', secure, trust proxy and credentials; (4) Render free tier sleeping, so the first request is slow; I added a loading message and would use a paid tier in production."` },
    { q: 'How did you manage state in your React app? Why that choice?', level: 'Medium', a: `"Local UI state (form inputs, modal open) stays in useState inside components. Auth user and theme are in Context because they are needed everywhere and change rarely. For server data like products and orders I used TanStack Query (or Redux Toolkit with createAsyncThunk / RTK Query), which handles caching, loading/error states and refetching. I chose Redux Toolkit for the cart because many components update it and DevTools made debugging easy." Show you understand: not everything needs global state, and server state is different from client state.` },
    { q: 'What security measures did you implement?', level: 'Medium', a: `List what you really did: bcrypt password hashing; JWT with expiry and secret from env; authorization checks on the backend for every protected route (users can only access their own orders); input validation with zod and mongoose sanitisation against NoSQL injection ($ operators in input); Helmet for security headers; CORS restricted to my frontend domain; rate limiting on login and OTP routes; HTTPS through the hosting platform; no secrets in Git (.env in .gitignore); file uploads limited by type and size; React escapes output by default and I avoided dangerouslySetInnerHTML.` },
    { q: 'What would you improve in your project if you had more time?', level: 'Easy', a: `Shows self-awareness. Model: "I would (1) add automated tests: Jest/Supertest for APIs and React Testing Library for key components, with GitHub Actions CI; (2) move the JWT from localStorage to httpOnly cookies with refresh tokens; (3) add Redis caching for the product list; (4) improve accessibility and Lighthouse score; (5) migrate the frontend to TypeScript; (6) add proper logging and Sentry for error tracking." Pick items that are real gaps in your project.` },
    { q: 'Was this a team project? What exactly was your contribution?', level: 'Easy', a: `Be precise and honest. Model: "It was a 4-member college project. I owned the entire backend: designed the MongoDB schemas, built 18 Express APIs with JWT auth and role checks, integrated Razorpay with webhook verification, and deployed it on Render. I also built the cart and checkout pages in React. Teammates handled the admin dashboard UI and documentation. We used GitHub with feature branches and PR reviews, and met twice a week to plan tasks on a Trello board."\nInterviewers will ask questions about the part you claim, so claim only what you can explain in depth.` },
    { q: 'Why should we hire you?', level: 'Easy', a: `Connect your proof to their needs in 3 points. Model: "First, I already have hands-on full-stack experience: I have built and deployed MERN applications with authentication, payments and real users, so I can contribute to React and Node work quickly. Second, I learn fast and independently: I picked up Docker and GitHub Actions on my own for my last project. Third, I am reliable and communicate well; in my internship I delivered all my tasks on time and documented APIs for the team. I am eager to grow with your company over the long term."` },
    { q: 'What are your strengths?', level: 'Easy', a: `Pick 2-3 strengths relevant to development and prove each with an example. Model: "My first strength is problem solving: when my API was slow I diagnosed it with explain() and fixed it with an index, reducing response time by 85%. Second is consistency in learning: I have solved over 250 DSA problems and built three projects while studying. Third is ownership: in my team project I took responsibility for deployment and made sure it was live before the demo."` },
    { q: 'What is your biggest weakness?', level: 'Easy', a: `Choose a real but non-critical weakness and show what you are doing about it. Model: "I sometimes spend too much time trying to perfect a feature before asking for help. In my internship I spent a full day on a CORS issue that a senior solved in 20 minutes. Since then I timebox problems: if I am stuck for about an hour after researching, I ask with a clear summary of what I tried. It has made me much faster."\nAvoid fake weaknesses like "I am a perfectionist" or "I work too hard", and avoid core-skill weaknesses like "I am bad at JavaScript".` },
    { q: 'Where do you see yourself in 5 years?', level: 'Easy', a: `Show ambition aligned with the company, not plans to leave. Model: "In five years I see myself as a strong full-stack engineer who owns complete features end to end, has deep expertise in system design and performance, and mentors new joiners. I would like to grow within the company, possibly towards a tech lead role, and contribute to products used by many people."\nAvoid: "I want to do an MBA/go abroad" (signals leaving soon) or "I want your job".` },
    { q: 'Why do you want to join our company?', level: 'Easy', a: `Research first and mention specifics. Service company model: "Infosys offers a structured training program at Mysuru and exposure to large enterprise clients across domains, which will build strong fundamentals. I also know you work extensively with modern JavaScript and cloud technologies, which matches my MERN skills." Startup model: "I have used your app for booking turfs, and I like that the product solves a real problem. Your stack is React and Node, which I work with daily, and in a small team I can take ownership and learn faster." Never say "because it is a big company" or "for the salary".` },
    { q: 'Are you willing to relocate and work in shifts?', level: 'Easy', a: `If yes: "Yes, I am comfortable relocating to any location and working in shifts as the project requires. I see it as part of starting my career and gaining exposure to different clients."\nIf you have a genuine constraint, be honest and polite: "I am open to relocating; I would prefer Pune or Bangalore because of a family responsibility, but I am flexible if the project needs it." Do not say yes now and refuse at joining; companies track this.` },
    { q: 'Are you comfortable signing a service agreement (bond)?', level: 'Easy', a: `Read the terms first (duration, amount, conditions). If acceptable: "Yes, I have read about the service agreement. I am looking for a long-term start to my career, and the training and experience the company provides are valuable, so I am comfortable with it."\nIf you have a question, ask professionally: "Could you please share the details of the agreement duration and terms?" Avoid sounding as if you plan to leave early.` },
    { q: 'What are your salary expectations?', level: 'Medium', a: `Mass recruiters with fixed packages: "I am comfortable with the standard package offered for this role. My main focus is learning and growth."\nStartups/product companies: research ranges (AmbitionBox, Glassdoor, seniors, placement cell) and give a range with a reason: "Based on my research for MERN developer roles in Bangalore and my project and internship experience, I am expecting around 6 to 8 LPA. I am open to discussing based on the overall role and learning opportunities."\nNever quote a number much higher without justification, and do not discuss salary before they bring it up in early rounds.` },
    { q: 'Tell me about a time you worked in a team and faced a conflict.', level: 'Medium', a: `STAR model: "S: In our final-year MERN project, two of us disagreed on using Redux or Context for state. T: We had to decide quickly to meet the deadline. A: I suggested we list our actual needs: only auth and cart were global. I built a small prototype with both approaches, we compared code size and complexity, and we agreed to use Context for auth and Redux Toolkit only for the cart. I also proposed a short daily sync to avoid similar delays. R: We finished on time, the code stayed simple, and the teammate and I worked well together afterwards. I learned to resolve disagreements with data instead of opinions."` },
    { q: 'Describe a time you failed or missed a deadline.', level: 'Medium', a: `Own it, show the lesson. Model: "In my internship I estimated two days for a reporting API but took four, because I did not ask early about how the data was stored and had to rewrite my aggregation pipeline. I informed my mentor as soon as I knew I would be late and worked with him to prioritise the most important report. Since then I clarify requirements and data formats before coding and break tasks into smaller estimates, and I have delivered my later tasks on time."` },
    { q: 'How do you keep yourself updated with new technologies?', level: 'Easy', a: `Be specific: "I follow the official React and Node.js blogs and release notes; for example I read about React 19 Actions and useOptimistic and tried them in a small project. I follow MDN and web.dev for web fundamentals, watch conference talks, read newsletters like JavaScript Weekly, and practise by building small projects or adding features to existing ones. I also solve DSA problems a few times a week to stay sharp."` },
    { q: 'You have an offer from another company. Why should we not lose you?', level: 'Medium', a: `Be honest and professional, never bluff. Model: "Yes, I have an offer from X for a support-plus-development role. I am more interested in your company because this role is focused on full-stack development with React and Node, which matches my skills and goals, and I like your product. If I am selected here, I would prefer to join you. Could you share the expected timeline for the decision?"` },
    { q: 'Do you have any questions for us?', level: 'Easy', a: `Always say yes and ask 1-2 thoughtful questions:\n- "What would the first three months look like for a fresher in this team?"\n- "What tech stack and tools does the team use day to day?"\n- "How is performance reviewed and how do you support learning, like mentorship or certifications?"\n- "What are the biggest challenges the team is working on right now?"\nAvoid asking about leave, salary hikes or work from home as your only question in early rounds, and do not ask things easily found on their website.` },
  ],
  practice: [
    {
      task: 'Write your own 2-minute project pitch for your best MERN project using the 7-part structure (summary/problem, features, stack + why, architecture, role, challenge, result/next). Keep it under 300 words and record yourself saying it.',
      hint: 'Start with who uses the app and what problem it solves. Choose a challenge you can explain for 5 minutes if asked.',
      solution: `Template (fill the brackets):
1. "[Project name] is a [type of app] that helps [users] to [solve problem]."
2. "Users can [feature 1], [feature 2] and [feature 3]; admins can [feature 4]."
3. "I used React [19] with [Vite, Redux Toolkit/Context, Tailwind] on the frontend, Node.js with
   Express for REST APIs, and MongoDB Atlas with Mongoose, because [reason: JSON end to end,
   fast to build, flexible schema]."
4. "The React app calls [N] REST endpoints; Express follows routes -> middleware -> controllers
   -> models; [third-party: Cloudinary/Razorpay/Socket.IO] handles [X]."
5. "I [built it alone / owned the backend and X in a team of N]."
6. "The biggest challenge was [problem]. I [diagnosed with ...] and solved it by [solution]."
7. "It is deployed on [Vercel/Render/Atlas], [N users / result]. I learned [Y] and next I want
   to add [tests / caching / TypeScript]."

Checklist after recording: under 2:15 minutes? No "basically/like" every sentence?
Did you mention one number? Could a non-technical HR person understand sentence 1?`,
    },
    {
      task: 'Prepare a one-page "project fact sheet" for your main project: list collections with key fields and indexes, all API endpoints with method and auth requirement, env variables, and hosting. Write it as a JS object so you can keep it in your repo.',
      hint: 'Interviewers ask "how many APIs?", "what indexes?", "which routes are protected?". Having this sheet makes your answers precise.',
      solution: `const projectFacts = {
  name: 'ShopKart',
  live: 'https://shopkart-demo.vercel.app',
  repo: 'https://github.com/<you>/shopkart',
  collections: {
    users: 'name, email (unique index), passwordHash, role [user|admin], addresses[]',
    products: 'name, slug (unique), price, category, stock, images[], ratingAvg; index { category: 1, price: 1 }, text index on name',
    orders: 'user (ref, index with createdAt), items[{ product, name, price, qty }] (snapshot), total, status, paymentId',
    reviews: 'product (ref, index), user (ref), rating, comment; unique { product: 1, user: 1 }',
  },
  endpoints: [
    'POST /api/auth/register  public',
    'POST /api/auth/login     public (rate limited)',
    'POST /api/auth/refresh   refresh cookie',
    'GET  /api/products       public (filters, cursor pagination)',
    'GET  /api/products/:slug public',
    'POST /api/products       admin',
    'POST /api/orders         user',
    'GET  /api/orders/me      user',
    'POST /api/payments/webhook  Razorpay signature verified',
  ],
  env: ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL', 'CLOUDINARY_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  hosting: { client: 'Vercel', api: 'Render', db: 'MongoDB Atlas M0', images: 'Cloudinary' },
  challenge: 'Overselling fixed with conditional $inc update + transaction',
  next: ['Jest + Supertest tests in GitHub Actions', 'Redis cache for product list', 'TypeScript'],
};
console.log(projectFacts.endpoints.length + ' endpoints documented');`,
    },
    {
      task: 'Rewrite these 4 weak resume bullets into strong ones: (a) "Worked on frontend using React", (b) "Created APIs", (c) "Used Git", (d) "Made chat feature".',
      hint: 'Action verb + what + how/tech + result/scale. Only use numbers you can defend.',
      solution: `(a) "Built 12 responsive React 19 pages with reusable components, custom hooks and Tailwind CSS,
     achieving a 95+ Lighthouse accessibility score."
(b) "Developed 20+ RESTful APIs in Node.js and Express 5 with JWT authentication, zod validation
     and centralized error handling, documented in a Postman collection."
(c) "Managed source code with Git and GitHub using feature branches, pull-request reviews and
     GitHub Actions CI that runs lint and tests on every PR."
(d) "Implemented real-time one-to-one and group chat with Socket.IO and MongoDB, supporting
     typing indicators, read receipts and paginated message history."`,
    },
    {
      task: 'Write STAR answers (5-7 lines each) for: (1) "Tell me about a time you learned a new technology quickly", (2) "Tell me about a time you helped a teammate".',
      hint: 'Keep Situation and Task short; make Action the biggest part and use "I". End with a measurable result and a lesson.',
      solution: `(1) Learning quickly
S: Two weeks before our project demo, the guide asked us to add real-time order updates.
T: I had never used WebSockets and had to deliver it in a week.
A: I read the Socket.IO docs, built a tiny chat demo in one evening to understand rooms and
   events, then designed events (order:created, order:updated) for our app, added JWT checks in
   the socket handshake, and tested with two browsers.
R: The feature worked in the demo and became the highlight of our presentation. I learned that a
   small throwaway prototype is the fastest way to learn a new tool.

(2) Helping a teammate
S: In our team project, a teammate was stuck for two days because his React form kept
   re-rendering and calling the API in a loop.
T: The integration deadline was close and his page blocked everyone.
A: I paired with him on a call, we used React DevTools and console logs and found an object in
   the useEffect dependency array that was recreated every render. I explained why, we moved
   the object inside the effect, and I shared a short note on useEffect dependencies with the team.
R: The bug was fixed in an hour, we integrated on time, and the team stopped hitting the same issue.`,
    },
    {
      task: 'Prepare answers for 6 rapid-fire HR questions in 2-3 lines each: relocation, night shifts, bond, higher studies plans, expected joining date, and "any gap in education?" (assume you took 1 gap year).',
      hint: 'Be honest, positive, brief. For the gap year, say what you did productively.',
      solution: `Relocation: "Yes, I am open to relocating to any location the project requires."
Night shifts: "Yes, I understand client projects may need different time zones, and I am comfortable
  with shift work when required."
Bond: "Yes, I have read the service agreement terms and I am comfortable with them, as I am looking
  for a long-term start to my career here."
Higher studies: "Not in the near future. I want to build strong industry experience first; if I study
  later, it would be part-time and aligned with my work, like a cloud certification."
Joining date: "I can join immediately after my final semester results in June 2027, or earlier if
  the company needs, as my exams finish in May."
Gap year: "After 12th I took one year to prepare for engineering entrance exams. It taught me
  discipline and self-study, which helped me later when I learned MERN on my own and built three
  projects."`,
    },
  ],
  quiz: [
    {
      question: 'What is the best way to START a 2-minute project explanation?',
      options: ['List every technology and library you used', 'One line on what the app does and for whom (the problem it solves)', 'Explain your folder structure', 'Apologise that it is only a college project'],
      answer: 1,
      explanation: 'Leading with the problem and users gives context; the stack and architecture make sense after that.',
    },
    {
      question: 'In the STAR method, which part should usually take the most time?',
      options: ['Situation', 'Task', 'Result', 'Action'],
      answer: 3,
      explanation: 'Action shows what YOU did and how you think. Keep situation and task brief.',
    },
    {
      question: 'An interviewer asks about a technology on your resume that you only watched one video about. Best response?',
      options: ['Be honest about your level, explain what you know, and remove it from the resume later', 'Make up a project where you used it', 'Change the topic to something else', 'Say the interviewer is asking the wrong question'],
      answer: 0,
      explanation: 'Honesty about depth builds trust; bluffing is easy to detect with one follow-up question. Only list skills you can discuss.',
    },
    {
      question: 'Which resume bullet is strongest?',
      options: ['Worked on login page', 'Hardworking team player with good MERN knowledge', 'Implemented JWT auth with bcrypt and role-based access, securing 18 Express API endpoints', 'Did many things in backend'],
      answer: 2,
      explanation: 'It uses an action verb, specific technologies and a measurable scope, which helps both ATS and human readers.',
    },
    {
      question: 'Which is the BEST answer to "What is your biggest weakness?"',
      options: ['"I am a perfectionist and work too hard."', '"I do not have any weaknesses."', '"I am not good at JavaScript."', '"I used to wait too long before asking for help; now I timebox problems and ask after an hour with a summary of what I tried."'],
      answer: 3,
      explanation: 'A real, non-critical weakness plus the concrete steps you take to improve shows self-awareness and growth.',
    },
  ],
};
