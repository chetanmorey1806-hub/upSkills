export default {
  id: "day-43-responsible-ai-at-work",
  title: "Responsible AI at Work: Company Policies, Data Privacy, Copyright, Disclosure and Human Review",
  module: "Module 7: Careers & Final Project",
  day: 43,
  level: "Beginner",
  duration: "2 hours",
  summary: "Day 6 introduced responsible AI as an idea; today makes it practical for your first job. Learn what a company AI-use policy contains, which data must never go into public AI tools (personal, confidential, client and regulated data), how to redact before prompting, how consumer and enterprise AI tools differ in data handling, the basics of copyright and licences for AI-generated content and code, when and how to disclose AI use, and why human review is required before AI output reaches customers or decisions. Finish with a traffic-light decision checklist you can use every day at work.",
  objectives: [
    "Explain the purpose and typical contents of a workplace AI-use policy",
    "Classify data as safe or unsafe to share with AI tools and redact sensitive details",
    "Describe copyright, licensing and attribution risks of AI-generated text, images and code",
    "Decide when to disclose AI assistance and how to word it",
    "Apply human-in-the-loop review and a traffic-light checklist before using AI output"
  ],
  theory: [
    {
      heading: "Why Companies Have AI-Use Policies",
      content: "AI tools make employees faster, but one careless prompt can leak customer data, break a contract or publish false information under the company's name. An AI-use policy is like the safety rules in a chemistry lab: they do not stop the experiments, they stop the explosions.",
      points: [
        "Approved tools: which AI tools are allowed (often enterprise versions such as Claude for Work/Enterprise, ChatGPT Enterprise/Team, Microsoft 365 Copilot, Gemini for Google Workspace) and which are banned for work data.",
        "Data rules: what may never be entered (customer personal data, passwords, source code of certain projects, financial results before release, client documents under NDA).",
        "Use cases: allowed (drafting, summarising public info, coding help with review), restricted (HR decisions, legal advice, medical content), forbidden (deepfakes, surveillance of staff).",
        "Review & accountability: a human owns every output; AI is never the decision-maker for hiring, firing, credit or medical decisions.",
        "Disclosure: when to tell clients, readers or managers that AI was used.",
        "Incident reporting: what to do if sensitive data was pasted by mistake (report immediately - hiding it is worse).",
        "Regulations shape these policies: data-protection laws (e.g. India's Digital Personal Data Protection Act, Europe's GDPR) and AI-specific rules such as the EU AI Act, which classifies uses by risk."
      ],
      tip: "On your first day at a new job, ask: 'Is there an AI-use policy, and which AI tools are approved?' It shows maturity."
    },
    {
      heading: "Data Privacy: What Never Goes into a Prompt",
      content: "Treat a public chatbot like a stranger on a train: helpful, but you would not hand them a customer file. Whether your input is stored, reviewed or used to improve models depends on the tool, plan and settings - so the safe default is to share the minimum.",
      points: [
        "Personal data (PII): names with contact details, phone numbers, email addresses, Aadhaar/PAN/passport numbers, addresses, photos of people, health or financial details.",
        "Confidential business data: unreleased financials, strategy, pricing, contracts, client data under NDA, proprietary source code, credentials and API keys.",
        "Consumer vs enterprise: enterprise/business plans usually offer contractual commitments (e.g. not training on your data, admin controls, data retention settings). Consumer free plans may have different defaults - read the privacy settings.",
        "Redact or anonymise: replace real values with placeholders ([NAME], [EMAIL]) or use fake sample data that has the same structure.",
        "Data minimisation: share only what the task needs - to fix a formula you need the column names, not 10,000 customer rows.",
        "For apps you build: tell users not to enter personal data, avoid logging sensitive inputs, store API keys in environment variables."
      ]
    },
    {
      heading: "Copyright, Licences and Ownership",
      content: "Copyright law around AI is still evolving and differs by country, so companies play safe. Think of AI output as a draft from an unknown source: useful, but you must check it before claiming or publishing it.",
      points: [
        "Inputs: do not upload copyrighted material you have no right to use (paid books, client designs, licensed images) into tools that may store it.",
        "Outputs: AI text, images or code can resemble existing works. Avoid prompts like 'in the exact style of <living artist>' or 'copy this logo' for commercial work.",
        "Ownership: in many jurisdictions, purely AI-generated content may not receive copyright protection on its own; human creative contribution matters. Check your company's legal guidance.",
        "Code: AI-suggested code may match open-source code under licences (GPL, MIT, Apache). Many coding tools offer filters for public-code matches; your company may require licence scanning.",
        "Tool terms: each AI tool's terms state who owns outputs and whether commercial use is allowed; some image tools (e.g. Adobe Firefly) emphasise training on licensed content for commercial safety.",
        "Model licences: open models on Hugging Face have licences - some forbid commercial use (Day 41)."
      ]
    },
    {
      heading: "Disclosure and Transparency",
      content: "Disclosure means being honest about AI's role when it matters to the reader, client or decision. It is not about labelling every spell-check; it is about not misleading people.",
      points: [
        "Disclose when: content is published under your or the company's name and AI wrote a substantial part; a client is paying for human expertise; academic work (follow your institution's rules); AI chatbots talking to customers (users should know they are talking to AI); synthetic images, voices or video of real-looking people.",
        "Example wording: 'This report was drafted with the help of an AI assistant and reviewed and edited by [name].' or 'You are chatting with an AI assistant. A human agent is available on request.'",
        "Never present AI-generated quotes, statistics or references as verified without checking them.",
        "Deepfakes and voice cloning of real people require consent - and are illegal or banned by policy in many contexts (Day 25)."
      ]
    },
    {
      heading: "Human Review: The Human in the Loop",
      content: "AI is a powerful junior assistant that is sometimes confidently wrong (hallucinations), biased or out of date. Human review means a qualified person checks AI output before it reaches customers or influences important decisions. Analogy: autopilot flies the plane most of the time, but a trained pilot monitors and takes over when needed.",
      points: [
        "Higher stakes = deeper review: a social-media caption needs a quick read; a contract clause, medical text, salary decision or production code needs expert review and testing.",
        "Check facts, numbers, names, dates, links and citations against original sources.",
        "Check tone, bias and fairness - especially in hiring, lending and customer communication.",
        "Code: run tests, review security (injection, secrets), check licences before merging.",
        "Automation bias: people tend to trust machine output too much. Actively look for errors instead of skimming.",
        "Accountability stays with the human and the company: 'the AI wrote it' is never an acceptable excuse."
      ]
    },
    {
      heading: "The Traffic-Light Checklist",
      content: "Before using AI for a work task, run a quick traffic-light check.",
      syntax: `GREEN  - go ahead (still review):
  public or fake data, low-stakes drafts, brainstorming, learning, summarising public documents,
  approved tool, output reviewed before use

AMBER  - proceed with care (redact, use the approved enterprise tool, get review/approval):
  internal documents, client-facing emails, code for production, anything published under the company name,
  decisions affecting people (shortlisting, performance notes)

RED    - stop (do not use AI, or only with explicit legal/compliance approval):
  customer personal data in an unapproved tool, credentials/API keys, confidential deals,
  medical/legal/financial advice without expert review, deepfakes of real people, final automated decisions about people`,
      points: [
        "Ask: What data am I sharing? Is the tool approved? Who will see the output? What happens if it is wrong? Who reviews it?",
        "If unsure, ask your manager or the security/compliance team - asking is always cheaper than an incident.",
        "Add this checklist to the 'Limitations & responsible AI' section of your final project in the AI App Builder (Days 44-45)."
      ]
    }
  ],
  examples: [
    {
      title: "Redact Personal Data Before Prompting (Pure Python)",
      scenario: "A support agent wants AI to draft an apology email for a complaint. The complaint text contains a name, email, phone number and PAN. Redact them first, then send only the safe version to the AI.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Check that every personal detail is replaced with a placeholder",
        "Paste the redacted text into the AI Prompt Lab (/tools/ai-lab) with the request 'draft a polite apology email'",
        "After the AI replies, put the real customer name back in yourself"
      ],
      code: `# Redact personal data BEFORE pasting text into any AI tool
import re

text = ("Customer Priya Sharma (priya.sharma@example.com, phone 9876543210) "
        "complained that order ORD-55821 arrived late. PAN: ABCDE1234F. "
        "Please draft a polite apology email.")

patterns = {
    "[EMAIL]": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}",
    "[PHONE]": r"(?<![0-9])[6-9][0-9]{9}(?![0-9])",
    "[PAN]":   r"[A-Z]{5}[0-9]{4}[A-Z]",
}
names = ["Priya Sharma"]          # names you know are in the text

redacted = text
counts = {}
for label, pattern in patterns.items():
    redacted, n = re.subn(pattern, label, redacted)
    counts[label] = n
for name in names:
    counts["[NAME]"] = redacted.count(name)
    redacted = redacted.replace(name, "[NAME]")

print(redacted)
print("replacements:", counts)`,
      python: {
        files: {
          "main.py": `# Redact personal data BEFORE pasting text into any AI tool
import re

text = ("Customer Priya Sharma (priya.sharma@example.com, phone 9876543210) "
        "complained that order ORD-55821 arrived late. PAN: ABCDE1234F. "
        "Please draft a polite apology email.")

patterns = {
    "[EMAIL]": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}",
    "[PHONE]": r"(?<![0-9])[6-9][0-9]{9}(?![0-9])",
    "[PAN]":   r"[A-Z]{5}[0-9]{4}[A-Z]",
}
names = ["Priya Sharma"]          # names you know are in the text

redacted = text
counts = {}
for label, pattern in patterns.items():
    redacted, n = re.subn(pattern, label, redacted)
    counts[label] = n
for name in names:
    counts["[NAME]"] = redacted.count(name)
    redacted = redacted.replace(name, "[NAME]")

print(redacted)
print("replacements:", counts)
`
        },
        stdin: ""
      },
      result: `Customer [NAME] ([EMAIL], phone [PHONE]) complained that order ORD-55821 arrived late. PAN: [PAN]. Please draft a polite apology email.
replacements: {'[EMAIL]': 1, '[PHONE]': 1, '[PAN]': 1, '[NAME]': 1}`,
      explanation: "Each regular expression finds one type of personal data: the email pattern (text@domain.tld), a 10-digit Indian mobile number starting 6-9 (not part of a longer number), and the PAN format (5 letters, 4 digits, 1 letter). Names cannot be found reliably with a pattern, so known names are replaced from a list. The order ID stays because the AI needs it for context and it is not personal. Real companies use dedicated data-loss-prevention (DLP) tools, but the principle is the same: redact first, prompt second, re-insert details yourself."
    },
    {
      title: "Draft a Team AI-Use Policy with AI",
      scenario: "Your 15-person marketing team has no AI rules. Your manager asks you to draft a one-page policy for discussion with HR and legal.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or your company's approved AI tool",
        "Paste the prompt below and run it",
        "Compare the draft with the theory sections (tools, data, use cases, review, disclosure, incidents)",
        "Mark anything that needs legal review - an AI-drafted policy is a starting point, not the final policy"
      ],
      code: `Role: You are a responsible-AI and compliance advisor for a mid-size Indian company.
Context: A 15-person marketing team uses AI for social posts, blog drafts, images and campaign analysis. Approved tools: Claude for Work and Canva AI. Customer data lives in our CRM.
Task: draft a one-page AI-use policy for this team.
Format: sections - Purpose, Approved tools, Data rules (with a 'never share' list), Allowed / Restricted / Forbidden uses (table), Human review rules, Disclosure rules, Copyright and image rules, Reporting incidents, Review date.
Constraints: plain English, max 450 words, mention that legal/HR must approve the final version, refer generally to data-protection law (DPDP Act) without giving legal advice.`,
      prompt: {
        system: "You are a responsible-AI and compliance advisor. You write clear, practical policies in plain English and always note that legal teams must approve final versions.",
        user: "Context: A 15-person marketing team uses AI for social posts, blog drafts, images and campaign analysis. Approved tools: Claude for Work and Canva AI. Customer data lives in our CRM.\nTask: draft a one-page AI-use policy for this team.\nFormat: sections - Purpose, Approved tools, Data rules (with a 'never share' list), Allowed / Restricted / Forbidden uses (table), Human review rules, Disclosure rules, Copyright and image rules, Reporting incidents, Review date.\nConstraints: plain English, max 450 words, mention that legal/HR must approve the final version, refer generally to data-protection law (DPDP Act) without giving legal advice."
      },
      result: "A structured one-page draft: Purpose (use AI productively and safely); Approved tools (Claude for Work, Canva AI only for company data); Never share (customer names/contacts from CRM, passwords, unreleased campaign budgets, client contracts); a use table (Allowed: drafting posts, brainstorming; Restricted: published blogs, customer emails - require review; Forbidden: real-person deepfakes, uploading competitor's copyrighted assets); review rules; disclosure line for AI-assisted content; incident reporting to the manager and IT within 24 hours; review every 6 months; 'Final version subject to Legal/HR approval'.",
      explanation: "AI is good at producing a well-structured first draft quickly. The responsible part is what you do next: involve legal/HR, adapt to company specifics and keep it updated as tools change."
    },
    {
      title: "Traffic-Light Check: Can I Use AI for This?",
      scenario: "Practise classifying everyday work situations into GREEN, AMBER or RED with an AI reviewer, then compare with your own judgement.",
      steps: [
        "First, write your own GREEN/AMBER/RED answer for each of the 6 situations",
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste the prompt below and run it",
        "Compare answers; where you disagree, decide which reasoning is stronger and why"
      ],
      code: `You are a responsible-AI trainer. Classify each work situation as GREEN (go, still review), AMBER (proceed with care: redact / approved tool / review) or RED (stop).
1. Summarising a public government report for an internal newsletter.
2. Pasting 500 customer complaints with names and phone numbers into a free consumer chatbot to find themes.
3. Asking an AI coding assistant (company-approved) to write unit tests for your module.
4. Using AI to rank job applicants and automatically reject the bottom 50%.
5. Generating a stock photo-style image of 'a team meeting' for a blog post with an approved tool.
6. Creating a video of the CEO's face and voice announcing a sale, without the CEO's consent.
Format: table Situation | Colour | Reason | Safer alternative (if not GREEN).`,
      prompt: {
        system: "You are a responsible-AI trainer for new employees. You are practical, concise and explain the reason behind each decision.",
        user: "Classify each work situation as GREEN (go, still review), AMBER (proceed with care: redact / approved tool / review) or RED (stop).\n1. Summarising a public government report for an internal newsletter.\n2. Pasting 500 customer complaints with names and phone numbers into a free consumer chatbot to find themes.\n3. Asking an AI coding assistant (company-approved) to write unit tests for your module.\n4. Using AI to rank job applicants and automatically reject the bottom 50%.\n5. Generating a stock photo-style image of 'a team meeting' for a blog post with an approved tool.\n6. Creating a video of the CEO's face and voice announcing a sale, without the CEO's consent.\nFormat: table Situation | Colour | Reason | Safer alternative (if not GREEN)."
      },
      result: "Expected: 1 GREEN (public data; check the summary); 2 RED (personal data in an unapproved tool) -> redact and use the approved enterprise tool; 3 GREEN/AMBER (approved tool, but review and run tests before merging); 4 RED (automated decisions about people, bias risk) -> AI may assist screening with human review and fairness checks; 5 GREEN (approved tool, generic image; disclose if policy requires); 6 RED (deepfake without consent) -> record a real message with consent.",
      explanation: "The same AI capability can be GREEN or RED depending on the data, the tool and the impact on people. Practising these calls builds the judgement employers expect from day one."
    },
    {
      title: "Human Review of an AI-Drafted Customer Email",
      scenario: "An AI drafted a reply to a customer about a delayed refund. Act as the human reviewer: find factual risks, promises the company cannot keep and tone issues.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or any chatbot",
        "Paste the prompt below, which includes the AI draft and the real company policy",
        "Run it and read the reviewer's findings",
        "Rewrite the email yourself, keeping only verified commitments"
      ],
      code: `You are a senior customer-support quality reviewer.
Company refund policy (source of truth): refunds are processed within 7-10 working days after the returned item is received at our warehouse. We do not pay compensation for delays. Customers can track refunds at example.com/refunds.

AI-drafted email to review:
"Dear Customer, we are extremely sorry! Your refund of Rs 4,999 has been processed today and will reach you within 24 hours. As an apology we will add Rs 500 compensation. Our records show you returned the item on 2 March."

Task: list every statement that is unverified, contradicts the policy, or makes a promise the company cannot keep. Then suggest a corrected email.
Format: 1) table Statement | Problem | Fix  2) corrected email under 100 words with [placeholders] for facts the agent must check.`,
      prompt: {
        system: "You are a senior customer-support quality reviewer. You compare drafts strictly against the provided policy and flag any unverified facts.",
        user: "Company refund policy (source of truth): refunds are processed within 7-10 working days after the returned item is received at our warehouse. We do not pay compensation for delays. Customers can track refunds at example.com/refunds.\n\nAI-drafted email to review:\n\"Dear Customer, we are extremely sorry! Your refund of Rs 4,999 has been processed today and will reach you within 24 hours. As an apology we will add Rs 500 compensation. Our records show you returned the item on 2 March.\"\n\nTask: list every statement that is unverified, contradicts the policy, or makes a promise the company cannot keep. Then suggest a corrected email.\nFormat: 1) table Statement | Problem | Fix  2) corrected email under 100 words with [placeholders] for facts the agent must check."
      },
      result: "Flags: 'processed today' (unverified), 'within 24 hours' (contradicts 7-10 working days), 'Rs 500 compensation' (policy says no compensation), 'returned on 2 March' and 'Rs 4,999' (must be checked in the system). Corrected email: apologises, states the 7-10 working day timeline from [return received date], gives the tracking link, and uses [refund amount] placeholders for the agent to verify.",
      explanation: "This is why human review is mandatory for customer-facing AI output: the draft sounded polite and confident but contained four risky claims, including a money commitment. Giving the AI the policy as a 'source of truth' (grounding) made the review accurate - the same idea as RAG in your final project."
    }
  ],
  tools: [
    { name: "AI Prompt Lab", use: "Practise safe prompting with redacted data and review prompts", url: "/tools/ai-lab" },
    { name: "In-app Python IDE", use: "Run the redaction script", url: "/tools/python-ide" },
    { name: "AI Tools Directory", use: "Check what each AI tool is for before using it at work", url: "/tools/ai-tools" },
    { name: "AI App Builder", use: "Write the 'Limitations & responsible AI' section of your final project", url: "/tools/ai-app-builder" },
    { name: "Anthropic Privacy Center", use: "Example of how an AI provider documents data handling for consumer and business plans", url: "https://privacy.anthropic.com" }
  ],
  interview: [
    { q: "What would you include in a company AI-use policy?", a: "Approved tools, data classification and 'never share' rules, allowed/restricted/forbidden use cases, human review requirements, disclosure rules, copyright/IP guidance, security of API keys, incident reporting, training, and a review schedule - approved by legal/HR.", level: "Medium" },
    { q: "A colleague pasted customer data into a public chatbot. What do you do?", a: "Stop further sharing, report it immediately to the manager and security/privacy team per policy, record what was shared and where, follow the incident process (e.g. deletion requests, assessment of notification duties), and use it as a training opportunity - not hide it.", level: "Medium" },
    { q: "What is the difference between consumer and enterprise AI tools from a data perspective?", a: "Enterprise plans typically offer contractual data-protection terms (e.g. no training on customer data by default), admin controls, SSO, audit logs and retention settings. Consumer plans may have different defaults and fewer controls. Always check the specific tool's terms and settings.", level: "Medium" },
    { q: "How do you protect privacy when using AI to analyse customer feedback?", a: "Use an approved tool, remove or pseudonymise personal identifiers before analysis, share only needed fields, aggregate results, limit access to outputs, and follow data-protection laws and retention rules.", level: "Medium" },
    { q: "Who owns AI-generated content?", a: "It depends on jurisdiction and tool terms. Many tools assign output rights to the user, but purely AI-generated works may not be protected by copyright in some countries; human creative input matters. Companies rely on legal guidance and avoid outputs that copy existing protected works.", level: "Hard" },
    { q: "What is human-in-the-loop and when is it essential?", a: "A person reviews, approves or can override AI outputs. Essential for high-impact decisions about people (hiring, lending, healthcare), customer-facing communication, legal/financial content and production code.", level: "Easy" },
    { q: "What is automation bias?", a: "The tendency to over-trust automated or AI outputs and miss their errors. Counter it with checklists, sampling audits, requiring sources, and training reviewers to actively look for mistakes.", level: "Medium" },
    { q: "When should AI use be disclosed?", a: "When it matters to the audience's trust or decision: published content under a person's or company's name, client deliverables, academic work, chatbots interacting with customers, and synthetic media of realistic people. Follow company policy and applicable law.", level: "Easy" },
    { q: "What risks come with AI-generated code?", a: "Bugs, security vulnerabilities (injection, hard-coded secrets), outdated APIs, licence issues if it reproduces open-source code, and over-reliance. Mitigate with code review, tests, security scanning, licence checks and company-approved tools.", level: "Medium" },
    { q: "How would you make an AI chatbot you build responsible?", a: "Clear system prompt with boundaries, grounding in an approved knowledge base, 'I don't know' behaviour, refusal of unsafe requests, notice that users are talking to AI, no collection of unnecessary personal data, test cases including unsafe/edge cases, human escalation, monitoring and logs without sensitive data.", level: "Hard" }
  ],
  practice: [
    {
      task: "Extend the redaction script to also replace 12-digit Aadhaar-style numbers written as 'dddd dddd dddd' with [ID]. Test it on a sample sentence with fake numbers.",
      hint: "Pattern without backslashes: r\"[0-9]{4} [0-9]{4} [0-9]{4}\". Add it to the patterns dictionary before the phone pattern.",
      solution: `patterns = {
    "[EMAIL]": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}",
    "[ID]":    r"[0-9]{4} [0-9]{4} [0-9]{4}",
    "[PHONE]": r"(?<![0-9])[6-9][0-9]{9}(?![0-9])",
    "[PAN]":   r"[A-Z]{5}[0-9]{4}[A-Z]",
}
# "ID 1234 5678 9012" -> "ID [ID]"`
    },
    {
      task: "Find the AI-use or acceptable-use policy (or published AI principles) of one large company or university. Summarise its 5 most important rules in your own words.",
      hint: "Search '<company> responsible AI principles' or '<university> generative AI policy'.",
      solution: "A typical summary: 1) use only approved tools for work data; 2) never enter confidential or personal data into public tools; 3) a human is accountable and must review outputs; 4) disclose AI assistance where it matters (e.g. academic work); 5) do not use AI for decisions about people without oversight. Note any rule that surprised you."
    },
    {
      task: "Rewrite this AI-generated LinkedIn post so that it is honest and appropriately disclosed: 'After years of research, I discovered that 87% of companies will use AI agents by next year!' (the statistic came from the AI and has no source).",
      hint: "Remove or verify the unsourced statistic; keep a genuine personal insight.",
      solution: "Example: 'I've been exploring AI agents in my course projects, and I'm seeing more companies discuss them for support and operations. If you are using agents at work, what has worked for you? (Drafted with help from an AI assistant and edited by me.)' - no invented statistics, honest framing."
    },
    {
      task: "Write the 'Limitations & responsible AI' text for a College Help Desk bot (it will go into the Export step of the AI App Builder on Day 45).",
      hint: "Cover accuracy, privacy, scope, human escalation and disclosure.",
      solution: "'This assistant answers only from the college documents in its knowledge base and can still make mistakes; important information (fees, deadlines) should be confirmed with the office. Do not enter personal details such as phone numbers or ID numbers. It cannot make admission or fee-waiver decisions. Users are informed they are chatting with an AI, and questions it cannot answer are redirected to office@abc.edu. The knowledge base must be reviewed every semester.'"
    },
    {
      task: "Classify these 4 tasks as GREEN, AMBER or RED and give a one-line reason: (a) translating a public product brochure, (b) uploading a client's unreleased design files to a free image tool, (c) summarising your own meeting notes in the approved Copilot, (d) letting AI auto-send replies to customer complaints with no review.",
      hint: "Ask: what data, which tool, who sees the output, what if it's wrong?",
      solution: "(a) GREEN - public content, review the translation. (b) RED - confidential client IP in an unapproved tool. (c) GREEN/AMBER - approved tool and own notes, check for confidential points before sharing the summary. (d) RED/AMBER - customer-facing output with no human review; require review or limit auto-replies to low-risk FAQs."
    }
  ],
  quiz: [
    {
      question: "Which of these is safest to paste into a public AI chatbot?",
      options: ["A customer list with phone numbers", "Your company's API key", "A public government report", "A client contract under NDA"],
      answer: 2,
      explanation: "Public information carries no confidentiality or privacy risk (you still review the output)."
    },
    {
      question: "What does 'human in the loop' mean?",
      options: ["A human types every prompt", "A qualified person reviews or approves AI output before it is used for important purposes", "AI is never used", "Humans train the model every day"],
      answer: 1,
      explanation: "Human review keeps accountability and catches AI errors."
    },
    {
      question: "An AI draft promises a customer compensation that company policy does not allow. Who is responsible if it is sent?",
      options: ["The AI tool vendor", "Nobody", "The customer", "The employee and company that sent it"],
      answer: 3,
      explanation: "Accountability stays with the people and organisation using AI."
    },
    {
      question: "Which is the best first step before asking AI to help with a complaint containing personal details?",
      options: ["Redact or replace the personal details with placeholders", "Paste it as-is to save time", "Ask the customer to stop complaining", "Post it on social media"],
      answer: 0,
      explanation: "Data minimisation and redaction protect privacy while still getting AI help."
    },
    {
      question: "Creating a realistic video of a real person saying things they never said, without consent, is...",
      options: ["GREEN - it is just creative", "AMBER - fine if labelled", "RED - a deepfake without consent; unethical and often illegal or banned by policy", "Allowed for marketing"],
      answer: 2,
      explanation: "Consent is essential for using a real person's face or voice."
    }
  ]
};
