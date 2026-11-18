// AI Tools Directory data – what each tool is, where and how to use it.
// Prices change often, so pricing is kept general (no exact amounts).
export default [
  // ───────────────────────── Chat Assistants ─────────────────────────
  {
    id: "claude",
    name: "Claude",
    maker: "Anthropic",
    category: "Chat Assistants",
    url: "https://claude.ai",
    pricing: "Free tier + paid",
    whatItIs: "Claude is Anthropic's AI assistant for writing, analysis, coding and research. It handles long documents and files well and is known for careful, well-structured answers. Paid plans unlock the most capable models (Opus, Sonnet, Haiku families), higher limits and features like Projects.",
    whereToUse: [
      "Summarising long PDFs, reports or lecture notes",
      "Drafting and polishing emails, cover letters and assignments",
      "Explaining code, debugging errors and writing small programs",
      "Analysing CSV/Excel data and creating charts with its analysis tools",
      "Preparing for interviews with mock questions and feedback",
      "Building interactive artifacts such as quizzes, flashcards or small web apps"
    ],
    howToUse: [
      "Go to claude.ai and sign up with email or a Google account.",
      "Start a new chat and describe your task clearly: who you are, what you need and the output format.",
      "Attach files (PDF, DOCX, CSV, images) with the paperclip icon if your question is about a document.",
      "Read the answer, then ask follow-up questions to refine it (\"make it shorter\", \"add an example\").",
      "Use Projects to keep course notes and instructions together for repeated work.",
      "Copy useful output into your own document and verify important facts before submitting."
    ],
    examplePrompt: "You are a patient tutor. I am a beginner learning SQL. Explain GROUP BY vs HAVING with a small 'orders' table example, show the query results as tables, and end with 3 practice questions (answers hidden at the bottom).",
    tips: [
      "Give context and the desired format (table, bullets, word limit) for much better answers.",
      "Paste the exact error message and code when asking for debugging help.",
      "Ask Claude to list its assumptions or say when it is unsure."
    ],
    limitations: [
      "Can still make mistakes (hallucinations) – verify facts, numbers and citations.",
      "Free plan has usage limits that reset over time.",
      "Do not paste confidential or personal data you are not allowed to share."
    ],
    skills: ["Prompt Engineering", "LLMs", "AI for Productivity", "Responsible AI"]
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    maker: "OpenAI",
    category: "Chat Assistants",
    url: "https://chatgpt.com",
    pricing: "Free tier + paid",
    whatItIs: "ChatGPT is OpenAI's general-purpose AI chatbot powered by its GPT models. It can chat, write, analyse files, browse the web, generate images and talk by voice. It is one of the most widely used AI tools in the world.",
    whereToUse: [
      "Brainstorming project ideas and outlines",
      "Getting step-by-step explanations of hard topics",
      "Analysing spreadsheets and making charts from uploaded data",
      "Practising spoken English or interviews in voice mode",
      "Creating images for presentations",
      "Writing first drafts of reports and resumes"
    ],
    howToUse: [
      "Open chatgpt.com and create a free account.",
      "Type your question or task in the message box.",
      "Use the + button to upload files or images when needed.",
      "Turn on search for questions about recent events.",
      "Refine the answer with follow-ups like \"explain like I'm a beginner\".",
      "Save useful chats or organise them into Projects."
    ],
    examplePrompt: "Act as a career coach. Here is my resume summary: [paste]. Rewrite it for a Junior Data Analyst role, keep it under 60 words and highlight Excel, SQL and Power BI.",
    tips: [
      "Use Custom Instructions to tell it your level and preferred style once.",
      "Ask for sources when using web search and open them to check.",
      "Break big tasks into smaller steps."
    ],
    limitations: [
      "Answers can sound confident but be wrong – always verify.",
      "Advanced models and higher limits require a paid plan.",
      "Check your school's policy before using it for graded work."
    ],
    skills: ["Prompt Engineering", "LLMs", "Multimodal AI"]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    maker: "Google",
    category: "Chat Assistants",
    url: "https://gemini.google.com",
    pricing: "Free tier + paid",
    whatItIs: "Gemini is Google's AI assistant and family of multimodal models. It works with text, images, audio and video and connects with Google apps like Gmail, Docs, Drive and YouTube. It is also built into Google Workspace for paid users.",
    whereToUse: [
      "Researching topics with Google Search grounding",
      "Summarising YouTube videos or long Google Docs",
      "Drafting emails in Gmail and documents in Docs",
      "Planning study schedules and trips",
      "Understanding photos of diagrams or handwritten notes",
      "Running Deep Research reports on a topic"
    ],
    howToUse: [
      "Visit gemini.google.com and sign in with your Google account.",
      "Type a question or upload an image/file.",
      "Enable extensions/apps (Gmail, Drive, YouTube) if you want it to use your Google data.",
      "Use the 'Double-check' or source links to verify answers.",
      "Try Deep Research for a multi-source report on a topic.",
      "Export answers to Google Docs or Gmail with one click."
    ],
    examplePrompt: "Summarise this YouTube lecture on linear regression in 8 bullet points and create 5 quiz questions from it: [YouTube link]",
    tips: [
      "Great choice if you already live in Google Workspace.",
      "Use Gems to save a custom assistant for a repeated task.",
      "Upload a photo of a textbook diagram and ask for an explanation."
    ],
    limitations: [
      "Features vary by country, age and account type.",
      "Connected-app access means you should review privacy settings.",
      "Can hallucinate like any LLM."
    ],
    skills: ["LLMs", "Multimodal AI", "AI for Productivity"]
  },
  {
    id: "microsoft-copilot",
    name: "Microsoft Copilot",
    maker: "Microsoft",
    category: "Chat Assistants",
    url: "https://copilot.microsoft.com",
    pricing: "Free tier + paid",
    whatItIs: "Microsoft Copilot is Microsoft's AI assistant available on the web, in Windows, in the Edge browser and inside Microsoft 365 apps. The free version chats, searches the web and creates images; Microsoft 365 Copilot works inside Word, Excel, PowerPoint, Outlook and Teams.",
    whereToUse: [
      "Asking quick questions with web citations",
      "Summarising web pages and PDFs in Edge",
      "Drafting Word documents and PowerPoint slides (Microsoft 365 Copilot)",
      "Summarising Teams meetings and Outlook threads at work",
      "Creating simple images for posters"
    ],
    howToUse: [
      "Open copilot.microsoft.com or the Copilot app in Windows.",
      "Sign in with a Microsoft account for longer chats and history.",
      "Type your question; check the cited sources under the answer.",
      "In Edge, open the Copilot sidebar to ask about the current page or PDF.",
      "If your school/company has Microsoft 365 Copilot, click the Copilot button inside Word, Excel or PowerPoint.",
      "Review and edit everything it drafts before sharing."
    ],
    examplePrompt: "Summarise this web page about GST rules in simple language for a commerce student, then list 3 points I should remember for exams.",
    tips: [
      "Workplace Copilot respects your organisation's data permissions – useful for internal documents.",
      "Use the Edge sidebar to chat about the page you are reading.",
      "Ask for a table when comparing options."
    ],
    limitations: [
      "Copilot inside Office apps needs a qualifying Microsoft 365 license.",
      "Answers based on web search may still contain errors.",
      "Feature names and plans change frequently."
    ],
    skills: ["AI for Productivity", "Microsoft 365", "Prompt Engineering"]
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    maker: "Meta",
    category: "Chat Assistants",
    url: "https://www.meta.ai",
    pricing: "Free",
    whatItIs: "Meta AI is Meta's free assistant built on its Llama models. It is available on the web and inside WhatsApp, Instagram, Messenger and Facebook. It can answer questions, write text and create images.",
    whereToUse: [
      "Quick answers inside WhatsApp without switching apps",
      "Generating fun images for social posts",
      "Brainstorming captions and messages",
      "Translating or simplifying short texts",
      "Getting quick study explanations on mobile"
    ],
    howToUse: [
      "Open meta.ai in a browser or tap the Meta AI icon in WhatsApp/Instagram.",
      "Type your question or request in the chat.",
      "Type 'imagine' followed by a description to create an image (where supported).",
      "Ask follow-up questions to refine the answer.",
      "Copy or share the result."
    ],
    examplePrompt: "Give me 5 Instagram caption ideas for our college tech fest poster, fun but professional, with 3 hashtags each.",
    tips: [
      "Handy for quick tasks on your phone.",
      "Mention @Meta AI in group chats where the feature is available.",
      "Use another tool for long documents or deep research."
    ],
    limitations: [
      "Availability and features differ by country.",
      "Not designed for long file analysis.",
      "Be careful sharing personal information in chats."
    ],
    skills: ["LLMs", "Open-source Models", "Image Generation"]
  },

  // ───────────────────────── Writing & Communication ─────────────────────────
  {
    id: "grammarly",
    name: "Grammarly",
    maker: "Grammarly (Superhuman)",
    category: "Writing & Communication",
    url: "https://www.grammarly.com",
    pricing: "Free tier + paid",
    whatItIs: "Grammarly is a writing assistant that checks grammar, spelling, punctuation, clarity and tone as you type. It works in browsers, Word, Google Docs and email, and includes generative AI features to rewrite or draft text.",
    whereToUse: [
      "Proofreading assignments and reports",
      "Writing professional emails and LinkedIn messages",
      "Adjusting tone (formal, friendly, confident)",
      "Checking cover letters and resumes",
      "Improving clarity of project documentation"
    ],
    howToUse: [
      "Create an account at grammarly.com.",
      "Install the browser extension or desktop app.",
      "Start typing in Gmail, Google Docs, Word or LinkedIn – suggestions appear underlined.",
      "Click an underline to see the suggestion and accept or dismiss it.",
      "Set your goals (audience, formality) for better suggestions.",
      "Use the AI prompt box to rewrite a paragraph (e.g. 'make it more concise')."
    ],
    examplePrompt: "Select your email draft and ask: \"Rewrite this to sound polite and confident, under 120 words.\"",
    tips: [
      "Do not accept every suggestion blindly – keep your own voice.",
      "Use the tone detector before sending important emails.",
      "Turn it off in fields where you type passwords or code."
    ],
    limitations: [
      "Advanced rewrites and full-sentence suggestions need a paid plan.",
      "May misunderstand technical terms or Indian English usage.",
      "Text is processed on their servers – avoid confidential content."
    ],
    skills: ["Business Communication", "AI for Productivity"]
  },
  {
    id: "quillbot",
    name: "QuillBot",
    maker: "QuillBot (Learneo)",
    category: "Writing & Communication",
    url: "https://quillbot.com",
    pricing: "Free tier + paid",
    whatItIs: "QuillBot is an AI writing toolkit known for paraphrasing. It also includes a grammar checker, summariser, citation generator and translator, making it popular with students.",
    whereToUse: [
      "Rephrasing your own sentences for clarity",
      "Summarising long articles into key points",
      "Generating citations in APA/MLA format",
      "Checking grammar in assignments",
      "Translating short texts"
    ],
    howToUse: [
      "Open quillbot.com (no account needed for basic use).",
      "Choose a tool: Paraphraser, Grammar Checker, Summarizer or Citation Generator.",
      "Paste your text into the left box.",
      "Pick a mode (Standard, Fluency, Formal, etc.) and adjust the synonym slider.",
      "Click the action button and compare the output with your original.",
      "Copy the version you like and review it carefully."
    ],
    examplePrompt: "Paste a paragraph from your own project report and use Paraphraser in 'Formal' mode to make it more academic.",
    tips: [
      "Use it to improve your own writing, not to disguise someone else's work.",
      "The Summarizer's 'Key sentences' mode is good for revision notes.",
      "Always double-check auto-generated citations."
    ],
    limitations: [
      "Paraphrasing others' work without citation is still plagiarism.",
      "Free version has word limits and fewer modes.",
      "Paraphrasing can change meaning in technical text."
    ],
    skills: ["Academic Writing", "Responsible AI"]
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    maker: "Notion Labs",
    category: "Writing & Communication",
    url: "https://www.notion.com/product/ai",
    pricing: "Free tier + paid",
    whatItIs: "Notion AI is built into the Notion workspace for notes, docs, wikis and project tracking. It can write, summarise, translate and answer questions using the content in your Notion pages.",
    whereToUse: [
      "Summarising class notes and meeting notes",
      "Creating study plans and to-do lists",
      "Drafting project documentation",
      "Asking questions across your whole notes workspace",
      "Auto-filling database properties like summaries or tags"
    ],
    howToUse: [
      "Sign up at notion.com and create a workspace.",
      "Create a page and write or paste your notes.",
      "Press the space bar on an empty line (or type /ai) to open Notion AI.",
      "Choose an action like 'Summarize', 'Find action items' or 'Continue writing'.",
      "Use the Ask AI chat to query information across your pages.",
      "Accept, edit or discard the generated text."
    ],
    examplePrompt: "Using my 'DBMS Notes' pages, create a one-page revision sheet with key definitions and 10 likely exam questions.",
    tips: [
      "Keep notes well-organised so AI search works better.",
      "Use database AI properties to auto-summarise many entries.",
      "Great for group projects with shared pages."
    ],
    limitations: [
      "Full AI features usually need a paid plan or add-on.",
      "Quality depends on the quality of your notes.",
      "Shared workspaces may expose AI answers to teammates – check permissions."
    ],
    skills: ["AI for Productivity", "Knowledge Management"]
  },

  // ───────────────────────── Research & Learning ─────────────────────────
  {
    id: "perplexity",
    name: "Perplexity",
    maker: "Perplexity AI",
    category: "Research & Learning",
    url: "https://www.perplexity.ai",
    pricing: "Free tier + paid",
    whatItIs: "Perplexity is an AI-powered answer engine that searches the web and gives a summarised answer with numbered citations. It is useful when you need up-to-date information with sources you can check.",
    whereToUse: [
      "Researching current events and new technologies",
      "Finding sources for assignments",
      "Comparing products, tools or courses",
      "Quick fact-checking with links",
      "Exploring a topic step by step with follow-up questions"
    ],
    howToUse: [
      "Go to perplexity.ai (an account is optional for basic use).",
      "Type a clear question.",
      "Read the answer and click the numbered citations to open the sources.",
      "Use 'Focus' options (e.g. Academic) to narrow the type of sources.",
      "Ask related follow-up questions in the same thread.",
      "Save useful threads into a Space for your project."
    ],
    examplePrompt: "What are the main differences between Power BI and Tableau for a fresher data analyst in 2026? Give a comparison table with sources.",
    tips: [
      "Always open at least two cited sources for important claims.",
      "Ask for recent sources when the topic changes quickly.",
      "Use Spaces to group research for one project."
    ],
    limitations: [
      "Summaries can misrepresent what a source actually says.",
      "Some sources may be low-quality or outdated.",
      "Pro search modes have limits on the free plan."
    ],
    skills: ["AI-assisted Research", "Information Literacy"]
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    maker: "Google",
    category: "Research & Learning",
    url: "https://notebooklm.google.com",
    pricing: "Free tier + paid",
    whatItIs: "NotebookLM is Google's AI research and study notebook. You upload your own sources (PDFs, Docs, slides, websites, YouTube videos) and it answers questions grounded only in those sources, with citations. It can also create study guides, mind maps and podcast-style Audio Overviews.",
    whereToUse: [
      "Studying from your own lecture notes and textbooks",
      "Creating study guides, FAQs and flashcards",
      "Listening to an Audio Overview of a chapter while commuting",
      "Comparing several research papers",
      "Preparing for interviews from a job description and company reports"
    ],
    howToUse: [
      "Open notebooklm.google.com and sign in with a Google account.",
      "Click 'New notebook'.",
      "Add sources: upload PDFs, paste text, add Google Docs/Slides, website links or YouTube links.",
      "Ask questions in the chat – click the citation numbers to see the exact source passage.",
      "Use the Studio panel to generate a study guide, mind map or Audio Overview.",
      "Save useful answers as notes in the notebook."
    ],
    examplePrompt: "Based only on my uploaded Unit 3 notes, create 15 short-answer exam questions with answers and the page they come from.",
    tips: [
      "Because answers are grounded in your sources, it hallucinates less than a general chatbot.",
      "Keep one notebook per subject or project.",
      "Customise Audio Overviews (e.g. 'focus on formulas for a beginner')."
    ],
    limitations: [
      "It only knows what you upload – missing sources mean missing answers.",
      "Source count and size limits apply.",
      "Audio Overviews can oversimplify; check against the source."
    ],
    skills: ["AI-assisted Research", "RAG", "Study Skills"]
  },
  {
    id: "consensus",
    name: "Consensus",
    maker: "Consensus",
    category: "Research & Learning",
    url: "https://consensus.app",
    pricing: "Free tier + paid",
    whatItIs: "Consensus is an AI search engine for scientific research. It searches peer-reviewed papers and summarises what studies say about a question, often showing how much the research agrees.",
    whereToUse: [
      "Finding academic papers for a literature review",
      "Checking whether a claim is supported by research",
      "Getting quick summaries of study findings",
      "Building reference lists for projects and theses"
    ],
    howToUse: [
      "Go to consensus.app and sign up.",
      "Ask a research question in plain English (e.g. 'Does spaced repetition improve exam scores?').",
      "Read the summary and the list of papers below.",
      "Open papers to check methods, sample size and year.",
      "Save or export citations for your reference list."
    ],
    examplePrompt: "Does using AI chatbots improve programming students' learning outcomes?",
    tips: [
      "Phrase questions as yes/no or 'what is the effect of X on Y'.",
      "Prefer recent studies and larger samples.",
      "Read the abstract and conclusion yourself before citing."
    ],
    limitations: [
      "Covers academic literature, not general news or tutorials.",
      "Summaries may miss nuances or limitations of studies.",
      "Some advanced features require a paid plan."
    ],
    skills: ["AI-assisted Research", "Academic Writing"]
  },
  {
    id: "elicit",
    name: "Elicit",
    maker: "Elicit",
    category: "Research & Learning",
    url: "https://elicit.com",
    pricing: "Free tier + paid",
    whatItIs: "Elicit is an AI research assistant that finds relevant academic papers, summarises them and extracts data (like methods, sample size and results) into a table. It speeds up literature reviews.",
    whereToUse: [
      "Literature reviews for final-year projects",
      "Extracting key details from many papers into a table",
      "Finding papers related to a research question",
      "Summarising PDFs of research papers you upload"
    ],
    howToUse: [
      "Create an account at elicit.com.",
      "Enter your research question.",
      "Review the list of papers and the AI summary.",
      "Add columns (e.g. 'Dataset used', 'Accuracy') to extract information from each paper.",
      "Upload your own PDFs to analyse them the same way.",
      "Export the table to CSV for your report."
    ],
    examplePrompt: "What machine learning models are used for crop yield prediction in India? Extract: model type, dataset, accuracy metric.",
    tips: [
      "Use the extraction table to compare papers side by side.",
      "Verify extracted numbers in the original paper.",
      "Combine with Zotero or another reference manager."
    ],
    limitations: [
      "Extraction can be wrong on complex tables.",
      "Free usage is limited by credits.",
      "Not every paper is available in full text."
    ],
    skills: ["AI-assisted Research", "Data Extraction"]
  },
  {
    id: "kaggle",
    name: "Kaggle",
    maker: "Google",
    category: "Research & Learning",
    url: "https://www.kaggle.com",
    pricing: "Free",
    whatItIs: "Kaggle is an online community for data science and machine learning. It offers free datasets, cloud notebooks with GPUs, short courses, competitions and shared models.",
    whereToUse: [
      "Finding datasets for ML and Power BI projects",
      "Learning Python, pandas and ML with free micro-courses",
      "Practising with beginner competitions (e.g. Titanic)",
      "Building a public portfolio of notebooks",
      "Studying other people's solutions"
    ],
    howToUse: [
      "Sign up at kaggle.com.",
      "Take a free course under 'Learn' (e.g. Intro to Machine Learning).",
      "Browse 'Datasets' and pick one that interests you.",
      "Click 'New Notebook' to start coding in the browser.",
      "Join a 'Getting Started' competition and submit predictions.",
      "Publish your notebook to build your portfolio."
    ],
    examplePrompt: "Open the Titanic competition, create a notebook, train a logistic regression model on Sex, Age and Pclass, and submit your first prediction.",
    tips: [
      "Read top public notebooks to learn techniques.",
      "Check dataset license and quality before using it.",
      "Verify your phone number to unlock GPU/internet in notebooks."
    ],
    limitations: [
      "Free GPU time has weekly quotas.",
      "Competition tricks don't always reflect real-world work.",
      "Some datasets are messy or poorly documented."
    ],
    skills: ["Machine Learning", "Python for Data Science", "Datasets"]
  },
  {
    id: "teachable-machine",
    name: "Teachable Machine",
    maker: "Google",
    category: "Research & Learning",
    url: "https://teachablemachine.withgoogle.com",
    pricing: "Free",
    whatItIs: "Teachable Machine is a free web tool from Google that lets anyone train simple image, sound or pose classification models without code. It is a great way to see supervised learning in action.",
    whereToUse: [
      "Understanding training data, classes and accuracy visually",
      "Building a quick demo (e.g. mask / no-mask detector)",
      "Class projects and science exhibitions",
      "Exporting a model to use in a simple website"
    ],
    howToUse: [
      "Open teachablemachine.withgoogle.com and click 'Get Started'.",
      "Choose Image, Audio or Pose project.",
      "Create classes (e.g. 'Thumbs up', 'Thumbs down').",
      "Add samples for each class using your webcam or uploaded files.",
      "Click 'Train Model' and wait for training to finish.",
      "Test it live in the Preview panel.",
      "Export the model (TensorFlow.js) to use in a web page."
    ],
    examplePrompt: "Create 3 classes – 'Pen', 'Phone', 'Nothing' – add 50 webcam images each, train, and test how well it recognises each object.",
    tips: [
      "Use varied backgrounds and lighting for better accuracy.",
      "Keep the number of samples balanced across classes.",
      "Great for explaining overfitting and bias."
    ],
    limitations: [
      "Only for simple classification tasks.",
      "Models trained on few samples generalise poorly.",
      "Not meant for production systems."
    ],
    skills: ["Machine Learning Basics", "Computer Vision", "Supervised Learning"]
  },

  // ───────────────────────── Coding ─────────────────────────
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    maker: "GitHub (Microsoft)",
    category: "Coding",
    url: "https://github.com/features/copilot",
    pricing: "Free tier + paid",
    whatItIs: "GitHub Copilot is an AI coding assistant inside editors like VS Code, Visual Studio and JetBrains IDEs. It suggests code as you type, answers questions in a chat panel and can make multi-file changes in agent mode. Verified students can often get it free.",
    whereToUse: [
      "Auto-completing repetitive code",
      "Explaining unfamiliar code",
      "Writing unit tests",
      "Fixing errors with chat suggestions",
      "Generating commit messages and PR summaries"
    ],
    howToUse: [
      "Sign in to GitHub and enable Copilot (apply for the student benefit via GitHub Education if eligible).",
      "Install the GitHub Copilot extension in VS Code.",
      "Sign in to GitHub from VS Code.",
      "Start typing code or a comment describing what you want – press Tab to accept a suggestion.",
      "Open Copilot Chat to ask questions like 'explain this function'.",
      "Use agent/edit mode for multi-file changes and review every diff.",
      "Run and test the code before committing."
    ],
    examplePrompt: "// function to validate an Indian mobile number (10 digits, starting 6-9) and return true/false",
    tips: [
      "Write clear comments and function names – suggestions improve.",
      "Use /explain and /tests commands in chat.",
      "Learn the code it writes; don't just accept it."
    ],
    limitations: [
      "Can suggest buggy or insecure code.",
      "Free tier has monthly limits.",
      "Over-reliance can slow down learning fundamentals."
    ],
    skills: ["AI for Coding", "Prompt Engineering", "Software Testing"]
  },
  {
    id: "cursor",
    name: "Cursor",
    maker: "Anysphere",
    category: "Coding",
    url: "https://cursor.com",
    pricing: "Free tier + paid",
    whatItIs: "Cursor is an AI-first code editor based on VS Code. It understands your whole project and can chat about it, autocomplete code and make multi-file edits through an agent.",
    whereToUse: [
      "Building full projects faster",
      "Refactoring code across many files",
      "Asking questions about a large codebase",
      "Fixing bugs from error logs",
      "Learning a new framework with in-editor help"
    ],
    howToUse: [
      "Download Cursor from cursor.com and install it.",
      "Import your VS Code settings and extensions if prompted.",
      "Open your project folder.",
      "Use Tab for AI autocomplete while typing.",
      "Press Ctrl+K (Cmd+K) to edit selected code with an instruction.",
      "Open the chat/agent panel and describe a feature; review the proposed changes.",
      "Accept or reject each diff and run your tests."
    ],
    examplePrompt: "Add a search box to the Students page that filters the table by name and roll number as I type. Keep the existing styling.",
    tips: [
      "Add project rules so the AI follows your coding style.",
      "Use @file mentions to give precise context.",
      "Commit to Git often so you can undo bad changes."
    ],
    limitations: [
      "Premium model usage is limited on the free plan.",
      "Agent edits can break code – always review diffs.",
      "Sends code to cloud models; check privacy settings for sensitive projects."
    ],
    skills: ["AI for Coding", "Git", "Web Development"]
  },
  {
    id: "claude-code",
    name: "Claude Code",
    maker: "Anthropic",
    category: "Coding",
    url: "https://www.claude.com/product/claude-code",
    pricing: "Paid",
    whatItIs: "Claude Code is Anthropic's agentic coding tool. It runs in your terminal, IDE, desktop app or browser, reads your codebase, edits files, runs commands and tests, and can work through multi-step tasks while asking permission for actions.",
    whereToUse: [
      "Building features across many files",
      "Fixing failing tests and bugs",
      "Understanding a new codebase quickly",
      "Writing documentation and refactoring",
      "Automating Git tasks like commits and pull requests"
    ],
    howToUse: [
      "Get a Claude subscription or an API account.",
      "Install Claude Code following the official instructions (e.g. via the install script or npm).",
      "Open a terminal in your project folder and run `claude`.",
      "Log in when prompted.",
      "Describe a task in plain English (e.g. 'add input validation to the signup form').",
      "Review each proposed edit or command and approve it.",
      "Run /init to create a CLAUDE.md file with project notes for better results."
    ],
    examplePrompt: "Look at this Express API. Add pagination (page, limit query params) to GET /products, update the tests, and run them.",
    tips: [
      "Keep a CLAUDE.md with build/test commands and conventions.",
      "Ask it to make a plan first for big changes.",
      "Use Git so every change is easy to review or revert."
    ],
    limitations: [
      "Requires a paid plan or API usage.",
      "Always review changes – it can misunderstand requirements.",
      "Be careful approving commands that delete files or touch production systems."
    ],
    skills: ["AI for Coding", "AI Agents", "Git"]
  },
  {
    id: "windsurf",
    name: "Windsurf",
    maker: "Cognition (Windsurf)",
    category: "Coding",
    url: "https://windsurf.com",
    pricing: "Free tier + paid",
    whatItIs: "Windsurf is an AI-powered code editor with an agent (Cascade) that understands your project, edits multiple files and runs commands. It also offers plugins for other IDEs.",
    whereToUse: [
      "Generating project scaffolds",
      "Multi-file edits and refactors",
      "Explaining code to beginners",
      "Fixing build and runtime errors"
    ],
    howToUse: [
      "Download Windsurf from windsurf.com and install.",
      "Sign in and open your project folder.",
      "Open the Cascade panel.",
      "Describe what you want to build or fix.",
      "Review the planned steps and file changes.",
      "Accept changes and run the app to test."
    ],
    examplePrompt: "Create a simple to-do app with React and localStorage: add, delete, mark complete, and a filter for completed items.",
    tips: [
      "Give small, clear tasks one at a time.",
      "Use the 'explain' features to learn while you build."
    ],
    limitations: [
      "Free credits are limited.",
      "Generated code may not follow best practices – review it.",
      "Product plans and features change often."
    ],
    skills: ["AI for Coding", "Web Development"]
  },
  {
    id: "replit-ai",
    name: "Replit (Agent)",
    maker: "Replit",
    category: "Coding",
    url: "https://replit.com",
    pricing: "Free tier + paid",
    whatItIs: "Replit is a browser-based coding platform where you can write, run and deploy code with no setup. Replit Agent can build entire apps from a description, and the AI assistant helps explain and fix code.",
    whereToUse: [
      "Coding from any computer without installing anything",
      "Building quick prototypes and hackathon projects",
      "Deploying small web apps",
      "Learning Python, JavaScript and more",
      "Collaborating live with teammates"
    ],
    howToUse: [
      "Sign up at replit.com.",
      "Click 'Create' and either pick a language template or describe an app for the Agent.",
      "Watch the Agent plan and build; answer its questions.",
      "Click Run to test the app in the preview.",
      "Ask the assistant to fix bugs or add features.",
      "Deploy when ready (deployment may require a paid plan)."
    ],
    examplePrompt: "Build a web app where students enter marks for 5 subjects and see the total, percentage, grade and a bar chart.",
    tips: [
      "Start simple and add features step by step.",
      "Check the code it writes so you can explain it in interviews.",
      "Use version history (checkpoints) to roll back."
    ],
    limitations: [
      "Agent usage costs credits beyond free limits.",
      "Large apps can become messy without your guidance.",
      "Public projects are visible to others on free plans – avoid secrets."
    ],
    skills: ["AI for Coding", "Full-stack Basics", "Deployment"]
  },
  {
    id: "v0",
    name: "v0",
    maker: "Vercel",
    category: "Coding",
    url: "https://v0.app",
    pricing: "Free tier + paid",
    whatItIs: "v0 by Vercel generates web UIs and full-stack Next.js apps from text prompts or screenshots. It produces React code with Tailwind CSS and modern UI components that you can preview, edit and deploy.",
    whereToUse: [
      "Creating landing pages and dashboards quickly",
      "Turning a screenshot or sketch into React code",
      "Prototyping UI ideas for projects",
      "Learning React and Tailwind by reading generated code"
    ],
    howToUse: [
      "Go to v0.app and sign in.",
      "Describe the UI you want or upload a screenshot.",
      "Review the live preview.",
      "Ask for changes ('make the sidebar dark', 'add a pricing section').",
      "Open the code view to study or copy the code.",
      "Deploy to Vercel or download the project."
    ],
    examplePrompt: "Create a responsive admin dashboard for a college library: sidebar navigation, cards for total books/issued/overdue, and a table of recent issues.",
    tips: [
      "Be specific about layout, colours and components.",
      "Iterate in small steps rather than one huge prompt."
    ],
    limitations: [
      "Best for Next.js/React; less suited to other stacks.",
      "Free credits are limited.",
      "Backend logic and security still need careful review."
    ],
    skills: ["AI for Coding", "React", "UI Design"]
  },
  {
    id: "bolt",
    name: "Bolt.new",
    maker: "StackBlitz",
    category: "Coding",
    url: "https://bolt.new",
    pricing: "Free tier + paid",
    whatItIs: "Bolt.new is an AI app builder that creates, runs and deploys full-stack web apps entirely in the browser from a text prompt. You can see the code and edit it directly.",
    whereToUse: [
      "Building hackathon prototypes",
      "Creating portfolio websites",
      "Trying out ideas for small business apps",
      "Learning project structure of modern JavaScript apps"
    ],
    howToUse: [
      "Open bolt.new and sign in.",
      "Type a description of the app you want.",
      "Watch it generate files and run the app in a preview.",
      "Ask for changes or fix errors in the chat.",
      "Edit code manually in the built-in editor if needed.",
      "Deploy or download the project."
    ],
    examplePrompt: "Build a personal portfolio site with sections for About, Skills (Excel, SQL, Power BI, Python), Projects with cards, and a contact form.",
    tips: [
      "Describe the tech stack if you have a preference.",
      "Download the code and push it to GitHub."
    ],
    limitations: [
      "Token limits on the free tier.",
      "Complex apps may get stuck in error loops.",
      "Review security before handling real user data."
    ],
    skills: ["AI for Coding", "Web Development"]
  },
  {
    id: "lovable",
    name: "Lovable",
    maker: "Lovable",
    category: "Coding",
    url: "https://lovable.dev",
    pricing: "Free tier + paid",
    whatItIs: "Lovable is an AI app builder that turns plain-English descriptions into working web apps. It integrates with services like Supabase for databases and login, and GitHub for code syncing.",
    whereToUse: [
      "Building MVPs for startup ideas",
      "Creating internal tools and forms",
      "Prototyping apps with login and a database",
      "Non-coders building simple apps"
    ],
    howToUse: [
      "Sign up at lovable.dev.",
      "Describe your app idea in the prompt box.",
      "Review the generated app in the preview.",
      "Request changes in chat or use visual edit to tweak UI.",
      "Connect Supabase if you need a database or authentication.",
      "Connect GitHub to own and back up your code, then publish."
    ],
    examplePrompt: "Create an event registration app for our college fest: a public form (name, email, event), and an admin page listing registrations with CSV export.",
    tips: [
      "Plan pages and data first, then prompt feature by feature.",
      "Sync to GitHub so you can continue in any editor."
    ],
    limitations: [
      "Message credits are limited on free plans.",
      "Generated security rules need checking before launch.",
      "Harder to customise deeply without coding knowledge."
    ],
    skills: ["AI for Coding", "No-code / Low-code"]
  },

  // ───────────────────────── Data & Spreadsheets ─────────────────────────
  {
    id: "copilot-in-excel",
    name: "Copilot in Excel",
    maker: "Microsoft",
    category: "Data & Spreadsheets",
    url: "https://www.microsoft.com/en-us/microsoft-365/copilot",
    pricing: "Paid",
    whatItIs: "Copilot in Excel is Microsoft's AI assistant inside Excel. It can create formulas, highlight trends, build PivotTables and charts, and even run Python analysis, all from natural-language requests.",
    whereToUse: [
      "Writing complex formulas like XLOOKUP or SUMIFS",
      "Finding trends and outliers in sales data",
      "Creating PivotTables and charts quickly",
      "Cleaning and formatting data",
      "Explaining what an existing formula does"
    ],
    howToUse: [
      "Make sure you have a Microsoft 365 plan that includes Copilot.",
      "Open your workbook (saved to OneDrive/SharePoint) and format data as a Table (Ctrl+T).",
      "Click the Copilot button on the Home tab.",
      "Ask a question, e.g. 'Add a column for profit margin'.",
      "Review the suggested formula or chart and click Insert.",
      "Check results against a few manual calculations."
    ],
    examplePrompt: "Show total sales by region and month as a PivotTable, then highlight the top 3 regions in green.",
    tips: [
      "Clean headers and Tables give much better results.",
      "Ask it to explain formulas so you learn them.",
      "Use =COPILOT() function or Python in Excel where available for advanced tasks."
    ],
    limitations: [
      "Requires a qualifying paid Microsoft 365 license.",
      "Can misread messy or merged-cell data.",
      "Always verify calculations before reporting them."
    ],
    skills: ["Excel", "Data Analysis", "AI for Productivity"]
  },
  {
    id: "copilot-in-power-bi",
    name: "Copilot in Power BI",
    maker: "Microsoft",
    category: "Data & Spreadsheets",
    url: "https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction",
    pricing: "Paid",
    whatItIs: "Copilot in Power BI helps create report pages, write DAX measures, summarise reports and answer questions about your data in natural language. It is available with certain Fabric/Premium capacities.",
    whereToUse: [
      "Generating a first draft of a report page",
      "Writing and explaining DAX measures",
      "Creating narrative summaries of dashboards for managers",
      "Asking questions about data in plain English",
      "Improving semantic model descriptions"
    ],
    howToUse: [
      "Check that your organisation's workspace has a capacity with Copilot enabled.",
      "Open a report in Power BI Desktop or the Power BI service.",
      "Click the Copilot button in the ribbon.",
      "Ask it to suggest or create a report page, e.g. 'Create a sales overview page'.",
      "In DAX query view, ask Copilot to write a measure.",
      "Review visuals and DAX, then adjust formatting manually."
    ],
    examplePrompt: "Create a measure for Year-over-Year sales growth % and add a line chart of monthly sales with this year vs last year.",
    tips: [
      "Give tables and columns clear names and descriptions – Copilot relies on them.",
      "Build a good star-schema model first.",
      "Validate DAX outputs with a simple table visual."
    ],
    limitations: [
      "Requires specific paid capacity and admin enablement.",
      "Generated visuals may not match your design standards.",
      "DAX can be logically wrong even if it runs."
    ],
    skills: ["Power BI", "DAX", "Data Visualization"]
  },
  {
    id: "julius-ai",
    name: "Julius AI",
    maker: "Julius AI",
    category: "Data & Spreadsheets",
    url: "https://julius.ai",
    pricing: "Free tier + paid",
    whatItIs: "Julius AI is an AI data analyst. You upload spreadsheets or CSV files and ask questions in plain English; it writes and runs code (mainly Python) to clean data, perform analysis and create charts.",
    whereToUse: [
      "Exploring a dataset quickly",
      "Making charts without coding",
      "Running basic statistics (averages, correlation, regression)",
      "Cleaning messy CSV files",
      "Learning pandas by reading the generated code"
    ],
    howToUse: [
      "Sign up at julius.ai.",
      "Upload an Excel or CSV file (or connect a data source).",
      "Ask a question, e.g. 'What are the top 5 products by revenue?'.",
      "View the chart/table and expand to see the code it ran.",
      "Ask follow-ups to refine charts or analysis.",
      "Download charts or the cleaned data."
    ],
    examplePrompt: "Using this sales.csv, show monthly revenue trend as a line chart and tell me which month had the biggest drop and why that might be.",
    tips: [
      "Describe column meanings if headers are unclear.",
      "Check the code to understand each step.",
      "Cross-check key numbers in Excel."
    ],
    limitations: [
      "Free plan has message limits.",
      "Interpretations ('why') are guesses – validate with domain knowledge.",
      "Do not upload confidential company data without permission."
    ],
    skills: ["Data Analysis", "Python for Data Science", "Data Visualization"]
  },

  // ───────────────────────── Presentations & Design ─────────────────────────
  {
    id: "gamma",
    name: "Gamma",
    maker: "Gamma",
    category: "Presentations & Design",
    url: "https://gamma.app",
    pricing: "Free tier + paid",
    whatItIs: "Gamma creates presentations, documents and simple websites from a prompt or outline. It produces designed slides with layouts, images and text that you can edit and export.",
    whereToUse: [
      "Making seminar and project presentations quickly",
      "Turning notes into a slide deck",
      "Creating a one-page portfolio site",
      "Pitch decks for hackathons"
    ],
    howToUse: [
      "Sign up at gamma.app.",
      "Click 'Create new' and choose Presentation.",
      "Enter a topic or paste your outline/notes.",
      "Review and edit the generated outline, then pick a theme.",
      "Generate the deck and edit text, images and layouts.",
      "Export to PDF or PowerPoint, or share a link."
    ],
    examplePrompt: "Create a 10-slide presentation on 'Introduction to Power BI for beginners' with an agenda, key features, a sample dashboard slide and a summary.",
    tips: [
      "Paste your own outline for more control.",
      "Replace generic images with your own screenshots.",
      "Keep text short – AI decks are often too wordy."
    ],
    limitations: [
      "Free plan uses limited AI credits.",
      "Content may contain errors – fact-check every slide.",
      "Exports to PowerPoint may need layout fixes."
    ],
    skills: ["Presentation Skills", "AI for Productivity"]
  },
  {
    id: "beautiful-ai",
    name: "Beautiful.ai",
    maker: "Beautiful.ai",
    category: "Presentations & Design",
    url: "https://www.beautiful.ai",
    pricing: "Paid",
    whatItIs: "Beautiful.ai is a presentation tool with smart templates that auto-adjust layout as you add content, plus AI to generate slides from a prompt. (Tome, another AI deck tool, has moved away from presentations, so Beautiful.ai or Gamma are common choices.)",
    whereToUse: [
      "Professional business presentations",
      "Team decks that keep consistent branding",
      "Turning data into clean chart slides",
      "Quick pitch decks"
    ],
    howToUse: [
      "Sign up at beautiful.ai (a trial is usually available).",
      "Create a new presentation and choose 'Generate with AI' or a template.",
      "Describe your topic and audience.",
      "Edit content in smart slides – layout adjusts automatically.",
      "Apply your theme/brand colours.",
      "Present online or export to PowerPoint/PDF."
    ],
    examplePrompt: "Generate a 7-slide deck: 'Quarterly sales review for a retail store' with a KPI slide, regional comparison chart and next-quarter plan.",
    tips: [
      "Use smart slides for timelines and comparisons.",
      "Keep one idea per slide."
    ],
    limitations: [
      "Mostly paid after the trial.",
      "Less freedom than PowerPoint for custom layouts.",
      "AI-generated content needs fact-checking."
    ],
    skills: ["Presentation Skills", "Business Communication"]
  },
  {
    id: "napkin-ai",
    name: "Napkin AI",
    maker: "Napkin AI",
    category: "Presentations & Design",
    url: "https://www.napkin.ai",
    pricing: "Free tier + paid",
    whatItIs: "Napkin AI turns text into visuals such as diagrams, flowcharts, mind maps and infographics. You paste text and it suggests several visual styles you can edit.",
    whereToUse: [
      "Turning notes into diagrams for slides",
      "Creating process flowcharts for reports",
      "Making infographics for social media or posters",
      "Visualising concepts for revision"
    ],
    howToUse: [
      "Sign up at napkin.ai.",
      "Create a new Napkin and paste or type your text.",
      "Select a paragraph and click the visual (spark) icon.",
      "Choose one of the suggested visuals.",
      "Edit colours, icons and labels.",
      "Export as PNG, SVG or PDF."
    ],
    examplePrompt: "Paste: 'The ML workflow: collect data, clean data, split train/test, train model, evaluate, deploy, monitor.' and generate a flow diagram.",
    tips: [
      "Short, structured text gives cleaner diagrams.",
      "Export SVG for sharp images in reports."
    ],
    limitations: [
      "Free plan has limits on credits/exports.",
      "Complex technical diagrams may need manual tools (draw.io).",
      "Visuals can misrepresent relationships – check them."
    ],
    skills: ["Data Storytelling", "Presentation Skills"]
  },
  {
    id: "canva-magic-studio",
    name: "Canva Magic Studio",
    maker: "Canva",
    category: "Presentations & Design",
    url: "https://www.canva.com/magic",
    pricing: "Free tier + paid",
    whatItIs: "Magic Studio is the set of AI features in Canva, including Magic Design (templates from a prompt), Magic Write (text), image generation, Magic Edit/Eraser, background remover and translation. It makes design easy for non-designers.",
    whereToUse: [
      "Posters and certificates for college events",
      "Social media posts and YouTube thumbnails",
      "Presentations and infographics",
      "Resumes and portfolios",
      "Removing or replacing parts of photos"
    ],
    howToUse: [
      "Sign up at canva.com (students/teachers may get Canva for Education free).",
      "Click 'Create a design' or use the Magic Design prompt box.",
      "Describe what you need (e.g. 'poster for coding workshop').",
      "Pick a generated design and edit text, colours and images.",
      "Use Magic Edit, Background Remover or Magic Write from the toolbar.",
      "Download as PNG/PDF or share a link."
    ],
    examplePrompt: "Magic Design: 'Instagram post announcing a free Excel & Power BI workshop on Saturday 10 AM, modern blue theme'.",
    tips: [
      "Upload your logo/colours to a Brand Kit for consistency.",
      "Keep text readable – high contrast and large fonts.",
      "Check Canva for Education eligibility through your institution."
    ],
    limitations: [
      "Many AI features and premium elements need Canva Pro.",
      "AI images may contain odd details – inspect closely.",
      "Templates can look generic if not customised."
    ],
    skills: ["Graphic Design", "Image Generation", "Presentation Skills"]
  },
  {
    id: "microsoft-designer",
    name: "Microsoft Designer",
    maker: "Microsoft",
    category: "Presentations & Design",
    url: "https://designer.microsoft.com",
    pricing: "Free tier + paid",
    whatItIs: "Microsoft Designer is an AI design app that creates images, social posts, invitations and graphics from prompts. It also includes AI editing like background removal and generative erase.",
    whereToUse: [
      "Event invitations and posters",
      "Social media graphics",
      "Stickers, banners and simple logos",
      "Editing photos (remove background, erase objects)"
    ],
    howToUse: [
      "Open designer.microsoft.com and sign in with a Microsoft account.",
      "Choose a template type or 'Create from scratch'.",
      "Describe the design you want.",
      "Pick one of the generated options.",
      "Edit text, layout and images.",
      "Download or share."
    ],
    examplePrompt: "Design a banner for 'Data Analytics Bootcamp – 30 Days' with a laptop, charts and a purple-blue gradient.",
    tips: [
      "Describe style, colours and mood in your prompt.",
      "Use it alongside PowerPoint for custom slide images."
    ],
    limitations: [
      "Daily AI credits are limited on free accounts.",
      "Text inside generated images may have spelling errors.",
      "Fewer templates than Canva."
    ],
    skills: ["Graphic Design", "Image Generation"]
  },
  {
    id: "figma-ai",
    name: "Figma AI",
    maker: "Figma",
    category: "Presentations & Design",
    url: "https://www.figma.com/ai",
    pricing: "Free tier + paid",
    whatItIs: "Figma is the leading collaborative tool for UI/UX design. Its AI features can generate design drafts, rename layers, create placeholder content, make interactive prototypes and turn designs into working prototypes with Figma Make.",
    whereToUse: [
      "Designing app and website screens",
      "Generating first-draft UI layouts",
      "Creating clickable prototypes for projects",
      "Collaborating with developers on design hand-off"
    ],
    howToUse: [
      "Sign up at figma.com (education plans are available for students).",
      "Create a new Design file.",
      "Open the Actions/AI menu and choose a feature, e.g. generate a design from a prompt.",
      "Edit the generated frames using components and auto layout.",
      "Use AI to rename layers or add realistic content.",
      "Share a prototype link for feedback."
    ],
    examplePrompt: "Generate a mobile login screen for a student attendance app with email, password, 'Forgot password' and a Google sign-in button.",
    tips: [
      "Learn Figma basics (frames, auto layout) to edit AI drafts well.",
      "Use AI for speed, but apply your own design judgment."
    ],
    limitations: [
      "AI features and limits depend on plan.",
      "Generated designs may not follow accessibility guidelines.",
      "Not a replacement for user research."
    ],
    skills: ["UI/UX Design", "Prototyping"]
  },

  // ───────────────────────── Image Generation ─────────────────────────
  {
    id: "midjourney",
    name: "Midjourney",
    maker: "Midjourney",
    category: "Image Generation",
    url: "https://www.midjourney.com",
    pricing: "Paid",
    whatItIs: "Midjourney is an AI image generator known for highly artistic, high-quality images. You type a text prompt and it creates several image options you can upscale or vary. It also offers video generation from images.",
    whereToUse: [
      "Concept art and mood boards",
      "Unique visuals for presentations and blogs",
      "Book covers and posters",
      "Exploring design styles quickly"
    ],
    howToUse: [
      "Go to midjourney.com and sign in.",
      "Choose a subscription plan.",
      "Type a prompt in the Create box describing subject, style, lighting and composition.",
      "Review the generated image grid.",
      "Upscale or create variations of the best one.",
      "Download the final image."
    ],
    examplePrompt: "A futuristic classroom where students learn with holographic data dashboards, soft morning light, isometric 3D illustration style --ar 16:9",
    tips: [
      "Add style words (watercolour, cinematic, flat illustration).",
      "Use parameters like --ar for aspect ratio.",
      "Study prompts of images you like in the Explore gallery."
    ],
    limitations: [
      "No permanent free plan.",
      "Images may be public on lower plans.",
      "Check usage rights and avoid copying artists' styles or real people."
    ],
    skills: ["Image Generation", "Prompt Engineering", "Responsible AI"]
  },
  {
    id: "chatgpt-images",
    name: "ChatGPT Images (DALL·E / GPT image)",
    maker: "OpenAI",
    category: "Image Generation",
    url: "https://chatgpt.com",
    pricing: "Free tier + paid",
    whatItIs: "ChatGPT can generate and edit images from conversation, using OpenAI's image models (the successors of DALL·E). It is good at following detailed instructions and rendering text inside images.",
    whereToUse: [
      "Illustrations for assignments and slides",
      "Infographics and diagrams with labels",
      "Editing an uploaded photo (change background, style)",
      "Creating mockups of products or apps"
    ],
    howToUse: [
      "Open chatgpt.com and sign in.",
      "Describe the image you want in detail.",
      "Wait for the image to generate.",
      "Ask for edits in plain English ('make the background white').",
      "Download the final image."
    ],
    examplePrompt: "Create a clean infographic titled 'Supervised vs Unsupervised Learning' with two columns, icons and 3 examples each, white background.",
    tips: [
      "Specify aspect ratio, style and exact text to include.",
      "Iterate with small edits instead of starting over."
    ],
    limitations: [
      "Free users have limited daily images.",
      "Refuses some requests (e.g. real people, copyrighted characters).",
      "Fine details and text can still be wrong."
    ],
    skills: ["Image Generation", "Multimodal AI"]
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    maker: "Adobe",
    category: "Image Generation",
    url: "https://firefly.adobe.com",
    pricing: "Free tier + paid",
    whatItIs: "Adobe Firefly is Adobe's family of generative AI models for images, video, audio and vector graphics. Adobe designs its own models to be commercially safe, and Firefly powers features like Generative Fill in Photoshop.",
    whereToUse: [
      "Generating images for commercial or marketing work",
      "Generative Fill/Expand in Photoshop",
      "Text effects and vector graphics in Illustrator/Express",
      "Short video clips and B-roll"
    ],
    howToUse: [
      "Go to firefly.adobe.com and sign in with an Adobe ID.",
      "Choose a feature such as Text to Image.",
      "Type a prompt and pick content type (photo/art) and style.",
      "Generate and select a result.",
      "Refine using reference images or style settings.",
      "Download or open in Photoshop/Express for further edits."
    ],
    examplePrompt: "Photo of a young professional presenting a Power BI dashboard on a big screen in a modern office, natural lighting.",
    tips: [
      "Use Generative Fill in Photoshop to remove or add objects.",
      "Use the style reference option to match a look."
    ],
    limitations: [
      "Uses generative credits that run out on free plans.",
      "Some partner models in the app have different usage terms.",
      "Realistic people images may look slightly off."
    ],
    skills: ["Image Generation", "Graphic Design", "Copyright & AI"]
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    maker: "Stability AI",
    category: "Image Generation",
    url: "https://stability.ai",
    pricing: "Open source",
    whatItIs: "Stable Diffusion is a family of image-generation models with openly available weights. You can run it on your own computer (with a good GPU) using tools like ComfyUI or Automatic1111, or through online services.",
    whereToUse: [
      "Learning how diffusion models work",
      "Generating images offline and privately",
      "Custom fine-tuning (e.g. LoRA) for a specific style or product",
      "Research and experimentation"
    ],
    howToUse: [
      "Check your computer has a capable GPU, or use an online service/Colab.",
      "Install a front-end such as ComfyUI or Automatic1111 WebUI.",
      "Download a Stable Diffusion model checkpoint from Hugging Face (accept its license).",
      "Load the model in the UI.",
      "Enter a prompt and a negative prompt; set steps and image size.",
      "Generate, then adjust settings and seed to refine."
    ],
    examplePrompt: "Prompt: 'watercolor illustration of a Mumbai street at sunset, detailed'. Negative prompt: 'blurry, distorted, extra limbs'.",
    tips: [
      "Use a fixed seed to reproduce results.",
      "Read the model license before commercial use."
    ],
    limitations: [
      "Setup is technical and needs strong hardware.",
      "Open models can be misused – follow ethical guidelines.",
      "Quality varies by model version and settings."
    ],
    skills: ["Image Generation", "Open-source Models", "Diffusion Models"]
  },
  {
    id: "leonardo-ai",
    name: "Leonardo AI",
    maker: "Leonardo.Ai (Canva)",
    category: "Image Generation",
    url: "https://leonardo.ai",
    pricing: "Free tier + paid",
    whatItIs: "Leonardo AI is an image and video generation platform with many fine-tuned models and styles. It is popular for game assets, concept art and marketing visuals and gives fine control over generation settings.",
    whereToUse: [
      "Game assets and characters",
      "Product and marketing visuals",
      "Consistent style images using trained models",
      "Short image-to-video animations"
    ],
    howToUse: [
      "Sign up at leonardo.ai.",
      "Open Image Generation.",
      "Choose a model/preset and aspect ratio.",
      "Type your prompt and generate.",
      "Use Canvas to edit or extend images.",
      "Download your favourite results."
    ],
    examplePrompt: "Cute robot mascot for a coding club, 3D cartoon style, holding a laptop, plain background, front view.",
    tips: [
      "Try different models for different styles.",
      "Use image guidance to keep a consistent character."
    ],
    limitations: [
      "Free daily tokens are limited.",
      "Free-tier images may be public.",
      "Check commercial-use terms for your plan."
    ],
    skills: ["Image Generation", "Prompt Engineering"]
  },

  // ───────────────────────── Audio & Voice ─────────────────────────
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    maker: "ElevenLabs",
    category: "Audio & Voice",
    url: "https://elevenlabs.io",
    pricing: "Free tier + paid",
    whatItIs: "ElevenLabs provides realistic AI text-to-speech, voice cloning, dubbing into other languages, speech-to-text and sound effects. It supports many languages including Hindi.",
    whereToUse: [
      "Voiceovers for project videos and presentations",
      "Audiobooks or narrated notes",
      "Dubbing videos into other languages",
      "Voice agents for customer support demos",
      "Sound effects for videos"
    ],
    howToUse: [
      "Sign up at elevenlabs.io.",
      "Open Text to Speech.",
      "Paste your script and choose a voice and language.",
      "Adjust settings like stability and style.",
      "Generate and listen, then tweak punctuation for better pacing.",
      "Download the audio file."
    ],
    examplePrompt: "Script: 'Welcome to Day 1 of our Power BI course. Today we will install Power BI Desktop and load our first dataset.' – voice: calm, friendly narrator.",
    tips: [
      "Use punctuation and short sentences to control pacing.",
      "Only clone voices you have explicit permission to use."
    ],
    limitations: [
      "Free plan has monthly character limits and attribution rules.",
      "Voice cloning raises deepfake and consent concerns.",
      "Pronunciation of names/technical terms may need fixes."
    ],
    skills: ["Text-to-Speech", "Multimodal AI", "Responsible AI"]
  },
  {
    id: "suno",
    name: "Suno",
    maker: "Suno",
    category: "Audio & Voice",
    url: "https://suno.com",
    pricing: "Free tier + paid",
    whatItIs: "Suno generates complete songs – music and vocals – from a text description or your own lyrics. You can choose genres and styles and create short tracks in minutes.",
    whereToUse: [
      "Background music for college event videos",
      "Fun learning songs (e.g. a song to memorise formulas)",
      "Jingles for class projects or pitches",
      "Exploring music styles creatively"
    ],
    howToUse: [
      "Sign up at suno.com.",
      "Click Create.",
      "Describe the song (genre, mood, topic) or switch to custom mode and paste lyrics.",
      "Generate and listen to the versions.",
      "Extend or remix the version you like.",
      "Download or share the track."
    ],
    examplePrompt: "Upbeat pop song about learning SQL joins – INNER, LEFT, RIGHT, FULL – catchy chorus, for students.",
    tips: [
      "Write your own lyrics for more control.",
      "Check the commercial-use rights for your plan before publishing."
    ],
    limitations: [
      "Free-plan songs typically cannot be used commercially.",
      "Copyright questions around AI music are still evolving.",
      "Lyrics pronunciation can be imperfect."
    ],
    skills: ["Generative AI", "Copyright & AI"]
  },
  {
    id: "whisper",
    name: "Whisper",
    maker: "OpenAI",
    category: "Audio & Voice",
    url: "https://github.com/openai/whisper",
    pricing: "Open source",
    whatItIs: "Whisper is OpenAI's open-source speech-recognition model. It transcribes speech in many languages and can translate it to English. You can run it locally with Python or use speech-to-text via the OpenAI API.",
    whereToUse: [
      "Transcribing recorded lectures",
      "Creating subtitles for videos",
      "Converting interviews into text for research",
      "Building voice-input features in apps"
    ],
    howToUse: [
      "Install Python and ffmpeg on your computer.",
      "Install Whisper with `pip install -U openai-whisper`.",
      "Open a terminal in the folder with your audio file.",
      "Run `whisper lecture.mp3 --model small` to transcribe.",
      "Open the generated .txt or .srt files.",
      "Try bigger models for better accuracy (they are slower)."
    ],
    examplePrompt: "whisper interview.m4a --model medium --language Hindi --task translate",
    tips: [
      "Use the .srt output directly as video subtitles.",
      "Clear audio with little background noise gives better results.",
      "Run it in Google Colab if your computer is slow."
    ],
    limitations: [
      "Larger models need a GPU to run quickly.",
      "Can invent words during silence or noise – review transcripts.",
      "Does not label speakers by default."
    ],
    skills: ["Speech-to-Text", "Open-source Models", "Python"]
  },

  // ───────────────────────── Video ─────────────────────────
  {
    id: "runway",
    name: "Runway",
    maker: "Runway",
    category: "Video",
    url: "https://runwayml.com",
    pricing: "Free tier + paid",
    whatItIs: "Runway is a creative AI platform for generating and editing video. It can create video from text or images, extend clips, remove backgrounds and apply many AI editing tools.",
    whereToUse: [
      "Short cinematic clips for projects and ads",
      "Animating still images",
      "Removing backgrounds from video",
      "Film and media student experiments"
    ],
    howToUse: [
      "Sign up at runwayml.com.",
      "Choose a tool, e.g. image-to-video or text-to-video.",
      "Upload an image or write a prompt describing the scene and camera motion.",
      "Generate and preview the clip.",
      "Refine the prompt or settings and regenerate.",
      "Download and edit the clip in your video editor."
    ],
    examplePrompt: "Slow drone shot over a green tea plantation in the hills at sunrise, mist, cinematic.",
    tips: [
      "Describe camera movement (pan, zoom, dolly).",
      "Generate short clips and combine them in an editor."
    ],
    limitations: [
      "Credits run out quickly; free tier is small.",
      "Clips are short and may have visual glitches.",
      "Respect likeness and copyright rules."
    ],
    skills: ["Video Generation", "Multimodal AI"]
  },
  {
    id: "synthesia",
    name: "Synthesia",
    maker: "Synthesia",
    category: "Video",
    url: "https://www.synthesia.io",
    pricing: "Free tier + paid",
    whatItIs: "Synthesia creates videos with AI avatars that speak your script in many languages. Companies use it for training, onboarding and explainer videos without cameras or studios.",
    whereToUse: [
      "Training and onboarding videos",
      "Course explainer videos",
      "Multilingual product walkthroughs",
      "Internal company announcements"
    ],
    howToUse: [
      "Sign up at synthesia.io.",
      "Choose a template or start blank.",
      "Pick an avatar and voice/language.",
      "Paste your script for each scene.",
      "Add slides, screen recordings or text.",
      "Generate the video and download or share it."
    ],
    examplePrompt: "Script: 'In this 2-minute video, you will learn how to create a PivotTable in Excel in three simple steps.'",
    tips: [
      "Write short sentences – they sound more natural.",
      "Combine avatar scenes with screen recordings."
    ],
    limitations: [
      "Free plan offers only limited minutes and features.",
      "Avatars can feel less engaging than real presenters.",
      "Strict rules on content and using real people's likeness."
    ],
    skills: ["Video Generation", "Corporate Training"]
  },
  {
    id: "heygen",
    name: "HeyGen",
    maker: "HeyGen",
    category: "Video",
    url: "https://www.heygen.com",
    pricing: "Free tier + paid",
    whatItIs: "HeyGen is an AI video platform for talking-avatar videos, custom avatars of yourself and video translation with lip-sync. It is popular for marketing and social media content.",
    whereToUse: [
      "Marketing and social media videos",
      "Translating your videos into other languages with lip-sync",
      "Personalised sales or welcome videos",
      "Course and tutorial intros"
    ],
    howToUse: [
      "Sign up at heygen.com.",
      "Create a new video and choose an avatar (or create your own with consent).",
      "Enter your script and choose a voice.",
      "Add backgrounds, text and media.",
      "Generate and preview.",
      "Download or share the video."
    ],
    examplePrompt: "Translate my 1-minute English project demo video into Hindi with lip-sync.",
    tips: [
      "Only create avatars of yourself or people who consent.",
      "Keep videos short for social media."
    ],
    limitations: [
      "Free plan has watermarks and short limits.",
      "Deepfake risk – clearly label AI-generated videos.",
      "Lip-sync can look unnatural in some cases."
    ],
    skills: ["Video Generation", "Responsible AI"]
  },
  {
    id: "descript",
    name: "Descript",
    maker: "Descript",
    category: "Video",
    url: "https://www.descript.com",
    pricing: "Free tier + paid",
    whatItIs: "Descript is an audio and video editor where you edit media by editing its transcript like a document. AI features remove filler words, enhance audio, add captions and more.",
    whereToUse: [
      "Editing podcasts and interviews",
      "Cleaning up recorded presentations",
      "Adding captions to videos",
      "Removing 'um' and 'uh' automatically",
      "Creating short clips for social media"
    ],
    howToUse: [
      "Download Descript or use it in the browser after signing up.",
      "Create a project and import your video or audio.",
      "Wait for the automatic transcript.",
      "Delete words in the transcript to cut them from the video.",
      "Use AI tools like Remove filler words and Studio Sound.",
      "Add captions and export."
    ],
    examplePrompt: "Import your 10-minute project presentation, remove filler words, enhance audio with Studio Sound, and export a captioned MP4.",
    tips: [
      "Great for beginners who find timeline editing hard.",
      "Use the AI assistant to suggest short highlight clips."
    ],
    limitations: [
      "Free plan limits transcription hours and export quality.",
      "Transcripts of accented or technical speech need correcting.",
      "Overdub/voice features require consent and verification."
    ],
    skills: ["Video Editing", "Speech-to-Text"]
  },
  {
    id: "capcut",
    name: "CapCut",
    maker: "ByteDance",
    category: "Video",
    url: "https://www.capcut.com",
    pricing: "Free tier + paid",
    whatItIs: "CapCut is a popular video editor for mobile, desktop and web with many AI features: auto captions, background removal, script-to-video, effects and templates for short-form content.",
    whereToUse: [
      "Instagram Reels and YouTube Shorts",
      "Auto-captioning videos",
      "Quick edits for college event highlights",
      "Removing video backgrounds"
    ],
    howToUse: [
      "Install CapCut or open capcut.com.",
      "Create a new project and import your clips.",
      "Trim and arrange clips on the timeline.",
      "Use Auto captions to add subtitles.",
      "Apply AI effects, templates or background removal.",
      "Export in the right resolution for your platform."
    ],
    examplePrompt: "Import 6 clips from your tech fest, apply a trending template, add auto captions, and export a 30-second vertical reel.",
    tips: [
      "Check caption accuracy before posting.",
      "Use templates to save time but customise them."
    ],
    limitations: [
      "Some AI features and assets require a Pro plan.",
      "Availability differs by country.",
      "Review privacy terms before uploading personal content."
    ],
    skills: ["Video Editing", "Content Creation"]
  },

  // ───────────────────────── Meetings & Notes ─────────────────────────
  {
    id: "otter-ai",
    name: "Otter.ai",
    maker: "Otter.ai",
    category: "Meetings & Notes",
    url: "https://otter.ai",
    pricing: "Free tier + paid",
    whatItIs: "Otter.ai records and transcribes meetings and lectures in real time, then creates summaries and action items. It can join Zoom, Google Meet and Microsoft Teams calls automatically.",
    whereToUse: [
      "Transcribing lectures and webinars",
      "Taking notes in team project meetings",
      "Getting action items after client calls",
      "Searching past meetings for decisions"
    ],
    howToUse: [
      "Sign up at otter.ai and install the mobile app if needed.",
      "Connect your calendar so Otter can join meetings, or press Record for live audio.",
      "Let it transcribe during the meeting.",
      "After the meeting, read the automatic summary and action items.",
      "Ask Otter's chat questions about the meeting.",
      "Share or export notes."
    ],
    examplePrompt: "After the project meeting, ask: 'What tasks were assigned to me and what are the deadlines?'",
    tips: [
      "Tell participants you are recording – get consent.",
      "Add custom vocabulary for technical terms."
    ],
    limitations: [
      "Free plan limits minutes per conversation and per month.",
      "Accuracy drops with accents, crosstalk and noise.",
      "Recording without consent may break rules or laws."
    ],
    skills: ["Speech-to-Text", "AI for Productivity"]
  },
  {
    id: "fireflies-ai",
    name: "Fireflies.ai",
    maker: "Fireflies.ai",
    category: "Meetings & Notes",
    url: "https://fireflies.ai",
    pricing: "Free tier + paid",
    whatItIs: "Fireflies.ai is an AI meeting assistant that joins calls, records, transcribes, summarises and makes meetings searchable. It integrates with CRMs and project tools.",
    whereToUse: [
      "Automatic meeting notes for internships and jobs",
      "Sales and client call summaries",
      "Searching across many recorded meetings",
      "Sending notes to Slack, Notion or a CRM"
    ],
    howToUse: [
      "Sign up at fireflies.ai with your work/Google account.",
      "Connect your calendar.",
      "Allow the Fireflies notetaker to join your meetings (or upload a recording).",
      "Review the transcript, summary and action items afterwards.",
      "Use AskFred chat to query the meeting.",
      "Set up integrations to share notes automatically."
    ],
    examplePrompt: "Upload a recorded team call and ask: 'Summarise the decisions made and list open questions.'",
    tips: [
      "Review auto-join settings so it doesn't join private calls.",
      "Use topic trackers to find key moments."
    ],
    limitations: [
      "Free plan has limited storage and AI summaries.",
      "Some people dislike bots joining meetings – ask first.",
      "Summaries may miss context or tone."
    ],
    skills: ["AI for Productivity", "Business Communication"]
  },

  // ───────────────────────── Automation & No-code ─────────────────────────
  {
    id: "zapier-ai",
    name: "Zapier (AI)",
    maker: "Zapier",
    category: "Automation & No-code",
    url: "https://zapier.com",
    pricing: "Free tier + paid",
    whatItIs: "Zapier connects thousands of apps to automate tasks without code. Its AI features let you describe a workflow in plain English, add AI steps (summarise, classify, extract) and build AI agents and chatbots.",
    whereToUse: [
      "Saving form responses to Google Sheets automatically",
      "Summarising emails and posting to Slack",
      "Classifying support tickets with AI",
      "Sending reminders and notifications",
      "Lead capture automation for small businesses"
    ],
    howToUse: [
      "Sign up at zapier.com.",
      "Click Create and describe your automation in plain English, or build a Zap manually.",
      "Choose a trigger app and event (e.g. new Google Form response).",
      "Add action steps (e.g. AI summarise, then create a row in Google Sheets).",
      "Connect your accounts and map the fields.",
      "Test each step, then turn the Zap on."
    ],
    examplePrompt: "When a new email arrives with 'Invoice' in the subject, use AI to extract amount and due date, then add a row to my Google Sheet.",
    tips: [
      "Start with a simple two-step Zap.",
      "Use filters to avoid unnecessary task usage."
    ],
    limitations: [
      "Free plan limits tasks and multi-step Zaps.",
      "Complex logic can become costly.",
      "AI steps can misclassify – add checks for important actions."
    ],
    skills: ["Automation", "No-code / Low-code", "AI Agents"]
  },
  {
    id: "make",
    name: "Make",
    maker: "Make (Celonis)",
    category: "Automation & No-code",
    url: "https://www.make.com",
    pricing: "Free tier + paid",
    whatItIs: "Make (formerly Integromat) is a visual automation platform where you build workflows (scenarios) by connecting app modules on a canvas. It supports branching, loops and AI modules, including AI agents.",
    whereToUse: [
      "Multi-step business workflows with conditions",
      "Processing data between apps (e.g. CRM to Sheets)",
      "AI content pipelines (generate, review, post)",
      "Automating reports and notifications"
    ],
    howToUse: [
      "Sign up at make.com.",
      "Create a new scenario.",
      "Add a trigger module (e.g. Watch new rows in Google Sheets).",
      "Add more modules and connect them; use routers and filters for conditions.",
      "Map data from earlier modules into later ones.",
      "Click 'Run once' to test, then schedule the scenario."
    ],
    examplePrompt: "Scenario: when a new row is added to 'Leads' sheet, ask an AI module to write a personalised welcome email, then send it via Gmail.",
    tips: [
      "Use the visual canvas to understand data flow.",
      "Check operation counts to stay within your plan."
    ],
    limitations: [
      "Learning curve is steeper than Zapier.",
      "Free plan has limited operations.",
      "Errors in mapping can send wrong data – test carefully."
    ],
    skills: ["Automation", "No-code / Low-code", "APIs"]
  },
  {
    id: "n8n",
    name: "n8n",
    maker: "n8n",
    category: "Automation & No-code",
    url: "https://n8n.io",
    pricing: "Free tier + paid",
    whatItIs: "n8n is a workflow automation tool with a visual node editor and a fair-code license, so you can self-host it or use the cloud version. It has strong AI features for building AI agents and RAG workflows with LLMs and vector stores.",
    whereToUse: [
      "Building AI agents that use tools",
      "Self-hosted automation for privacy-sensitive data",
      "Connecting APIs and databases",
      "RAG chatbots over company documents",
      "Developer-friendly automation with code nodes"
    ],
    howToUse: [
      "Use n8n Cloud (trial) or self-host with Docker/npx.",
      "Create a new workflow.",
      "Add a trigger node (Webhook, Schedule, form, chat).",
      "Add nodes for apps, AI models (e.g. Anthropic, OpenAI) and logic.",
      "Add credentials for each service securely.",
      "Execute the workflow to test, then activate it."
    ],
    examplePrompt: "Build a chat-triggered AI Agent node using a Claude model with a Google Sheets tool so it can answer 'How many orders did we get today?'",
    tips: [
      "Self-hosting gives control but you must maintain security and updates.",
      "Start from community workflow templates."
    ],
    limitations: [
      "More technical than Zapier.",
      "Self-hosting requires server knowledge.",
      "License has conditions for commercial resale."
    ],
    skills: ["Automation", "AI Agents", "RAG"]
  },
  {
    id: "power-automate-copilot",
    name: "Power Automate (Copilot)",
    maker: "Microsoft",
    category: "Automation & No-code",
    url: "https://powerautomate.microsoft.com",
    pricing: "Free tier + paid",
    whatItIs: "Power Automate is Microsoft's automation platform for cloud flows and desktop automation (RPA). With Copilot you can describe a flow in plain language and it builds it for you, connecting Outlook, Excel, SharePoint, Teams and many other services.",
    whereToUse: [
      "Saving email attachments to OneDrive automatically",
      "Approval workflows in companies",
      "Updating Excel or SharePoint lists from forms",
      "Automating repetitive desktop tasks with Power Automate Desktop",
      "Sending Teams alerts from Power BI data"
    ],
    howToUse: [
      "Sign in at make.powerautomate.com with a work/school Microsoft account.",
      "Click Create and describe your flow to Copilot.",
      "Review the suggested trigger and actions.",
      "Connect the required accounts.",
      "Adjust the details and save.",
      "Test the flow and check the run history."
    ],
    examplePrompt: "When I receive an email with an attachment from my manager, save the attachment to OneDrive folder 'Reports' and notify me in Teams.",
    tips: [
      "Power Automate Desktop on Windows is great for RPA practice.",
      "Pair with Excel and Power BI for end-to-end reporting automation."
    ],
    limitations: [
      "Premium connectors require paid licenses.",
      "Copilot features depend on your organisation's settings.",
      "Flows can fail silently – monitor run history."
    ],
    skills: ["Automation", "Microsoft 365", "RPA"]
  },

  // ───────────────────────── Developer Platforms & APIs ─────────────────────────
  {
    id: "anthropic-api",
    name: "Claude Developer Platform (Anthropic API)",
    maker: "Anthropic",
    category: "Developer Platforms & APIs",
    url: "https://www.anthropic.com/api",
    pricing: "Paid",
    whatItIs: "The Claude Developer Platform gives programmatic access to Claude models (e.g. claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5) through the Messages API. Developers use it with the official Python (`anthropic`) and JavaScript (`@anthropic-ai/sdk`) SDKs to build chatbots, agents, tool use and document analysis apps.",
    whereToUse: [
      "Building AI chatbots and assistants for websites",
      "Summarising or extracting data from documents at scale",
      "Creating AI agents that call your own tools/APIs",
      "Getting structured JSON output for apps",
      "Final-year AI projects"
    ],
    howToUse: [
      "Create an account on the Claude Developer Platform (Console) and add billing credits.",
      "Generate an API key and store it in the ANTHROPIC_API_KEY environment variable – never hard-code it.",
      "Install the SDK: `pip install anthropic` or `npm install @anthropic-ai/sdk`.",
      "Call client.messages.create with model, max_tokens, an optional system prompt and messages.",
      "Check stop_reason (including 'refusal') before reading the response content.",
      "Use output_config effort ('low' to 'max') to trade speed vs depth, and tools for function calling.",
      "Monitor usage and costs in the Console."
    ],
    examplePrompt: "import anthropic\nclient = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY\nmsg = client.messages.create(\n    model=\"claude-opus-5-5\",\n    max_tokens=1024,\n    system=\"You are a helpful Excel tutor.\",\n    messages=[{\"role\": \"user\", \"content\": \"Explain XLOOKUP with one example.\"}],\n)\nif msg.stop_reason != \"refusal\":\n    print(msg.content[0].text)",
    tips: [
      "Use Haiku for cheap, fast tasks and Opus for hard reasoning.",
      "Use prompt caching for repeated long context to save cost.",
      "Try your prompts in the Console workbench or the in-app AI Prompt Lab first."
    ],
    limitations: [
      "Usage is billed per token – set spending limits.",
      "Current models reject sampling params like temperature/top_p and assistant prefill.",
      "You are responsible for safe handling of user data in your app."
    ],
    skills: ["LLM APIs", "Prompt Engineering", "AI Agents", "Tool Use"]
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    maker: "OpenAI",
    category: "Developer Platforms & APIs",
    url: "https://platform.openai.com",
    pricing: "Paid",
    whatItIs: "The OpenAI API provides access to GPT models, image generation, speech-to-text, text-to-speech and embeddings. Developers use official SDKs to add these capabilities to their applications.",
    whereToUse: [
      "Chatbots and text generation in apps",
      "Embeddings for semantic search",
      "Speech transcription and voice features",
      "Image generation inside products"
    ],
    howToUse: [
      "Sign up at platform.openai.com and add billing.",
      "Create an API key and save it in the OPENAI_API_KEY environment variable.",
      "Install the SDK: `pip install openai` or `npm install openai`.",
      "Follow the quickstart in the docs to send your first request.",
      "Test prompts in the Playground.",
      "Set usage limits in your account settings."
    ],
    examplePrompt: "from openai import OpenAI\nclient = OpenAI()\nresp = client.responses.create(model=\"<model-name>\", input=\"Give 3 tips for learning DAX.\")\nprint(resp.output_text)",
    tips: [
      "Check the docs for current model names – they change often.",
      "Use smaller models for simple tasks to reduce cost."
    ],
    limitations: [
      "Pay-as-you-go costs can grow quickly.",
      "Rate limits apply to new accounts.",
      "Never expose your API key in front-end code."
    ],
    skills: ["LLM APIs", "Embeddings", "Multimodal AI"]
  },
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    maker: "Google",
    category: "Developer Platforms & APIs",
    url: "https://aistudio.google.com",
    pricing: "Free tier + paid",
    whatItIs: "Google AI Studio is a web tool for trying Gemini models and getting a Gemini API key. You can test prompts with text, images, audio and video, then export code for your app.",
    whereToUse: [
      "Experimenting with Gemini models for free",
      "Prototyping multimodal apps (image/video understanding)",
      "Getting API keys for student projects",
      "Generating starter code in Python or JavaScript"
    ],
    howToUse: [
      "Open aistudio.google.com and sign in with a Google account.",
      "Start a new chat/prompt and choose a Gemini model.",
      "Type a prompt and attach files if needed.",
      "Adjust settings and system instructions.",
      "Click 'Get code' to copy the API code.",
      "Create an API key and store it safely as an environment variable."
    ],
    examplePrompt: "Upload a photo of a hand-drawn ER diagram and ask: 'Convert this into MySQL CREATE TABLE statements with primary and foreign keys.'",
    tips: [
      "Free tier is great for learning; check data-use terms.",
      "Use system instructions to fix the model's role."
    ],
    limitations: [
      "Free-tier data may be used to improve Google products.",
      "Rate limits on the free tier.",
      "Model names and limits change frequently."
    ],
    skills: ["LLM APIs", "Multimodal AI", "Prompt Engineering"]
  },
  {
    id: "langchain",
    name: "LangChain",
    maker: "LangChain",
    category: "Developer Platforms & APIs",
    url: "https://www.langchain.com",
    pricing: "Open source",
    whatItIs: "LangChain is an open-source framework (Python and JavaScript) for building LLM applications. It provides building blocks for prompts, model connections, retrieval (RAG), tools and agents, and LangGraph for stateful agent workflows. LangSmith (paid tiers) helps trace and evaluate apps.",
    whereToUse: [
      "Building RAG chatbots over PDFs",
      "Creating agents that use tools and APIs",
      "Switching between model providers easily",
      "Chaining multiple LLM steps together"
    ],
    howToUse: [
      "Install Python and create a virtual environment.",
      "Install packages, e.g. `pip install langchain langchain-anthropic`.",
      "Set your model provider API key as an environment variable.",
      "Create a chat model object and send a simple message.",
      "Add a document loader, text splitter, embeddings and vector store for RAG.",
      "Build a retrieval chain or agent and test with questions."
    ],
    examplePrompt: "from langchain_anthropic import ChatAnthropic\nllm = ChatAnthropic(model=\"claude-sonnet-5-5\")\nprint(llm.invoke(\"Explain RAG in 3 lines\").content)",
    tips: [
      "Learn the core concepts (chunks, embeddings, retrieval) before using the framework.",
      "Follow the official tutorials – APIs change between versions."
    ],
    limitations: [
      "Frequent version changes can break old tutorials.",
      "Abstractions can hide what is really happening.",
      "Simple apps may not need a framework at all."
    ],
    skills: ["RAG", "AI Agents", "LLM APIs", "Python"]
  },
  {
    id: "llamaindex",
    name: "LlamaIndex",
    maker: "LlamaIndex",
    category: "Developer Platforms & APIs",
    url: "https://www.llamaindex.ai",
    pricing: "Open source",
    whatItIs: "LlamaIndex is an open-source framework focused on connecting LLMs to your data. It handles loading documents, indexing, retrieval and query engines for RAG apps and agents. It also offers paid cloud services like LlamaParse for document parsing.",
    whereToUse: [
      "Question answering over PDFs and documents",
      "Building knowledge-base chatbots",
      "Parsing complex documents with tables",
      "Document-based agents"
    ],
    howToUse: [
      "Install with `pip install llama-index` (plus the integration for your model provider).",
      "Set your API key as an environment variable.",
      "Put your documents in a folder and load them with SimpleDirectoryReader.",
      "Create a VectorStoreIndex from the documents.",
      "Create a query engine and ask questions.",
      "Persist the index or connect a vector database for larger data."
    ],
    examplePrompt: "docs = SimpleDirectoryReader('notes').load_data()\nindex = VectorStoreIndex.from_documents(docs)\nprint(index.as_query_engine().query('What is normalization?'))",
    tips: [
      "Great for quickly building a first RAG prototype.",
      "Check retrieved chunks to debug wrong answers."
    ],
    limitations: [
      "Defaults may use a specific provider – configure models explicitly.",
      "Large datasets need a proper vector database.",
      "APIs evolve; use current docs."
    ],
    skills: ["RAG", "Embeddings", "Python"]
  },
  {
    id: "pinecone",
    name: "Pinecone",
    maker: "Pinecone",
    category: "Developer Platforms & APIs",
    url: "https://www.pinecone.io",
    pricing: "Free tier + paid",
    whatItIs: "Pinecone is a managed vector database for storing embeddings and running fast similarity search. It is widely used in RAG systems and semantic search apps.",
    whereToUse: [
      "Semantic search over documents or products",
      "RAG chatbots with large knowledge bases",
      "Recommendation systems",
      "Duplicate detection"
    ],
    howToUse: [
      "Sign up at pinecone.io and create a project.",
      "Create an index with the right dimension (matching your embedding model) or use integrated embeddings.",
      "Get your API key and install the SDK (`pip install pinecone`).",
      "Upsert vectors with IDs and metadata.",
      "Query with an embedding of the user's question to get the most similar items.",
      "Pass the retrieved text to an LLM to generate an answer."
    ],
    examplePrompt: "Store embeddings of 500 course FAQ answers, then query 'How do I reset my password?' and return the top 3 matches.",
    tips: [
      "Use metadata filters (e.g. subject='SQL') to narrow results.",
      "Understand embeddings with the in-app AI Concepts Lab first."
    ],
    limitations: [
      "Free tier has storage and index limits.",
      "Managed cloud service – data leaves your servers.",
      "Search quality depends on your embeddings and chunking."
    ],
    skills: ["Vector Databases", "Embeddings", "RAG"]
  },
  {
    id: "chroma",
    name: "Chroma",
    maker: "Chroma",
    category: "Developer Platforms & APIs",
    url: "https://www.trychroma.com",
    pricing: "Open source",
    whatItIs: "Chroma is an open-source vector database that is very easy to start with. It runs locally inside Python with a few lines of code, and also offers a hosted cloud version.",
    whereToUse: [
      "Learning vector search on your laptop",
      "Small RAG prototypes",
      "Local, private document search",
      "Hackathon projects"
    ],
    howToUse: [
      "Install with `pip install chromadb`.",
      "Create a client: `client = chromadb.Client()` (or PersistentClient to save to disk).",
      "Create a collection.",
      "Add documents with IDs – Chroma can create embeddings automatically.",
      "Query the collection with a question text.",
      "Use the results as context for an LLM."
    ],
    examplePrompt: "col = client.create_collection('notes')\ncol.add(ids=['1','2'], documents=['Primary key uniquely identifies a row', 'A view is a virtual table'])\nprint(col.query(query_texts=['what is a virtual table?'], n_results=1))",
    tips: [
      "Use PersistentClient so data isn't lost when the program stops.",
      "Store metadata like source file and page number."
    ],
    limitations: [
      "Local mode isn't ideal for very large production workloads.",
      "Default embedding model may not suit every language.",
      "You manage backups when self-hosting."
    ],
    skills: ["Vector Databases", "Embeddings", "Python"]
  },

  // ───────────────────────── Open-source & Models ─────────────────────────
  {
    id: "hugging-face",
    name: "Hugging Face",
    maker: "Hugging Face",
    category: "Open-source & Models",
    url: "https://huggingface.co",
    pricing: "Free tier + paid",
    whatItIs: "Hugging Face is the main hub for open-source AI: hundreds of thousands of models, datasets and demo apps (Spaces). Its Transformers library lets you use these models in Python with a few lines of code.",
    whereToUse: [
      "Finding pre-trained models for sentiment, translation, image classification, etc.",
      "Trying AI demos in Spaces without installing anything",
      "Downloading datasets for ML projects",
      "Hosting your own model demo for your portfolio",
      "Fine-tuning models on your data"
    ],
    howToUse: [
      "Create a free account at huggingface.co.",
      "Browse Models and filter by task (e.g. Text Classification).",
      "Open a model card to read its purpose, license and limitations.",
      "Try the model in the widget or a Space.",
      "Install transformers: `pip install transformers torch`.",
      "Use `pipeline('sentiment-analysis')` in Python to run a model.",
      "Create a Space with Gradio to share your own demo."
    ],
    examplePrompt: "from transformers import pipeline\nclf = pipeline('sentiment-analysis')\nprint(clf('The Power BI workshop was really helpful!'))",
    tips: [
      "Always read the model card and license.",
      "Use Google Colab for free GPU when running bigger models."
    ],
    limitations: [
      "Model quality varies widely.",
      "Large models need powerful hardware.",
      "Some models have restrictive or gated licenses."
    ],
    skills: ["Open-source Models", "NLP", "Transformers", "Python"]
  },
  {
    id: "ollama",
    name: "Ollama",
    maker: "Ollama",
    category: "Open-source & Models",
    url: "https://ollama.com",
    pricing: "Open source",
    whatItIs: "Ollama lets you download and run open LLMs (like Llama, Mistral, Gemma, Qwen) on your own computer with simple commands. It also provides a local API so your apps can use these models offline.",
    whereToUse: [
      "Running AI privately without sending data to the cloud",
      "Learning how open models behave",
      "Offline coding or writing help",
      "Local backend for RAG prototypes"
    ],
    howToUse: [
      "Download and install Ollama from ollama.com.",
      "Open a terminal.",
      "Run a model, e.g. `ollama run llama3.2` (it downloads the first time).",
      "Chat with the model in the terminal.",
      "Use `ollama list` to see installed models.",
      "Call the local API at http://localhost:11434 from your apps."
    ],
    examplePrompt: "ollama run llama3.2 \"Explain the difference between DELETE, TRUNCATE and DROP in SQL\"",
    tips: [
      "Start with small models if you have limited RAM.",
      "Pair with Open WebUI for a ChatGPT-like interface."
    ],
    limitations: [
      "Small local models are less capable than top cloud models.",
      "Needs enough RAM/GPU; large models run slowly on laptops.",
      "Check each model's license."
    ],
    skills: ["Open-source Models", "LLMs", "Local AI"]
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    maker: "LM Studio",
    category: "Open-source & Models",
    url: "https://lmstudio.ai",
    pricing: "Free",
    whatItIs: "LM Studio is a desktop app with a friendly interface for discovering, downloading and chatting with open LLMs locally. It can also run a local server compatible with common LLM API formats.",
    whereToUse: [
      "Trying open models without using the command line",
      "Private chat with documents on your PC",
      "Comparing different open models",
      "Local API for development"
    ],
    howToUse: [
      "Download LM Studio from lmstudio.ai and install.",
      "Open the Discover tab and search for a model.",
      "Pick a size that fits your computer's memory and download it.",
      "Load the model and start chatting.",
      "Attach documents to chat with them (if supported in your version).",
      "Start the local server from the Developer tab to use it in code."
    ],
    examplePrompt: "Load a small instruct model and ask: 'Create 5 practice questions on Excel conditional formatting.'",
    tips: [
      "Quantized models (e.g. Q4) use less memory.",
      "Watch the RAM/VRAM indicator before loading."
    ],
    limitations: [
      "Performance depends heavily on your hardware.",
      "Not open-source itself (the app is free to use).",
      "Local models can hallucinate more."
    ],
    skills: ["Open-source Models", "Local AI"]
  },
  {
    id: "meta-llama",
    name: "Llama (open-weight models)",
    maker: "Meta",
    category: "Open-source & Models",
    url: "https://www.llama.com",
    pricing: "Open source",
    whatItIs: "Llama is Meta's family of open-weight large language models. Developers can download the weights (under Meta's license) and run, fine-tune or host them, which made Llama a foundation for much of the open-source AI ecosystem.",
    whereToUse: [
      "Running a private chatbot inside a company",
      "Fine-tuning a model for a specific domain",
      "Learning about open vs closed models",
      "Research and experimentation"
    ],
    howToUse: [
      "Read about the models and license at llama.com.",
      "Request/accept access to the weights on llama.com or Hugging Face.",
      "Run a small version locally with Ollama or LM Studio.",
      "Or use a hosted provider that offers Llama via API.",
      "Test prompts and compare with closed models."
    ],
    examplePrompt: "Compare answers from a local Llama model and Claude for: 'Write a SQL query to find the second-highest salary.'",
    tips: [
      "Smaller variants run on laptops; bigger ones need GPUs.",
      "Read the license terms for commercial use."
    ],
    limitations: [
      "'Open weights' is not the same as fully open source – the license has conditions.",
      "Self-hosting requires infrastructure and safety measures."
    ],
    skills: ["Open-source Models", "LLMs", "Fine-tuning"]
  },
  {
    id: "mistral",
    name: "Mistral AI (Le Chat)",
    maker: "Mistral AI",
    category: "Open-source & Models",
    url: "https://mistral.ai",
    pricing: "Free tier + paid",
    whatItIs: "Mistral AI is a European AI company that releases both open-weight and commercial models. It offers the Le Chat assistant, an API platform and models that can be self-hosted.",
    whereToUse: [
      "Using open-weight models for private deployments",
      "Fast chat assistance through Le Chat",
      "Coding help with Mistral's code models",
      "Comparing providers for a project"
    ],
    howToUse: [
      "Try Le Chat at chat.mistral.ai with a free account.",
      "For development, sign up on Mistral's platform and create an API key.",
      "Or download open-weight models from Hugging Face and run them with Ollama.",
      "Test prompts and compare with other models.",
      "Read each model's license before deployment."
    ],
    examplePrompt: "In Le Chat: 'Summarise the key points of GDPR for a software developer in 6 bullets.'",
    tips: [
      "Good option when data residency in Europe matters.",
      "Small Mistral models run well locally."
    ],
    limitations: [
      "Not all Mistral models are open-weight.",
      "Feature set differs from bigger assistants."
    ],
    skills: ["Open-source Models", "LLMs", "Choosing a Model"]
  },
  {
    id: "google-colab",
    name: "Google Colab",
    maker: "Google",
    category: "Open-source & Models",
    url: "https://colab.research.google.com",
    pricing: "Free tier + paid",
    whatItIs: "Google Colab is a free, browser-based Jupyter notebook that runs Python in the cloud with optional GPU/TPU. It has Gemini built in for code help, and it is the easiest way to run ML and open-source models without a powerful computer.",
    whereToUse: [
      "Running Python, pandas and scikit-learn without installation",
      "Training ML models on free GPUs",
      "Running Hugging Face models and Whisper",
      "Sharing notebooks with classmates and teachers"
    ],
    howToUse: [
      "Open colab.research.google.com and sign in with Google.",
      "Click 'New notebook'.",
      "Type Python code in a cell and press Shift+Enter to run.",
      "Use Runtime > Change runtime type to select a GPU if needed.",
      "Upload files or mount Google Drive to access data.",
      "Use the built-in AI to generate or explain code.",
      "Save to Drive or download as .ipynb."
    ],
    examplePrompt: "import pandas as pd\ndf = pd.read_csv('sales.csv')\ndf.groupby('Region')['Sales'].sum().plot(kind='bar')",
    tips: [
      "Save your work to Drive – sessions reset after inactivity.",
      "Install extra packages with !pip install."
    ],
    limitations: [
      "Free GPU access is limited and not guaranteed.",
      "Runtime disconnects and files are cleared when it resets.",
      "Not for long-running production jobs."
    ],
    skills: ["Python for Data Science", "Machine Learning", "Jupyter Notebooks"]
  }
];
