export default {
  id: "day-21-ai-writing-communication",
  title: "AI for Writing & Communication: Emails, Resumes, Cover Letters, Reports, Social Posts, Translation",
  module: "Module 4: AI Tools for Productivity",
  day: 21,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Use AI tools to write faster and better at work: professional emails, ATS-friendly resumes, tailored cover letters, business reports, social media posts and translations - while keeping your own voice and every fact true.",
  objectives: [
    "Use AI to draft, rewrite and adjust the tone of emails and messages",
    "Tailor a resume and cover letter to a job description without inventing experience",
    "Turn raw data or notes into a structured report",
    "Create platform-specific social media posts",
    "Translate and localise content and know when a human reviewer is required"
  ],
  theory: [
    {
      heading: "How AI fits into the writing process",
      content: "Writing has four stages: plan, draft, revise, polish. AI helps at every stage - brainstorming points, producing a first draft, restructuring, tightening language and fixing grammar. But YOU own the message: the facts, the intent and the relationship with the reader. Analogy: AI is like a skilled typist and editor sitting next to you; you still decide what to say. The biggest time savings come from never starting with a blank page.",
      points: [
        "Plan: 'Give me 5 angles for this announcement'",
        "Draft: 'Write a first draft using these bullet points'",
        "Revise: 'Make it shorter, more direct, put the request first'",
        "Polish: 'Fix grammar only, do not change meaning'"
      ]
    },
    {
      heading: "AI writing tools - what they are and where they're used",
      content: "General chat assistants (Claude, ChatGPT, Gemini, Copilot) handle most writing. In addition, writing features are built into the tools you already use, so you can write without switching apps.",
      points: [
        "Microsoft 365 Copilot in Word and Outlook - 'Draft with Copilot', 'Coaching by Copilot' for tone, summarising long email threads. Used by corporate employees daily.",
        "Gemini in Gmail and Google Docs - 'Help me write', 'Refine' (formalise, shorten, elaborate). Used in Google Workspace companies and by students.",
        "Grammarly - grammar, clarity and tone suggestions in browsers and apps, with generative AI features. Used for emails, essays and LinkedIn posts.",
        "Canva Magic Write / Notion AI - writing inside design and notes tools (Days 24 and 26).",
        "LinkedIn's AI writing features - help draft profile sections and posts (availability varies).",
        "Google Translate and DeepL - fast translation; DeepL is popular for European languages; LLMs handle tone-aware translation and Indian languages reasonably well but still need review."
      ]
    },
    {
      heading: "Emails and workplace messages",
      content: "For emails, give the AI: who you're writing to and your relationship, the purpose, key facts, the desired action, and the tone. Use tone controls: 'firm but polite', 'apologetic without admitting fault', 'friendly, informal'. For replies, paste the received email in tags and state your decision - the AI should not decide for you.",
      syntax: `Write a reply to the email in <email> tags.
My decision: [approve / decline / need more info]
Key facts: ...
Tone: ...   Length: max ... words
End with a clear next step.`,
      tip: "Put the main point or request in the first two lines. Busy managers read on phones."
    },
    {
      heading: "Resumes and cover letters - honest tailoring",
      content: "Recruiters often use Applicant Tracking Systems (ATS) that scan for relevant skills. AI helps you match your REAL experience to a job description: highlight relevant projects, use the employer's terminology, and rewrite bullets in the action + task + result format. It must never add skills, companies, numbers or certifications you don't have - that is dishonest and is usually exposed in interviews. A cover letter should connect 2-3 of your genuine achievements to the company's needs.",
      points: [
        "Give the AI: your current resume + the job description",
        "Ask for: gap analysis (what matches, what's missing), keyword suggestions, rewritten bullets",
        "Rule in every prompt: 'Do not add anything that is not in my resume; ask me for numbers instead of inventing them'",
        "Keep the format simple (no tables/images) for ATS readability",
        "Remove phone/address before uploading to public tools if you are concerned about privacy"
      ]
    },
    {
      heading: "Reports and documents",
      content: "AI is great at turning raw notes or data into structured reports: executive summary, findings, analysis, recommendations. Provide the data and the audience, specify sections and length, and require that all numbers come from your data. For longer documents, work section by section (prompt chaining, Day 17). Copilot in Word can draft from referenced files; Claude and ChatGPT can create the document from uploaded files.",
      syntax: `Audience: senior management (5-minute read)
Sections: Executive Summary (3 lines), Key Findings (bullets), Risks, Recommendations
Rules: use only numbers in <data>; mark any assumption clearly`
    },
    {
      heading: "Social media and translation",
      content: "Each platform has its own style: LinkedIn (professional, story + lesson), Instagram (short, visual, hashtags), X/Twitter (very short), WhatsApp broadcasts (direct, conversational). Ask for platform-specific versions of one message. For translation, LLMs can keep tone and adapt idioms (localisation), not just convert words. For legal, medical, government or published content, a fluent human reviewer must check the translation.",
      points: [
        "Ask for '3 variations' and choose - don't post the first draft",
        "Specify hashtag count and emoji usage",
        "For translation, specify the formality level (aap vs tum in Hindi) and target audience",
        "Disclose AI-generated content where your company or platform requires it"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Replying to an angry client email",
      scenario: "A delivery delay has upset a client. The BAD prompt produces an over-apologetic reply that promises things the company can't deliver. The GOOD prompt gives facts, the decision and tone.",
      steps: [
        "Open Outlook with Copilot ('Draft with Copilot'), Gmail with Gemini ('Help me write'), or claude.ai / ChatGPT",
        "Run the BAD prompt and notice invented promises like 'free replacement' or 'refund'",
        "Paste the GOOD prompt with the client's email in tags",
        "Review the draft, check every fact and date, then send from your email client"
      ],
      code: `BAD PROMPT:
reply to angry client sorry for delay

GOOD PROMPT:
Write a reply to the client email in <email> tags.
Facts: Shipment of 200 office chairs was delayed because our supplier's factory had a
2-day power outage. New dispatch date: 21 Nov; delivery by 23 Nov. We will share the
tracking link on dispatch. We can offer free installation (normally Rs 50 per chair).
Do not offer refunds or other compensation.
Tone: sincere, professional, accountable but not grovelling.
Length: max 130 words. Start with the apology and new date in the first 2 lines.

<email>
This is unacceptable. Our new office opens on 20 Nov and we still don't have the chairs
you promised by 15 Nov. What are you going to do about it? - Anil Kapoor, Admin Head, Zeta Tech
</email>`,
      prompt: {
        system: "You are a customer account manager at an office furniture company. Write sincere, professional emails. Never promise anything that is not in the provided facts.",
        user: "Write a reply to the client email in <email> tags.\nFacts: Shipment of 200 office chairs was delayed because our supplier's factory had a 2-day power outage. New dispatch date: 21 Nov; delivery by 23 Nov. We will share the tracking link on dispatch. We can offer free installation (normally Rs 50 per chair). Do not offer refunds or other compensation.\nTone: sincere, professional, accountable but not grovelling.\nLength: max 130 words. Start with the apology and new date in the first 2 lines.\n\n<email>\nThis is unacceptable. Our new office opens on 20 Nov and we still don't have the chairs you promised by 15 Nov. What are you going to do about it? - Anil Kapoor, Admin Head, Zeta Tech\n</email>"
      },
      result: `Subject: Your chair order - new delivery date 23 Nov

Dear Mr. Kapoor,

I sincerely apologise for the delay. Your 200 chairs will be dispatched on 21 November and delivered by 23 November.

The delay was caused by a 2-day power outage at our supplier's factory. We understand this affects your office opening on 20 November, and we take full responsibility for keeping you informed.

To make the setup easier, we will install all 200 chairs free of charge on delivery. I will share the tracking link as soon as the shipment leaves our warehouse.

Please call me directly if you need anything before then.

Warm regards,
Neha Kulkarni
Key Account Manager`,
      explanation: "The GOOD prompt controls the facts (no invented refunds), the order of information (apology + date first) and tone. The client gets a clear answer in the first two lines. Always check that every promise in an AI-drafted email is something your company actually approved."
    },
    {
      title: "Tailoring a resume to a job description - honestly",
      scenario: "Pooja, a fresher, is applying for a Junior Data Analyst role. She asks AI for a gap analysis and stronger bullets based on her real project - without fake experience.",
      steps: [
        "Copy the job description from the job portal (Naukri, LinkedIn, company site)",
        "Copy your resume text (remove phone and address if using a public tool)",
        "Open claude.ai (or ChatGPT / Gemini) and paste the prompt with both texts",
        "Answer any questions the AI asks for numbers you actually know",
        "Update your resume in Word/Google Docs; keep simple formatting for ATS"
      ],
      code: `You are a career coach for freshers in India. Help me tailor my resume honestly.

<job_description>
Junior Data Analyst - Pune. Skills: SQL, Excel (PivotTables, lookups), Power BI or Tableau,
data cleaning, communicating insights. Nice to have: Python.
</job_description>

<resume_bullets>
- Made a dashboard in Power BI for college project on sales data
- Know SQL and Excel
- Did data cleaning in Excel
</resume_bullets>

Tasks:
1. Gap analysis table: JD skill | Evidence in my resume | Gap
2. Rewrite my bullets in Action + Task + Result format using JD keywords.
3. Do NOT invent tools, numbers or experience. Where a number would help, put [ASK: ...].`,
      prompt: {
        system: "You are an honest career coach for freshers in India. Never invent experience, tools, numbers or certifications. Use [ASK: ...] placeholders when a number or detail is needed.",
        user: "<job_description>\nJunior Data Analyst - Pune. Skills: SQL, Excel (PivotTables, lookups), Power BI or Tableau, data cleaning, communicating insights. Nice to have: Python.\n</job_description>\n\n<resume_bullets>\n- Made a dashboard in Power BI for college project on sales data\n- Know SQL and Excel\n- Did data cleaning in Excel\n</resume_bullets>\n\nTasks:\n1. Gap analysis table: JD skill | Evidence in my resume | Gap\n2. Rewrite my bullets in Action + Task + Result format using JD keywords.\n3. Do NOT invent tools, numbers or experience. Where a number would help, put [ASK: ...]."
      },
      result: `1. Gap analysis
| JD skill               | Evidence in your resume          | Gap                                   |
|------------------------|----------------------------------|---------------------------------------|
| SQL                    | "Know SQL" (no example)          | Add a concrete SQL task you did       |
| Excel (Pivots, lookups)| "Know Excel", data cleaning      | Mention PivotTables / XLOOKUP if used |
| Power BI or Tableau    | Power BI sales dashboard         | Strong - add details                  |
| Data cleaning          | Data cleaning in Excel           | Add what you cleaned and how much     |
| Communicating insights | Not shown                        | Add an insight you presented          |
| Python (nice to have)  | Not mentioned                    | Add only if you have actually used it |

2. Rewritten bullets
- Built an interactive Power BI sales dashboard for a college project analysing [ASK: number of rows/months] of sales data, with slicers for region and product.
- Cleaned and standardised [ASK: number] rows of raw sales data in Excel by removing duplicates and fixing inconsistent city names, preparing it for analysis.
- Wrote SQL queries using [ASK: e.g. JOIN, GROUP BY] to summarise sales by [ASK: category/region].
- Presented key findings, such as [ASK: one insight, e.g. top-selling category], to faculty reviewers. (Keep only if true.)`,
      explanation: "The [ASK] placeholders force Pooja to supply real numbers instead of AI-invented ones like '50,000 rows' or 'improved sales by 20%'. Interviewers often ask about every resume line, so honesty protects you. The gap table also tells her what to learn or build next."
    },
    {
      title: "From raw data to a management report",
      scenario: "An operations executive must send a monthly customer-support report to the operations head. He pastes the numbers and asks for a structured 1-page report.",
      steps: [
        "Export the month's numbers from your helpdesk tool or Excel",
        "Open Copilot in Word ('Draft with Copilot'), or claude.ai / ChatGPT",
        "Paste the prompt with the data inside <data> tags",
        "Check every number and percentage against the source",
        "Paste into the company report template and add charts from Excel/Power BI"
      ],
      code: `Write a 1-page monthly support report for the Operations Head.

<data>
Month: October 2026 (September in brackets)
Tickets received: 4,820 (4,150)
Resolved within SLA (24h): 86% (91%)
Average first response time: 3.2 h (2.1 h)
CSAT: 4.1/5 (4.3/5)
Top categories: Payment failures 31%, Delivery delays 27%, Refunds 18%
Context: Festive sale 20-26 Oct; 3 agents on leave; payment gateway outage on 22 Oct (5 hours)
</data>

Sections: Executive Summary (max 3 lines), Key Metrics table (Oct, Sep, Change),
What Happened, Recommendations (3 bullets). Use only the numbers above.`,
      prompt: {
        system: "You are an operations analyst who writes concise management reports. Use only numbers provided. Calculate changes accurately; percentage-point changes for percentages.",
        user: "Write a 1-page monthly support report for the Operations Head.\n\n<data>\nMonth: October 2026 (September in brackets)\nTickets received: 4,820 (4,150)\nResolved within SLA (24h): 86% (91%)\nAverage first response time: 3.2 h (2.1 h)\nCSAT: 4.1/5 (4.3/5)\nTop categories: Payment failures 31%, Delivery delays 27%, Refunds 18%\nContext: Festive sale 20-26 Oct; 3 agents on leave; payment gateway outage on 22 Oct (5 hours)\n</data>\n\nSections: Executive Summary (max 3 lines), Key Metrics table (Oct, Sep, Change), What Happened, Recommendations (3 bullets). Use only the numbers above."
      },
      result: `Executive Summary
October ticket volume rose 16% due to the festive sale and a 5-hour payment gateway outage. With 3 agents on leave, SLA compliance fell to 86% and response time rose to 3.2 hours. Customer satisfaction dipped slightly to 4.1/5.

Key Metrics
| Metric                    | Oct   | Sep   | Change     |
|---------------------------|-------|-------|------------|
| Tickets received          | 4,820 | 4,150 | +16.1%     |
| Resolved within SLA       | 86%   | 91%   | -5 pts     |
| Avg first response time   | 3.2 h | 2.1 h | +1.1 h     |
| CSAT                      | 4.1   | 4.3   | -0.2       |

What Happened
- Festive sale (20-26 Oct) increased order volume and related queries.
- Payment gateway outage on 22 Oct drove payment-failure tickets, the top category at 31%.
- Three agents on leave reduced capacity during peak days.

Recommendations
- Plan festive-season staffing in advance and restrict leave during sale weeks.
- Create a ready-made outage response (auto-reply + status page) for payment failures.
- Add self-service refund status tracking to reduce refund tickets (18%).`,
      explanation: "Check: (4820 - 4150) / 4150 = 16.1%. The prompt asked for percentage-point changes for percentages (86% vs 91% = -5 pts, not -5.5%), a detail AI often gets wrong unless told. Charts are better made in Excel or Power BI from the real data."
    },
    {
      title: "One message, three platforms + Hindi translation",
      scenario: "A training institute announces a free weekend Power BI workshop. The marketing intern needs a LinkedIn post, an Instagram caption and a WhatsApp broadcast in Hindi.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini / Canva Magic Write)",
        "Paste the prompt with the event facts",
        "Pick the best version, adjust wording to your institute's voice",
        "Ask a Hindi-speaking colleague to check the WhatsApp message before broadcasting"
      ],
      code: `Event facts: Free Power BI workshop for beginners, Saturday 6 Dec 2026, 10 AM-1 PM,
online on Zoom, certificate of participation, register at the link in bio / [LINK].

Write:
1. LinkedIn post (max 100 words, professional, 3 hashtags)
2. Instagram caption (max 40 words, 2 emojis, 5 hashtags)
3. WhatsApp broadcast in simple Hindi (Devanagari), friendly "aap" tone, max 50 words, include [LINK]`,
      prompt: {
        system: "You are a social media manager for an IT training institute in India. Adapt the message for each platform's style. Never change the event facts.",
        user: "Event facts: Free Power BI workshop for beginners, Saturday 6 Dec 2026, 10 AM-1 PM, online on Zoom, certificate of participation, register at the link in bio / [LINK].\n\nWrite:\n1. LinkedIn post (max 100 words, professional, 3 hashtags)\n2. Instagram caption (max 40 words, 2 emojis, 5 hashtags)\n3. WhatsApp broadcast in simple Hindi (Devanagari), friendly \"aap\" tone, max 50 words, include [LINK]"
      },
      result: `1. LinkedIn
Want to turn Excel data into clear, interactive dashboards?

Join our free beginner-friendly Power BI workshop on Saturday, 6 December 2026, from 10 AM to 1 PM on Zoom. You'll learn to import data, build your first report and share insights - no prior experience needed.

Every participant receives a certificate of participation.

Register here: [LINK]

#PowerBI #DataAnalytics #CareerGrowth

2. Instagram
Excel to dashboards in 3 hours! 📊 Free Power BI workshop for beginners - Sat, 6 Dec, 10 AM-1 PM on Zoom. Certificate included 🎓 Link in bio!
#PowerBI #DataAnalytics #FreeWorkshop #LearnOnline #CareerSkills

3. WhatsApp (Hindi)
नमस्ते! क्या आप Power BI सीखना चाहते हैं?
शनिवार, 6 दिसंबर 2026 को सुबह 10 से 1 बजे तक Zoom पर हमारा मुफ़्त Power BI वर्कशॉप है। शुरुआती लोगों के लिए, सर्टिफ़िकेट के साथ।
अभी रजिस्टर करें: [LINK]`,
      explanation: "One set of facts becomes three platform-appropriate messages. Facts (date, time, Zoom, certificate) stay identical - always check that. The Hindi uses the respectful 'aap' form as requested; a native speaker should still review translations before a mass broadcast."
    }
  ],
  tools: [
    { name: "Microsoft 365 Copilot (Word, Outlook)", use: "Draft and rewrite documents and emails, coaching on tone, summarise long threads inside Office apps", url: "https://www.microsoft.com/microsoft-365/copilot" },
    { name: "Gemini in Gmail / Google Docs", use: "'Help me write' and 'Refine' to draft, formalise, shorten or elaborate text", url: "https://workspace.google.com/products/gemini/" },
    { name: "Claude", use: "Long-form writing, resume tailoring, reports from data, tone-aware translation", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Drafting emails, social posts and cover letters; multiple variations", url: "https://chatgpt.com" },
    { name: "Grammarly", use: "Grammar, clarity and tone checks across browsers and apps, with generative features", url: "https://www.grammarly.com" },
    { name: "DeepL", use: "High-quality machine translation with formality options for many languages", url: "https://www.deepl.com" },
    { name: "Google Translate", use: "Quick translation across a very wide range of languages, including Indian languages", url: "https://translate.google.com" }
  ],
  interview: [
    { q: "How can AI improve workplace writing without replacing the writer?", a: "AI speeds up planning, drafting, restructuring and polishing, but the writer owns facts, decisions, intent and relationships, and reviews everything before sending.", level: "Easy" },
    { q: "What details should you give an AI to write a good email?", a: "Recipient and relationship, purpose, key facts, your decision or request, desired tone, length limit and the next step you want the reader to take.", level: "Easy" },
    { q: "Is it acceptable to use AI to write a resume?", a: "Yes, for structure, wording and keyword alignment, as long as every claim is true. Inventing skills, numbers or experience is dishonest and is usually exposed in interviews or background checks.", level: "Easy" },
    { q: "What is an ATS and how does AI help with it?", a: "An Applicant Tracking System stores and screens resumes, often matching keywords and skills. AI can compare your resume to a job description, suggest relevant keywords you genuinely have and keep formatting simple for parsing.", level: "Medium" },
    { q: "How do you stop AI from making promises in customer emails?", a: "Provide the exact facts and allowed offers, explicitly forbid other commitments ('no refunds or compensation'), and review the draft before sending.", level: "Medium" },
    { q: "Percentage change vs percentage-point change - why does it matter in AI-written reports?", a: "Going from 91% to 86% is a 5 percentage-point drop but about a 5.5% relative drop. AI may mix them up; specify which you want and verify calculations.", level: "Medium" },
    { q: "What is localisation vs translation?", a: "Translation converts words; localisation adapts tone, idioms, formality, units and cultural references for the target audience. LLMs can localise, but critical content needs native review.", level: "Medium" },
    { q: "When must a human review AI translations?", a: "For legal, medical, financial, government, safety and published marketing content, or any content where errors could cause harm or embarrassment.", level: "Easy" },
    { q: "What privacy precautions apply when using AI for writing?", a: "Use approved tools for work content, remove personal identifiers (phone, address, customer details), avoid pasting confidential documents into personal accounts, and follow company AI policy.", level: "Medium" },
    { q: "How would you keep a consistent brand voice across a team using AI?", a: "Create a brand style guide, build a shared Custom GPT / Gem / Claude Project with the guide and examples, provide templates, and review outputs regularly against the guide.", level: "Hard" }
  ],
  practice: [
    { task: "Use AI to write a follow-up email after an interview, mentioning one specific topic discussed.", hint: "Give the interviewer name, role, date and the topic; max 100 words.", solution: "Prompt: 'Write a thank-you email to Ms. Shah after my 18 Nov interview for Junior Analyst. Mention our discussion about Power BI row-level security. Polite, max 100 words, end by expressing continued interest.'" },
    { task: "Paste a real job description and your resume into a chat assistant and get a gap analysis with [ASK] placeholders. Fill in the real numbers.", hint: "Use the honest-tailoring prompt from Example 2.", solution: "Expected output: a gap table plus rewritten bullets; you replace each [ASK] with true values or delete the bullet." },
    { task: "Turn 6 bullet points from a college event into a 150-word report for the principal.", hint: "Sections: Summary, Highlights, Participation numbers, Next steps.", solution: "Provide the facts in <notes>, ask for the 4 sections, and check every number in the final text." },
    { task: "Write one announcement and ask AI for LinkedIn, Instagram and WhatsApp versions, plus a translation into your regional language. Get a native speaker to rate the translation.", hint: "Specify formality and character limits.", solution: "Typical feedback: the meaning is correct but some words sound formal or 'bookish'; ask the AI to use everyday words." },
    { task: "Try 'Help me write' in Gmail or 'Draft with Copilot' in Outlook/Word (if available) for a leave request, and compare with a claude.ai draft.", hint: "Use the same facts in both.", solution: "Built-in tools are faster (no copy-paste); chat assistants allow more detailed instructions. Choose based on convenience and company policy." }
  ],
  quiz: [
    { question: "What is the most important rule when using AI to improve your resume?", options: ["Add as many skills as possible", "Never add experience, numbers or skills you don't actually have", "Use colourful tables", "Copy the job description word for word"], answer: 1, explanation: "Honesty matters; invented claims are exposed in interviews." },
    { question: "Which built-in tool drafts emails inside Gmail?", options: ["Gemini 'Help me write'", "Midjourney", "Power Query", "Copilot Studio"], answer: 0, explanation: "Gemini in Gmail offers 'Help me write' and 'Refine'." },
    { question: "SLA fell from 91% to 86%. The correct description is:", options: ["5% relative drop", "86 percentage points drop", "No change", "5 percentage-point drop"], answer: 3, explanation: "The difference between two percentages is measured in percentage points." },
    { question: "Adapting a message's tone, idioms and formality for another language audience is called:", options: ["Tokenisation", "Fine-tuning", "Localisation", "Compression"], answer: 2, explanation: "Localisation goes beyond word-for-word translation." },
    { question: "In an angry-customer reply drafted by AI, you should:", options: ["Send immediately", "Let the AI decide the compensation", "Provide facts and allowed offers, then review every promise before sending", "Make it as long as possible"], answer: 2, explanation: "You control facts and commitments; AI only drafts." }
  ]
};
