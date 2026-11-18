export default {
  id: "day-20-ai-chat-assistants",
  title: "AI Chat Assistants: Claude, ChatGPT, Gemini, Microsoft Copilot - Features, When to Use Which, Projects / Custom GPTs / Gems",
  module: "Module 4: AI Tools for Productivity",
  day: 20,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Get to know the four major AI chat assistants - what each one is, its key features, where it fits in real jobs, and how to set up reusable assistants with Claude Projects, ChatGPT Custom GPTs and Gemini Gems.",
  objectives: [
    "Describe what Claude, ChatGPT, Gemini and Microsoft Copilot are and who makes them",
    "Compare their key features: file upload, web search, code/data analysis, image generation, integrations",
    "Choose the right assistant for a job scenario",
    "Create a reusable assistant using Claude Projects, a Custom GPT or a Gemini Gem step by step",
    "Use chat assistants safely with work data"
  ],
  theory: [
    {
      heading: "What is an AI chat assistant?",
      content: "An AI chat assistant is an app (website, mobile app or desktop app) where you type or speak to a large language model and it answers in conversation. Behind each assistant is a family of models (Day 10). Modern assistants do much more than chat: they read files (PDF, Excel, images), search the web, write and run code, create documents and charts, remember project context and connect to other apps like Google Drive, Gmail, Slack or Microsoft 365. Analogy: if the LLM is an engine, the chat assistant is the complete car - steering, dashboard, music system and boot space built around that engine.",
      points: [
        "Free tiers are available for all major assistants; paid plans give stronger models, higher limits and team features",
        "Enterprise/Team plans add admin controls and typically do not use your data for model training",
        "Features change frequently - always check the official help pages"
      ]
    },
    {
      heading: "Claude (by Anthropic) - claude.ai",
      content: "Claude is Anthropic's AI assistant, available at claude.ai, on mobile and desktop apps, and inside tools like Slack, Excel and Chrome (via integrations). It is known for strong writing, careful reasoning, long documents and coding. Model family: Opus (most capable), Sonnet (fast + capable), Haiku (fastest), and Fable (premium). Key features: file and image upload, Projects (a workspace with custom instructions and a knowledge base of files), Artifacts (interactive documents, code, apps and diagrams shown beside the chat), web search, research mode, extended thinking, connectors to apps like Google Drive and Gmail, and Claude Code for developers.",
      points: [
        "Where used: drafting reports and policies, analysing long contracts or PDFs, coding help, building small tools via Artifacts, research summaries",
        "Job example: a business analyst uploads a 60-page requirements PDF into a Project and asks for a list of user stories",
        "Projects = custom instructions + uploaded knowledge files + chat history in one place"
      ]
    },
    {
      heading: "ChatGPT (by OpenAI) - chatgpt.com",
      content: "ChatGPT is OpenAI's assistant powered by GPT models. It is the most widely known assistant. Key features: file uploads and data analysis (it can run Python on your Excel/CSV and draw charts), image generation, voice mode, web search, deep research, memory, Projects, and Custom GPTs - mini-assistants you configure with instructions, knowledge files and actions, which can be shared with others or published in the GPT Store.",
      points: [
        "Where used: brainstorming, content writing, analysing CSV/Excel uploads, creating images, voice conversations for language practice",
        "Job example: a marketing executive builds a Custom GPT that writes product descriptions in the brand's voice",
        "Custom GPT = name + instructions + knowledge files + capabilities (web, image, code)"
      ]
    },
    {
      heading: "Google Gemini - gemini.google.com",
      content: "Gemini is Google's AI assistant and model family. Its biggest strength is integration with Google products: Gmail, Docs, Sheets, Drive, Calendar, Maps and YouTube (through extensions/apps). Gemini also appears inside Google Workspace apps (side panel in Gmail, Docs, Sheets). Key features: very long context for big documents, image understanding, image generation, Deep Research, Canvas for editing documents and code, and Gems - custom assistants with saved instructions.",
      points: [
        "Where used: summarising Gmail threads, drafting in Google Docs, analysing data in Google Sheets, finding info across Drive",
        "Job example: a teacher creates a Gem called 'Quiz Maker' that turns any chapter into 10 MCQs",
        "Gem = name + instructions (+ files on supported plans)"
      ]
    },
    {
      heading: "Microsoft Copilot - copilot.microsoft.com and Microsoft 365 Copilot",
      content: "Microsoft Copilot is Microsoft's AI assistant. There are two main forms: (1) Copilot app/web for everyone - chat, web-grounded answers, image creation; (2) Microsoft 365 Copilot for organisations - built into Word, Excel, PowerPoint, Outlook and Teams, and able to use your work data (emails, files, meetings) with company permissions. Microsoft 365 Copilot uses models from OpenAI and, for some features, Anthropic's Claude. Copilot Studio lets companies build custom agents.",
      points: [
        "Where used: summarising Teams meetings, drafting Outlook replies, creating PowerPoint from a Word document, analysing Excel tables",
        "Job example: a sales manager asks Copilot in Teams 'What did the client agree to in yesterday's call?'",
        "Best choice when the company runs on Microsoft 365 and needs answers grounded in internal files with existing security"
      ]
    },
    {
      heading: "When to use which assistant",
      content: "All four are capable general assistants; the best choice depends on where your work lives and what you need. Many professionals use two: one main assistant plus the one built into their office suite. Company policy matters most - use the tool your organisation approves for work data.",
      points: [
        "Long documents, careful writing, coding, building small interactive tools -> Claude",
        "Broad all-rounder, image generation, voice, large ecosystem of Custom GPTs -> ChatGPT",
        "Work lives in Gmail/Docs/Sheets/Drive -> Gemini",
        "Work lives in Outlook/Teams/Word/Excel with company data -> Microsoft 365 Copilot",
        "Need answers with web citations -> any assistant's web search, or Perplexity (Day 22)",
        "Tip: try the same important prompt in two assistants and compare"
      ]
    },
    {
      heading: "Reusable assistants: Projects, Custom GPTs and Gems",
      content: "Typing the same instructions every day wastes time. All major assistants let you save instructions (a system prompt, Day 13) and often reference files, so every new chat starts with the right context. This is the no-code way to build your own specialised assistant.",
      points: [
        "Claude Projects: claude.ai -> Projects -> Create project -> add Project instructions + upload files to Project knowledge -> chats inside the project use both",
        "ChatGPT Custom GPTs: chatgpt.com -> Explore GPTs / GPTs -> Create -> Configure tab: name, description, instructions, conversation starters, knowledge files, capabilities -> Save (only me / anyone with link / GPT Store)",
        "Gemini Gems: gemini.google.com -> Gems / Explore Gems -> New Gem -> name + instructions (+ files where supported) -> Save",
        "Microsoft: Copilot agents / Copilot Studio for organisation-wide custom agents"
      ],
      tip: "Write the instructions with the 5 blocks from Day 13 (role, context, task, format, constraints) and test with 5 realistic requests before sharing it with your team."
    }
  ],
  examples: [
    {
      title: "Step by step: Build a 'Power BI Interview Coach' Claude Project",
      scenario: "Karan is preparing for Power BI developer interviews. Instead of explaining his background in every chat, he creates a Claude Project with instructions and his resume, so every chat in the project is personalised.",
      steps: [
        "Go to claude.ai and sign in (free tier works; Projects availability can depend on plan)",
        "Click 'Projects' in the left sidebar, then 'Create project'",
        "Name: 'Power BI Interview Coach'; description: 'Mock interviews and feedback'",
        "Click 'Set project instructions' and paste the instructions from the code box",
        "Under project knowledge click '+' / 'Add content' and upload your resume PDF (remove phone number and address first)",
        "Start a new chat inside the project and type: 'Start a mock interview'",
        "Answer questions; at the end type 'Give me my scorecard'"
      ],
      code: `PROJECT INSTRUCTIONS:
You are a senior Power BI hiring manager and interview coach.
Context: The candidate's resume is in the project knowledge. Target role: Power BI
Developer (0-2 years experience) at IT services and product companies in India.
Task: Conduct mock interviews. Ask ONE question at a time from: DAX, data modelling,
Power Query, visuals, performance, scenario questions based on the resume projects.
After each answer: score /10, what was good, what was missing, a model answer (max 80 words).
Format: short paragraphs, bold the score.
Constraints: Increase difficulty gradually. Never invent experience the candidate doesn't
have. When asked for a scorecard, give a table of topics, average score, and top 3 study tasks.`,
      prompt: {
        system: "You are a senior Power BI hiring manager and interview coach. Target role: Power BI Developer (0-2 years). The candidate's resume says: B.Com 2024; Power BI internship at RetailMart (sales dashboard for 40 stores, star schema, DAX time intelligence); skills: Power BI, DAX, Power Query, SQL, Excel. Ask ONE question at a time. After each answer give a bold score /10, what was good, what was missing and a model answer in max 80 words.",
        user: "Start a mock interview."
      },
      result: `Great, let's begin! I'll start with your own project and go deeper from there.

Question 1 (Data modelling - based on your resume):
In your RetailMart internship you built a sales dashboard for 40 stores using a star schema. Which tables were your fact table and dimension tables, and why did you choose a star schema instead of keeping everything in one flat table?

Take your time - answer as you would in a real interview.`,
      explanation: "The Project stores the role, rules and resume once, so every chat starts personalised - the first question is about HIS project. This same setup works for any repeated job: a 'Policy Q&A' project with HR PDFs, a 'Client X' project with requirement documents, or a 'Thesis helper' project with research papers."
    },
    {
      title: "Step by step: Build a Custom GPT for product descriptions (ChatGPT)",
      scenario: "An e-commerce startup's catalogue team writes 50 product descriptions a day. They create a Custom GPT with the brand style guide so every team member gets consistent output.",
      steps: [
        "Go to chatgpt.com and sign in (creating GPTs requires a plan that supports it; check current plans)",
        "Click 'GPTs' (or 'Explore GPTs') in the sidebar, then '+ Create'",
        "Switch to the 'Configure' tab",
        "Fill Name: 'CraftKart Product Writer', Description: 'Writes product listings in CraftKart style'",
        "Paste the Instructions from the code box",
        "Add Conversation starters: 'Write a listing for:' and 'Rewrite this listing:'",
        "Under Knowledge, upload brand_style_guide.pdf; under Capabilities, turn OFF image generation if not needed",
        "Click 'Create', choose 'Only me' or 'Anyone with the link' (for the team), and test with 3 products"
      ],
      code: `INSTRUCTIONS:
You are the product copywriter for CraftKart, an online store for handmade Indian home decor.
Follow the attached brand style guide (warm, honest, simple English, no exaggeration).
For every product the user gives, output:
1. Title (max 70 characters, include material + product type)
2. 3 bullet highlights (max 15 words each)
3. Description (60-80 words) mentioning the artisan region if provided
4. 5 SEO keywords, comma separated
Rules: Never invent features, dimensions or certifications. If key details (material,
size, care instructions) are missing, ask for them before writing.`,
      prompt: {
        system: "You are the product copywriter for CraftKart, an online store for handmade Indian home decor. Warm, honest, simple English, no exaggeration. Output: 1. Title (max 70 chars, include material + product type) 2. 3 bullet highlights (max 15 words each) 3. Description (60-80 words) mentioning the artisan region if provided 4. 5 SEO keywords. Never invent features. If material, size or care details are missing, ask for them first.",
        user: "Write a listing for: Blue pottery coffee mug, Jaipur, ceramic, 300 ml, hand-painted floral design, microwave safe, hand wash recommended."
      },
      result: `1. Title: Jaipur Blue Pottery Ceramic Coffee Mug - Hand-Painted Floral, 300 ml

2. Highlights
- Hand-painted floral design by Jaipur blue pottery artisans
- 300 ml capacity, ideal for coffee, tea or hot chocolate
- Microwave safe; hand wash recommended to protect the colours

3. Description
Start your mornings with a piece of Jaipur's craft heritage. This 300 ml ceramic mug is hand-painted with a classic floral pattern in the famous blue pottery style, so every mug is slightly unique. It is microwave safe for quick reheating. To keep the colours bright for years, we recommend gentle hand washing. A thoughtful gift for coffee lovers and anyone who enjoys handmade decor.

4. Keywords: blue pottery mug, Jaipur ceramic mug, hand-painted coffee mug, handmade mug India, floral ceramic cup`,
      explanation: "A Custom GPT turns a good prompt into a shared team tool. The 'ask if details are missing' rule prevents invented product claims - important for consumer protection. Gemini Gems and Claude Projects can be set up in the same way."
    },
    {
      title: "Choosing the right assistant: one task, four job scenarios",
      scenario: "Four employees need to summarise information. The best assistant differs because their data lives in different places. We use a prompt to make the decision explicit.",
      steps: [
        "Open any assistant (claude.ai, ChatGPT or Gemini)",
        "Paste the prompt below describing the four scenarios",
        "Compare its recommendations with the 'When to use which' section of today's theory",
        "Check your own company's approved tools before acting on any recommendation"
      ],
      code: `Recommend the most suitable AI assistant for each scenario (Claude, ChatGPT, Gemini,
Microsoft 365 Copilot). Give a one-line reason and the exact feature to use.
Format: table Scenario | Assistant | Feature | Reason.

1. Riya (HR, company uses Microsoft 365) wants a summary of yesterday's Teams meeting with action items.
2. Arjun (freelancer, uses Gmail and Google Drive) wants to find all client invoices mentioned in emails last month.
3. Meera (legal analyst) needs a careful clause-by-clause comparison of two 80-page contracts.
4. Sam (social media manager) needs 3 caption ideas and a matching image for a Diwali post.`,
      prompt: {
        system: "You are an AI tools consultant who recommends assistants based on where users' data lives and what features they need. Mention that company policy and approved tools come first.",
        user: "Recommend the most suitable AI assistant for each scenario (Claude, ChatGPT, Gemini, Microsoft 365 Copilot). Give a one-line reason and the exact feature to use.\nFormat: table Scenario | Assistant | Feature | Reason.\n\n1. Riya (HR, company uses Microsoft 365) wants a summary of yesterday's Teams meeting with action items.\n2. Arjun (freelancer, uses Gmail and Google Drive) wants to find all client invoices mentioned in emails last month.\n3. Meera (legal analyst) needs a careful clause-by-clause comparison of two 80-page contracts.\n4. Sam (social media manager) needs 3 caption ideas and a matching image for a Diwali post."
      },
      result: `| Scenario | Assistant | Feature | Reason |
|----------|-----------|---------|--------|
| 1. Riya - Teams meeting summary | Microsoft 365 Copilot | Copilot in Teams (recap / meeting summary) | Works directly on the meeting transcript inside the company's Microsoft 365 security boundary |
| 2. Arjun - invoices in Gmail | Gemini | Gemini with Gmail/Drive apps (extensions) | Can search his Gmail and Drive directly without manual copying |
| 3. Meera - contract comparison | Claude | Upload both PDFs (ideally in a Project) | Handles long documents well and gives careful, structured comparisons |
| 4. Sam - Diwali caption + image | ChatGPT | Chat + built-in image generation | Captions and an image in the same conversation |

Note: For company data, first confirm which tools your organisation has approved. Meera should also have a lawyer verify the comparison before relying on it.`,
      explanation: "The 'right' assistant is mostly about where the data lives and which feature is needed. In practice, overlaps are large - Claude also has Google Drive connectors and ChatGPT also handles long PDFs - so these are reasonable defaults, not strict rules."
    },
    {
      title: "Step by step: Create a Gemini Gem 'Chapter to Quiz' for teachers",
      scenario: "A school teacher wants to turn any textbook chapter into a 10-question quiz with answers. She creates a Gem once and reuses it for every chapter.",
      steps: [
        "Go to gemini.google.com and sign in with a Google account",
        "Open 'Gems' (or 'Explore Gems') in the left menu and click 'New Gem'",
        "Name: 'Chapter to Quiz'",
        "Paste the instructions from the code box",
        "Click 'Save'",
        "Open the Gem, paste a chapter (or upload a PDF where supported) and type 'Make the quiz'",
        "Check every answer against the textbook before giving it to students"
      ],
      code: `GEM INSTRUCTIONS:
You are an experienced CBSE school teacher and question-paper setter.
When I give you a chapter, create:
- 6 MCQs (4 options, 1 correct) and 4 short-answer questions
- Mix of difficulty: 4 easy, 4 medium, 2 hard
- An answer key at the END, with a one-line explanation for each answer
Rules: Use only the content of the chapter I provide. Simple English suitable for the
class level I mention. Do not repeat the same concept in two questions.`,
      prompt: {
        system: "You are an experienced CBSE school teacher and question-paper setter. Create 6 MCQs (4 options) and 4 short-answer questions from the provided chapter only, with an answer key at the end. Mix difficulty: 4 easy, 4 medium, 2 hard.",
        user: "Class 8 Science. Chapter excerpt: 'Friction is a force that opposes the relative motion between two surfaces in contact. It depends on the nature of surfaces and how hard they are pressed together. Friction produces heat. Lubricants like oil and grease reduce friction. Ball bearings reduce friction by converting sliding into rolling. Rolling friction is smaller than sliding friction.' Make the quiz."
      },
      result: `MCQs
1. Friction acts in which direction?
   a) Same as motion  b) Opposite to relative motion  c) Upward  d) Downward
2. Which of these reduces friction?
   a) Sand  b) Rough surface  c) Grease  d) Pressing harder
3. Friction always produces:
   a) Light  b) Sound only  c) Heat  d) Electricity
4. Ball bearings reduce friction by:
   a) Adding weight  b) Converting sliding into rolling  c) Increasing contact  d) Heating surfaces
5. Which is smaller?
   a) Sliding friction  b) Rolling friction  c) Both equal  d) Depends on colour
6. Friction depends on:
   a) Nature of surfaces and how hard they are pressed  b) Colour of the object  c) Time of day  d) Speed of light

Short answer
7. Define friction.
8. Name two lubricants.
9. Why do machines get hot after running for a long time?
10. Why are wheels and ball bearings used in machines? Explain using the idea of rolling friction.

Answer key
1-b (it opposes relative motion), 2-c (lubricants reduce friction), 3-c, 4-b, 5-b, 6-a
7. A force that opposes relative motion between surfaces in contact. 8. Oil, grease.
9. Friction between moving parts produces heat. 10. Rolling friction is smaller than sliding, so less force is needed and less wear occurs.`,
      explanation: "The Gem stores the question-setting rules once. 'Use only the content of the chapter' keeps questions within the syllabus. Teachers must still review answers - AI-generated quizzes can contain ambiguous options."
    }
  ],
  tools: [
    { name: "Claude", use: "Writing, long documents, coding, Artifacts; Projects store instructions + knowledge files", url: "https://claude.ai" },
    { name: "ChatGPT", use: "General assistant with data analysis, image generation, voice; Custom GPTs for reusable assistants", url: "https://chatgpt.com" },
    { name: "Google Gemini", use: "Assistant integrated with Gmail, Docs, Sheets, Drive; Gems for reusable assistants", url: "https://gemini.google.com" },
    { name: "Microsoft Copilot", use: "Copilot app for everyone; Microsoft 365 Copilot inside Word, Excel, PowerPoint, Outlook and Teams", url: "https://copilot.microsoft.com" },
    { name: "AI Tools Directory (in-app)", use: "Quick reference of what each AI tool is and where to use it", url: "/tools/ai-tools" }
  ],
  interview: [
    { q: "What is the difference between an LLM and an AI chat assistant?", a: "An LLM is the underlying model that generates text. A chat assistant is the product built around one or more models, adding a user interface, memory, file handling, web search, code execution, integrations and safety systems.", level: "Easy" },
    { q: "Name four major AI chat assistants and their makers.", a: "Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Microsoft Copilot (Microsoft).", level: "Easy" },
    { q: "What is a Claude Project?", a: "A workspace in claude.ai with its own custom instructions and a knowledge base of uploaded files; all chats in the project use that context, which makes it ideal for repeated work on the same topic or client.", level: "Easy" },
    { q: "What is a Custom GPT?", a: "A configurable version of ChatGPT with a name, instructions, knowledge files, conversation starters and selected capabilities (web, image, code, actions). It can be private, shared via link or published in the GPT Store.", level: "Easy" },
    { q: "What is a Gemini Gem?", a: "A custom assistant in Google Gemini with saved instructions (and files on supported plans) for a specific task, like a quiz maker or writing coach.", level: "Easy" },
    { q: "How is Microsoft 365 Copilot different from the free Copilot app?", a: "Microsoft 365 Copilot is a business add-on integrated into Word, Excel, PowerPoint, Outlook and Teams and can ground answers in the organisation's emails, files and meetings within existing permissions. The free Copilot app is a general web-grounded chat assistant.", level: "Medium" },
    { q: "How would you choose an AI assistant for a company?", a: "Consider where data lives (Microsoft 365 vs Google Workspace), data privacy and admin controls, required features (long documents, coding, image generation, integrations), quality on your own test tasks, cost per user, and compliance requirements.", level: "Medium" },
    { q: "Why do enterprise plans matter for work data?", a: "They typically offer admin controls, single sign-on, audit logs and commitments not to train on customer data, which makes them suitable for confidential work - unlike personal free accounts.", level: "Medium" },
    { q: "What should you test before sharing a Custom GPT/Gem/Project with your team?", a: "Run 5-10 realistic requests including edge cases and missing information; check accuracy, format, tone, and that it follows rules (no invented facts); check knowledge files contain no confidential data that shouldn't be shared.", level: "Medium" },
    { q: "Why might a professional use two different AI assistants?", a: "Different strengths and integrations: e.g. Microsoft 365 Copilot for internal emails and meetings plus Claude for long-document analysis and writing. Comparing answers also helps catch errors.", level: "Hard" }
  ],
  practice: [
    { task: "Create a free account on two assistants and ask both: 'Explain the difference between a PivotTable and Power Pivot with one example.' Compare clarity, accuracy and format.", hint: "Make a small table with 3 criteria and score both.", solution: "Typical observation: both explain correctly; differences appear in structure, examples and length. Score them on accuracy, clarity, usefulness (1-5)." },
    { task: "Build a Claude Project called 'My Study Buddy' with instructions to explain topics simply and quiz you. Upload one of your notes PDFs.", hint: "Use the 5 blocks in the instructions; include 'quiz me after each explanation'.", solution: "Instructions: 'You are a patient tutor for a B.Tech student. Use my uploaded notes first. Explain in simple English with an example, then ask 2 quiz questions. If the notes don't cover something, say so before using general knowledge.'" },
    { task: "Design (on paper or in the tool) a Custom GPT or Gem for your future job role. Write its name, description, instructions and 3 conversation starters.", hint: "Think about a repeated task in that role.", solution: "Example for a data analyst: 'SQL Helper' - instructions include the company's table schema, MySQL 8, ask for clarification when columns are ambiguous; starters: 'Write a query for...', 'Explain this query', 'Optimise this query'." },
    { task: "List 3 tasks from your daily life or internship and choose the best assistant for each with a reason.", hint: "Think about where the data lives.", solution: "Example: summarising Gmail threads -> Gemini; analysing a 50-page PDF -> Claude; generating a poster image -> ChatGPT or another image tool." },
    { task: "Open the AI Tools Directory (/tools/ai-tools) and write one line about each chat assistant in your own words.", hint: "Focus on what it is and one job scenario.", solution: "Example: 'Microsoft 365 Copilot - AI inside Office apps; a sales manager uses it to summarise Teams calls and draft Outlook follow-ups.'" }
  ],
  quiz: [
    { question: "Which company makes Claude?", options: ["OpenAI", "Google", "Anthropic", "Microsoft"], answer: 2, explanation: "Claude is built by Anthropic." },
    { question: "A reusable ChatGPT assistant with instructions and knowledge files is called a:", options: ["Custom GPT", "Gem", "Project artifact", "Copilot Studio page"], answer: 0, explanation: "ChatGPT's custom assistants are Custom GPTs; Gemini's are Gems." },
    { question: "Your company runs on Outlook and Teams and wants AI answers grounded in internal meetings and emails. Best fit?", options: ["Midjourney", "Microsoft 365 Copilot", "Gemini Gems only", "A spreadsheet"], answer: 1, explanation: "Microsoft 365 Copilot works inside Microsoft 365 with company permissions." },
    { question: "What does a Claude Project combine?", options: ["Only images", "A video editor and a browser", "Payment details and passwords", "Custom instructions, knowledge files and related chats"], answer: 3, explanation: "Projects keep instructions, files and chats together." },
    { question: "What should you do before using an AI assistant with confidential work data?", options: ["Nothing, all tools are the same", "Check that the tool is approved by your organisation's policy", "Post the data publicly first", "Use the most popular free account"], answer: 1, explanation: "Company-approved tools and plans protect confidential data." }
  ]
};
