export default {
  id: "day-42-ai-industries-job-roles-portfolio",
  title: "AI in Industries, AI Job Roles and Building an AI Portfolio",
  module: "Module 7: Careers & Final Project",
  day: 42,
  level: "Beginner",
  duration: "2 hours",
  summary: "See how AI is used across industries (healthcare, finance, retail, manufacturing, education, IT services, media, agriculture, government), understand the main AI job roles - AI engineer, ML engineer, data scientist, data analyst, prompt engineer, AI product manager and others - with the skills and tools each needs, and build a portfolio that proves your skills: 3-5 strong projects on GitHub, a clear README, a short demo, and a LinkedIn profile that tells the story. Use AI tools to plan your learning path and polish your resume honestly.",
  objectives: [
    "Describe real AI use cases in at least six industries",
    "Compare AI job roles by responsibilities, skills, tools and entry paths",
    "Identify your skill gaps for a target role and plan the next 90 days",
    "Plan and document portfolio projects that impress recruiters",
    "Use AI assistants ethically to improve your resume, LinkedIn and interview preparation"
  ],
  theory: [
    {
      heading: "AI Across Industries",
      content: "AI is no longer only for tech companies. Almost every industry uses some mix of classic ML (predictions from tables), computer vision, NLP and generative AI. Knowing the use cases helps you pick projects and speak the language of employers in interviews.",
      points: [
        "Healthcare: reading X-rays and scans (assisting radiologists), predicting patient risk, summarising doctor notes, drug discovery. Strong rules on privacy and human review.",
        "Banking & finance: fraud detection, credit scoring, KYC document checks (OCR), chatbots for customer queries, risk and compliance report drafting.",
        "Retail & e-commerce: product recommendations, demand forecasting, dynamic pricing, AI product descriptions, visual search, customer-support bots.",
        "Manufacturing: predictive maintenance from sensor data, defect detection with cameras, supply-chain optimisation.",
        "Education: personal tutors, automatic question generation, grading assistance, accessibility (speech-to-text, translation).",
        "IT services & software: AI coding assistants (GitHub Copilot, Cursor, Claude Code), test generation, log analysis, internal knowledge chatbots (RAG).",
        "Media & marketing: content drafting, image/video generation, personalisation, social-media analytics.",
        "Agriculture: crop disease detection from leaf photos, yield prediction, weather-based advisories.",
        "Government & public services: document processing, multilingual citizen help-desks, traffic and city planning."
      ],
      tip: "Pick one industry you like and build your portfolio around it - 'AI for retail' or 'AI for education' is more memorable than random projects."
    },
    {
      heading: "AI Job Roles: Who Does What?",
      content: "'Working in AI' covers many different jobs. Think of a film production: some people write the script, some operate cameras, some edit, some manage the budget. Similarly, AI teams have builders, researchers, analysts and product people.",
      points: [
        "AI Engineer (LLM / GenAI engineer): builds applications on top of models like Claude, GPT and Gemini - prompts, RAG, tool use, agents, evaluation, deployment. Skills: Python or JavaScript, APIs, vector databases, LangChain/LlamaIndex, testing. One of the fastest-growing roles.",
        "ML Engineer: trains, deploys and maintains ML models in production (MLOps). Skills: Python, scikit-learn, PyTorch/TensorFlow, Docker, cloud (AWS/Azure/GCP), CI/CD, monitoring.",
        "Data Scientist: answers business questions with data, statistics and ML - experiments, models, insights. Skills: statistics, Python/R, Pandas, SQL, scikit-learn, visualisation, communication.",
        "Data Analyst (AI-enabled): dashboards, reports and analysis with Excel, SQL, Power BI/Tableau - now with Copilot and AI assistants. A common entry point into AI careers.",
        "Prompt Engineer / AI Content Specialist: designs, tests and maintains prompts and AI workflows; often merged into AI engineer or domain roles. Skills: clear writing, evaluation, domain knowledge, basic scripting.",
        "AI Product Manager: decides what AI features to build, defines success metrics, balances users, cost and risk. Skills: product thinking, AI literacy, communication.",
        "Others: Data Engineer (pipelines and data platforms), MLOps engineer, Computer Vision / NLP engineer, AI researcher (usually Master's/PhD), AI ethics / governance specialist, AI trainer / data annotator, AI solutions consultant."
      ]
    },
    {
      heading: "Skills Map and Learning Path",
      content: "Most AI roles share a common foundation; then each specialises. Plan in layers, like building a house: foundation, walls, then interior.",
      points: [
        "Foundation (all roles): Python, SQL, Excel, Git/GitHub, basic statistics, AI literacy (this course), clear communication.",
        "Data path: Pandas, visualisation, Power BI/Tableau, statistics, scikit-learn -> Data Analyst -> Data Scientist.",
        "ML path: NumPy, scikit-learn, model evaluation, PyTorch, Docker, cloud ML services -> ML Engineer.",
        "GenAI path: LLM APIs (Claude, OpenAI, Gemini), prompt engineering, RAG, tool use, agents, evaluation, deployment -> AI Engineer.",
        "Product path: domain knowledge + AI literacy + metrics + stakeholder communication -> AI Product roles.",
        "Certifications can help a resume pass filters (e.g. cloud AI fundamentals certificates from Microsoft, Google or AWS, DeepLearning.AI and Hugging Face courses), but projects matter more than certificates."
      ],
      tip: "Use a 90-day plan: 30 days fundamentals, 30 days one strong project, 30 days a second project + resume + interview practice."
    },
    {
      heading: "Building an AI Portfolio That Gets Interviews",
      content: "A portfolio is proof. Recruiters see hundreds of resumes that say 'knows machine learning'; a link to a working project with a clear README stands out. Quality beats quantity: 3-5 polished projects beat 20 copied tutorials.",
      points: [
        "Solve a real problem for a real user (your college, a local shop, a family business) - not only the Titanic or Iris dataset.",
        "Show variety: one data/ML project (e.g. sales forecasting with scikit-learn), one LLM app (e.g. RAG chatbot built in the AI App Builder), one automation or dashboard project.",
        "README template: problem, users, demo GIF/screenshot or live link, how it works (architecture diagram), tech stack, results/metrics, limitations, what you would improve, how to run.",
        "Show evaluation: test cases, accuracy/F1, before/after examples - this shows maturity.",
        "Deploy: Streamlit Community Cloud, Hugging Face Spaces, Vercel/Netlify, or the standalone HTML exported from the AI App Builder.",
        "Never commit API keys; use .env and .gitignore. Recruiters notice leaked keys - in a bad way.",
        "Write a short LinkedIn post or blog for each project: what you built, one challenge, one lesson."
      ]
    },
    {
      heading: "Resume, LinkedIn and Interviews - Using AI Honestly",
      content: "AI assistants are excellent career coaches when used honestly: improving wording, finding gaps, generating practice questions. They become a problem when they invent experience you do not have - interviewers will ask about every line.",
      points: [
        "Resume bullets: action verb + what you built + technology + measurable result ('Built a RAG help-desk chatbot with Claude API answering 40 FAQ topics; 18/20 test cases passed').",
        "Tailor your resume to each job description - ask AI to list missing keywords, then add only those you genuinely have.",
        "ATS (applicant tracking systems) read simple layouts best: one column, standard headings, no text in images.",
        "LinkedIn: headline with target role and key skills, About section with your story, Featured section with project links.",
        "Interview prep: practise with the Interview Coach template in the AI App Builder (/tools/ai-app-builder) or any chatbot; answer aloud; ask for scoring and feedback.",
        "Disclose AI help if asked; never use AI secretly during a live interview or test that forbids it."
      ]
    }
  ],
  examples: [
    {
      title: "Skill-Gap Checker (Pure Python)",
      scenario: "You want to know which AI role you are closest to today and what to learn next. Write your skills into a set and compare them with common role requirements.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Replace my_skills with your own honest skills (lowercase)",
        "Run again and copy the 'learn next' list into your 90-day plan"
      ],
      code: `# Skill-gap checker: compare your skills with common AI job roles
roles = {
    "Prompt Engineer / AI Content Specialist": ["prompt engineering", "writing", "evaluation", "domain knowledge", "python basics"],
    "Data Analyst (AI-enabled)": ["excel", "sql", "power bi", "python basics", "pandas", "statistics"],
    "ML Engineer": ["python", "pandas", "scikit-learn", "statistics", "deep learning", "git", "deployment"],
    "AI Engineer (LLM apps)": ["python", "llm apis", "prompt engineering", "rag", "evaluation", "git", "deployment"],
}
my_skills = {"excel", "sql", "python basics", "python", "pandas", "prompt engineering", "llm apis", "git"}

results = []
for role, needed in roles.items():
    have = [s for s in needed if s in my_skills]
    missing = [s for s in needed if s not in my_skills]
    results.append((round(100 * len(have) / len(needed)), role, missing))

for match, role, missing in sorted(results, reverse=True):
    print(str(match) + "%", role)
    print("   learn next:", ", ".join(missing) if missing else "nothing - apply now!")`,
      python: {
        files: {
          "main.py": `# Skill-gap checker: compare your skills with common AI job roles
roles = {
    "Prompt Engineer / AI Content Specialist": ["prompt engineering", "writing", "evaluation", "domain knowledge", "python basics"],
    "Data Analyst (AI-enabled)": ["excel", "sql", "power bi", "python basics", "pandas", "statistics"],
    "ML Engineer": ["python", "pandas", "scikit-learn", "statistics", "deep learning", "git", "deployment"],
    "AI Engineer (LLM apps)": ["python", "llm apis", "prompt engineering", "rag", "evaluation", "git", "deployment"],
}
my_skills = {"excel", "sql", "python basics", "python", "pandas", "prompt engineering", "llm apis", "git"}

results = []
for role, needed in roles.items():
    have = [s for s in needed if s in my_skills]
    missing = [s for s in needed if s not in my_skills]
    results.append((round(100 * len(have) / len(needed)), role, missing))

for match, role, missing in sorted(results, reverse=True):
    print(str(match) + "%", role)
    print("   learn next:", ", ".join(missing) if missing else "nothing - apply now!")
`
        },
        stdin: ""
      },
      result: `67% Data Analyst (AI-enabled)
   learn next: power bi, statistics
57% AI Engineer (LLM apps)
   learn next: rag, evaluation, deployment
43% ML Engineer
   learn next: scikit-learn, statistics, deep learning, deployment
40% Prompt Engineer / AI Content Specialist
   learn next: writing, evaluation, domain knowledge`,
      explanation: "Data Analyst: 4 of 6 skills = 67%. AI Engineer: 4 of 7 = 57%. ML Engineer: 3 of 7 = 43%. Prompt Engineer: 2 of 5 = 40%. Results are sorted from best match. The role lists are simplified examples - check real job descriptions on LinkedIn or Naukri and update them. RAG, evaluation and deployment were all covered in Days 32-35 of this course, so the AI Engineer gap is closer than it looks."
    },
    {
      title: "Plan a 90-Day AI Career Roadmap with AI",
      scenario: "You are a final-year student who knows Python basics, SQL and Excel and wants an AI Engineer or Data Analyst role. Ask an AI assistant to build a realistic weekly plan.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Edit the context section with your real skills, time available and target role",
        "Paste the prompt and run it",
        "Check the plan is realistic for your hours; ask a follow-up to shorten or adjust it",
        "Save the plan in a Notion page or Google Sheet and tick weeks off"
      ],
      code: `Role: You are a practical AI career mentor for Indian freshers.
Context: I am a final-year B.Sc. CS student. Skills: Python basics, SQL, Excel, this 45-day AI course (prompting, Claude API, RAG, scikit-learn basics). I can study 2 hours on weekdays and 5 hours on weekends.
Goal: get an entry-level AI Engineer or AI-enabled Data Analyst job in 90 days.
Task: create a 12-week plan.
Format: a table Week | Focus | Learning resources (free) | Deliverable. Then list 3 portfolio projects with one-line descriptions, and a weekly job-application routine.
Constraints: realistic hours, free resources first, every 2 weeks must produce something I can show on GitHub or LinkedIn.`,
      prompt: {
        system: "You are a practical AI career mentor for Indian freshers. You give realistic, specific plans and prefer free resources.",
        user: "Context: I am a final-year B.Sc. CS student. Skills: Python basics, SQL, Excel, this 45-day AI course (prompting, Claude API, RAG, scikit-learn basics). I can study 2 hours on weekdays and 5 hours on weekends.\nGoal: get an entry-level AI Engineer or AI-enabled Data Analyst job in 90 days.\nTask: create a 12-week plan.\nFormat: a table Week | Focus | Learning resources (free) | Deliverable. Then list 3 portfolio projects with one-line descriptions, and a weekly job-application routine.\nConstraints: realistic hours, free resources first, every 2 weeks must produce something I can show on GitHub or LinkedIn."
      },
      result: "A 12-row table such as: Weeks 1-2 Python + Pandas refresh -> cleaned dataset notebook; Weeks 3-4 Power BI/SQL dashboard -> published dashboard; Weeks 5-7 RAG help-desk app with Claude API -> GitHub repo + demo; Weeks 8-9 scikit-learn project with evaluation -> notebook + README; Weeks 10-12 resume, LinkedIn, mock interviews -> applications sent. Plus 3 project ideas and a routine like '10 tailored applications + 2 LinkedIn posts per week'.",
      explanation: "A specific context (skills, hours, goal) makes the plan personal and realistic. The constraint 'every 2 weeks produce something visible' turns learning into portfolio evidence. Review the plan critically - if it promises unrealistic outcomes, ask the AI to revise."
    },
    {
      title: "Write a Portfolio README with AI (Then Fact-check It)",
      scenario: "You built the College Help Desk chatbot in the AI App Builder. Turn your notes into a professional GitHub README.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or any chatbot",
        "Paste your real project notes into the prompt below (only facts you can defend)",
        "Run it, then copy the README into README.md in your GitHub repository",
        "Replace every [placeholder] with real screenshots, links and numbers",
        "Delete anything the AI added that you did not actually do"
      ],
      code: `You are a senior developer who reviews GitHub portfolios for hiring.
Write a README.md for my project using ONLY these facts:
- Name: ABC College Help Desk Bot
- Problem: the college office answers the same fee/timing/hostel questions every day.
- Built with: AI App Builder (system prompt + knowledge base of 5 college documents, top-3 retrieval), Claude API (claude-opus-5-5), exported as a single HTML file.
- Testing: 20 test cases (normal, tricky, unknown, unsafe); 18 passed after 2 rounds of improvement.
- Limitations: knowledge base must be updated manually; users need an API key; English only.
Sections: Title + one-line pitch, Demo, Problem, Features, How it works (simple text diagram), Tech stack, Testing & results, Limitations & responsible AI, Future work, How to run.
Constraints: do not invent numbers or features; use [placeholders] for screenshots and links; under 400 words.`,
      prompt: {
        system: "You are a senior developer who reviews GitHub portfolios for hiring. You never invent facts and use [placeholders] for anything not provided.",
        user: "Write a README.md for my project using ONLY these facts:\n- Name: ABC College Help Desk Bot\n- Problem: the college office answers the same fee/timing/hostel questions every day.\n- Built with: AI App Builder (system prompt + knowledge base of 5 college documents, top-3 retrieval), Claude API (claude-opus-5-5), exported as a single HTML file.\n- Testing: 20 test cases (normal, tricky, unknown, unsafe); 18 passed after 2 rounds of improvement.\n- Limitations: knowledge base must be updated manually; users need an API key; English only.\nSections: Title + one-line pitch, Demo, Problem, Features, How it works (simple text diagram), Tech stack, Testing & results, Limitations & responsible AI, Future work, How to run.\nConstraints: do not invent numbers or features; use [placeholders] for screenshots and links; under 400 words."
      },
      result: "A clean Markdown README with a one-line pitch ('A RAG-powered chatbot that answers ABC College questions 24/7 from official documents'), a [demo GIF] placeholder, a text diagram (User question -> retrieve top-3 chunks -> Claude with system prompt -> grounded answer), a testing section stating 18/20 passed, honest limitations and run instructions.",
      explanation: "Constraining the AI to 'ONLY these facts' prevents it from inventing impressive-sounding but false claims. A README that shows testing results and limitations signals maturity - exactly what hiring managers look for in AI candidates."
    },
    {
      title: "Map Industry Use Cases to Project Ideas",
      scenario: "You want portfolio projects relevant to a target industry. Ask AI for ideas that are small enough to finish in 1-2 weeks and use the tools from this course.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Choose your industry (e.g. retail) and paste the prompt below",
        "Pick the idea with the clearest user and data source",
        "Check the AI Tools Directory (/tools/ai-tools) for any tool it suggests"
      ],
      code: `Act as an AI hiring manager in the RETAIL industry.
Suggest 5 portfolio projects a fresher can finish in 1-2 weeks each using: Python, Pandas, scikit-learn, Power BI, the Claude API, RAG, and no-code tools (Zapier/Make).
For each: project name, the business problem, the data source (public dataset or self-made), the AI technique, how to evaluate it, and what it proves to an employer.
Format: a table. Avoid projects that need private customer data.`,
      prompt: {
        system: "You are an AI hiring manager who values practical, finishable portfolio projects with clear evaluation.",
        user: "I am targeting the RETAIL industry. Suggest 5 portfolio projects a fresher can finish in 1-2 weeks each using: Python, Pandas, scikit-learn, Power BI, the Claude API, RAG, and no-code tools (Zapier/Make).\nFor each: project name, the business problem, the data source (public dataset or self-made), the AI technique, how to evaluate it, and what it proves to an employer.\nFormat: a table. Avoid projects that need private customer data."
      },
      result: "Ideas such as: demand forecasting on a public store-sales dataset (regression, MAE); customer segmentation with k-means on a public online-retail dataset (clusters + business names); product-description generator with Claude and a review checklist; returns-policy RAG chatbot (test-case pass rate); review sentiment dashboard with a Hugging Face model + Power BI.",
      explanation: "Industry-focused projects show employers you understand their problems. Each idea links directly to a day of this course (regression Day 37, clustering Day 39, Hugging Face Day 41, RAG Day 32, App Builder Days 44-45)."
    }
  ],
  tools: [
    { name: "AI Prompt Lab", use: "Career-planning, resume and README prompts", url: "/tools/ai-lab" },
    { name: "AI App Builder", use: "Build portfolio-ready AI apps (and practise with the Interview Coach template)", url: "/tools/ai-app-builder" },
    { name: "AI Tools Directory", use: "Learn what each AI tool does before listing it on your resume", url: "/tools/ai-tools" },
    { name: "GitHub", use: "Host portfolio code and READMEs", url: "https://github.com" },
    { name: "LinkedIn", use: "Professional profile, project posts and job search", url: "https://www.linkedin.com" },
    { name: "Hugging Face Spaces", use: "Free hosting for ML/AI demos (Gradio/Streamlit)", url: "https://huggingface.co/spaces" },
    { name: "Kaggle", use: "Datasets, notebooks and competitions to build ML experience", url: "https://www.kaggle.com" }
  ],
  interview: [
    { q: "What is the difference between an AI engineer, an ML engineer and a data scientist?", a: "A data scientist answers business questions with data, statistics and models. An ML engineer productionises and maintains models (pipelines, deployment, monitoring). An AI engineer builds applications on top of foundation models (LLM APIs, prompts, RAG, agents, evaluation). The roles overlap and titles vary by company.", level: "Easy" },
    { q: "Give three examples of AI in banking.", a: "Fraud detection on transactions, credit risk scoring, KYC document verification with OCR, customer-service chatbots, and AI-assisted compliance report drafting.", level: "Easy" },
    { q: "Why are you interested in an AI career?", a: "A good answer links a genuine interest to evidence: 'I enjoy solving practical problems with data; during my course I built a RAG help-desk bot that answered 18/20 test questions correctly, and I want to build reliable AI products for real users.'", level: "Easy" },
    { q: "Walk me through one project in your portfolio.", a: "Use STAR plus technical depth: the problem and users, your approach and why (model/prompt/RAG choices), how you evaluated it (metrics or test cases), challenges and how you fixed them, results, limitations and next steps.", level: "Medium" },
    { q: "How do you stay up to date in AI?", a: "Follow official model provider docs and changelogs (Anthropic, OpenAI, Google), Hugging Face, newsletters and papers summaries, build small experiments with new features, and join communities - while verifying hype against hands-on tests.", level: "Easy" },
    { q: "What makes a good AI portfolio project?", a: "A real problem and user, working demo, clear README, honest evaluation with numbers or test cases, responsible-AI considerations, clean code without secrets, and a short write-up of what you learned.", level: "Medium" },
    { q: "Is prompt engineering a real job?", a: "Prompting is a core skill in many roles; standalone 'prompt engineer' titles exist but are often merged into AI engineer, content, or domain-specialist roles. The durable skill is designing, evaluating and maintaining AI workflows, not just writing clever prompts.", level: "Medium" },
    { q: "How would you explain AI's value to a small business owner?", a: "Focus on their pain points and measurable outcomes: e.g. answering repeat customer questions 24/7, drafting product descriptions faster, forecasting stock to reduce waste - start small, measure time or money saved, keep a human in the loop.", level: "Medium" },
    { q: "What skills does an AI product manager need?", a: "Understanding of what AI can and cannot do, defining problems and success metrics, data and evaluation literacy, cost/latency trade-offs, risk and responsible AI, and communication between users, engineers and leadership.", level: "Medium" },
    { q: "Which industries do you think AI will change most in the next few years, and why?", a: "A reasoned answer names a few (e.g. software development, customer service, education, healthcare documentation) and explains the mechanism: lots of text/knowledge work, repetitive tasks, available data - while acknowledging regulation, trust and human oversight as limits.", level: "Hard" }
  ],
  practice: [
    {
      task: "Pick three AI job postings (LinkedIn, Naukri, Indeed) for your target role. Copy the required skills into the skill-gap checker and run it with your honest skills.",
      hint: "Normalise skill names to lowercase and merge synonyms (e.g. 'scikit-learn' and 'sklearn').",
      solution: "Expected outcome: a match percentage per posting and a combined 'learn next' list. Skills that appear in all three postings (often Python, SQL, Git, an LLM API, cloud basics) are your top priority for the next 30 days."
    },
    {
      task: "Write 3 resume bullet points for projects you built in this course using the formula: action verb + what + technology + result.",
      hint: "Use real numbers from your work (test cases passed, MAE, dataset size). If you have no number, describe scope instead.",
      solution: "1) Built a RAG help-desk chatbot in the AI App Builder with the Claude API, answering questions from 5 college documents; 18/20 test cases passed. 2) Trained a linear regression model in scikit-learn to predict exam marks from study hours, with MAE of 1.8 marks on held-out data. 3) Segmented sample customers with k-means and summarised clusters for marketing actions."
    },
    {
      task: "Create a GitHub profile README (a repository with your username) that lists your target role, skills and 3 pinned projects.",
      hint: "Keep it short: one-line intro, skills, featured projects with links, contact.",
      solution: "A good profile README has: 'Hi, I'm <name> - aspiring AI Engineer'; skills row (Python, SQL, Pandas, scikit-learn, Claude API, RAG, Power BI); 3 projects with one-line descriptions and demo links; LinkedIn link. Pin the same 3 repositories."
    },
    {
      task: "Use the Interview Coach template in the AI App Builder (/tools/ai-app-builder) to practise 5 questions for your target role. Record your scores and the two weakest answers.",
      hint: "Choose & plan -> Interview Coach -> Test step (add your API key) -> tell it the role and topic.",
      solution: "After the session, write down the weakest topics (e.g. 'precision vs recall', 'explaining RAG simply') and revise them from Days 32 and 38. Repeat the mock interview a week later and compare scores."
    },
    {
      task: "Ask an AI assistant to critique your LinkedIn headline and About section for an AI Engineer role. Accept only suggestions that are true.",
      hint: "Prompt: 'You are a tech recruiter. Critique my headline and About section for entry-level AI Engineer roles. Give 3 improvements and a rewritten version. Do not add skills I did not mention.'",
      solution: "Example improved headline: 'Aspiring AI Engineer | Python, SQL, Claude API, RAG, scikit-learn | Built a college help-desk chatbot'. The About section should tell a short story: background, what you build, 2 project highlights, what role you seek."
    }
  ],
  quiz: [
    {
      question: "Which role mainly builds applications on top of LLM APIs using prompts, RAG and agents?",
      options: ["Data annotator", "AI Engineer", "Database administrator", "Network engineer"],
      answer: 1,
      explanation: "AI (LLM / GenAI) engineers build products on foundation models."
    },
    {
      question: "Predictive maintenance from machine sensor data is a typical AI use case in which industry?",
      options: ["Manufacturing", "Media", "Education", "Fashion design"],
      answer: 0,
      explanation: "Factories predict machine failures before they happen using sensor data."
    },
    {
      question: "What should a strong portfolio README include?",
      options: ["Only the code", "Your API key so others can test it", "A list of every tutorial you watched", "Problem, demo, how it works, results/evaluation and limitations"],
      answer: 3,
      explanation: "Recruiters want to quickly understand the problem, see it working and judge your evaluation and honesty."
    },
    {
      question: "Using AI to write your resume is acceptable when...",
      options: ["it adds skills you plan to learn someday", "it invents impressive metrics", "it improves wording of experience you genuinely have", "it copies another candidate's projects"],
      answer: 2,
      explanation: "AI can polish honest content; inventing experience will fail in interviews and is unethical."
    },
    {
      question: "Which is the best portfolio strategy for a fresher?",
      options: ["20 copied tutorial notebooks", "3-5 polished projects solving real problems with clear evaluation", "Only certificates", "One unfinished large project"],
      answer: 1,
      explanation: "A few polished, evaluated, deployed projects prove skills far better than quantity."
    }
  ]
};
