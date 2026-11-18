const biasDemo = `# Bias check: did a (made-up) screening model treat two groups fairly?
decisions = [
    # (group, qualified, model_said_yes)
    ("A", True, True), ("A", True, True), ("A", False, True), ("A", True, True),
    ("A", False, False), ("A", True, True),
    ("B", True, False), ("B", True, True), ("B", False, False), ("B", True, False),
    ("B", False, False), ("B", True, True),
]

for group in ("A", "B"):
    rows = [d for d in decisions if d[0] == group]
    selected = sum(1 for d in rows if d[2])
    qualified = [d for d in rows if d[1]]
    qualified_selected = sum(1 for d in qualified if d[2])
    print(f"Group {group}: selection rate = {selected}/{len(rows)} = {selected/len(rows):.0%}, "
          f"qualified people selected = {qualified_selected}/{len(qualified)} = {qualified_selected/len(qualified):.0%}")

rate_a = 5 / 6
rate_b = 2 / 6
ratio = rate_b / rate_a
print(f"Disparate impact ratio (B/A) = {ratio:.2f}")
print("Warning: below 0.8 - review this model for bias!" if ratio < 0.8 else "Looks balanced")
`;

export default {
  id: "day-06-responsible-ai-bias-privacy-safety",
  title: "Responsible AI: Bias, Fairness, Privacy, Hallucinations, Deepfakes, Copyright, AI Safety",
  module: "Module 1: AI Foundations",
  day: 6,
  level: "Beginner",
  duration: "2 hours",
  summary: "AI is powerful, so it must be used responsibly. Learn the main risks - biased and unfair decisions, privacy leaks, hallucinated (made-up) answers, deepfakes, copyright questions and broader AI safety - and simple, practical habits to reduce them. You will measure bias in a small dataset with Python and practise fact-checking and safe prompting with a chat assistant.",
  objectives: [
    "Explain how bias enters AI systems and why it causes unfair outcomes",
    "Measure a simple fairness metric (selection rate and disparate impact ratio)",
    "Protect personal and company data when using AI tools",
    "Recognise hallucinations and deepfakes and know how to check them",
    "Describe copyright concerns and the goals of AI safety and regulation",
  ],
  theory: [
    {
      heading: "Why Responsible AI matters",
      content: "AI now helps decide who gets a loan interview, which resume is shortlisted, what news you see and what answer a student copies into an assignment. Mistakes at this scale can hurt many people quickly. Responsible AI means designing and using AI so it is fair, safe, private, transparent and accountable. Analogy: a car is very useful, but we still need seat belts, traffic rules, driving licences and insurance. Responsible AI is the seat belt and traffic rules for AI.",
      points: [
        "Fairness: similar people should be treated similarly",
        "Transparency: people should know when AI is involved and roughly how it decides",
        "Privacy: personal data must be protected and used only with permission",
        "Safety and reliability: the system should not cause harm and should work as expected",
        "Accountability: a human or organisation remains responsible - 'the AI did it' is not an excuse",
      ],
    },
    {
      heading: "Bias and fairness",
      content: "AI learns from data, and data reflects the past - including past unfairness. If a company historically hired mostly men for engineering roles, a model trained on that history may learn to prefer male candidates. This is a well-known type of real-world failure that companies have publicly reported and abandoned systems over. Bias can enter at many points:",
      points: [
        "Historical bias: the data reflects unfair past decisions",
        "Sampling / representation bias: some groups are missing or rare in the data (for example a face dataset with few darker-skinned faces)",
        "Measurement / label bias: the labels themselves are biased (biased human reviewers)",
        "Proxy features: removing 'gender' is not enough if 'hobby' or 'college' acts as a stand-in",
        "Fairness checks: compare outcomes per group, such as selection rate. A common rule of thumb (the 'four-fifths rule') flags concern if one group's selection rate is below 80% of another's",
        "Fixes: better, more representative data; remove or audit proxy features; test per group; keep humans in the loop for high-stakes decisions",
      ],
    },
    {
      heading: "Privacy and data protection",
      content: "When you type into a chat assistant, your text is sent to a company's servers. Depending on the product and your settings, it may be stored and, for some consumer products, used to improve models. Business and API plans often have stricter data terms. Laws such as the EU's GDPR and India's Digital Personal Data Protection (DPDP) Act 2023 set rules for handling personal data.",
      points: [
        "Never paste passwords, API keys, Aadhaar/PAN numbers, bank details, medical records or confidential company code into public AI tools",
        "Anonymise: replace real names and numbers with placeholders (Customer A, XXXX-1234)",
        "Check the tool's data settings and your organisation's AI policy before using work data",
        "Prefer approved enterprise tools for company data",
        "Remember: anything shared may be stored - think before you paste",
      ],
      tip: "Simple rule: if you would not post it on a public notice board, do not paste it into an unapproved AI tool.",
    },
    {
      heading: "Hallucinations: confident but wrong",
      content: "A hallucination is when an AI model produces information that sounds confident and fluent but is false or invented - a fake citation, a wrong date, a non-existent law section, an incorrect calculation. It happens because language models generate likely-sounding text, not verified facts (Day 8 explains why). Analogy: a student who never says 'I don't know' and writes a confident guess in the exam.",
      points: [
        "High risk areas: references and links, exact numbers and statistics, legal and medical details, recent events after the training cutoff, niche topics",
        "Reduce them: give the model the source text and ask it to answer only from it; ask it to say 'I don't know'; ask for sources and then open them; use tools with web search or documents (RAG, Day 32)",
        "Always verify important facts with a trusted source before you use them",
      ],
    },
    {
      heading: "Deepfakes and misinformation",
      content: "Deepfakes are AI-generated or AI-altered images, videos or voices that make it look like a real person said or did something they did not. They are used for scams (a cloned voice of a 'relative' asking for money urgently), fake celebrity endorsements, political misinformation and harassment.",
      points: [
        "Warning signs: unnatural blinking or lip-sync, odd hands or ears, inconsistent lighting, robotic or flat voice, urgent emotional pressure",
        "Verify: call the person back on a known number, check trusted news sources, use reverse image search",
        "Some platforms add labels or content credentials (for example C2PA metadata) to AI-generated media",
        "Ethics: never create content that impersonates a real person without consent; it can be illegal and harmful",
      ],
    },
    {
      heading: "Copyright, transparency and AI safety",
      content: "Generative AI is trained on large amounts of existing text, images and code, which raises open legal questions about copyright and fair use; several court cases are ongoing in different countries, and rules differ by country. AI Safety is the wider field working to make powerful AI systems behave as intended and not cause serious harm.",
      points: [
        "Copyright: avoid asking for copies of copyrighted books, songs or paid content; do not claim AI output as fully your own where rules require disclosure; check licences before commercial use of generated images",
        "Academic and workplace honesty: follow your college or company policy on AI use and disclose it when required",
        "AI safety topics: preventing harmful use, making models refuse dangerous requests, making them honest about uncertainty, and keeping humans in control",
        "Regulation examples: the EU AI Act (risk-based rules for AI systems), data protection laws, and company AI policies",
        "Human in the loop: for high-stakes decisions (hiring, loans, medical, legal), AI should assist, and a qualified human should decide",
      ],
      tip: "Responsible-use checklist: Is the data allowed? Is the output verified? Is anyone treated unfairly? Is AI use disclosed? Is a human accountable?",
    },
  ],
  examples: [
    {
      title: "Measure bias in a screening model (pure Python)",
      scenario: "A (made-up) resume-screening model said yes/no for 12 candidates from two groups. Is it fair? We compute selection rates and the disparate impact ratio.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Compare selection rates for Group A and Group B",
        "Notice that even QUALIFIED candidates in Group B were rejected more often",
        "Change two of Group B's False decisions (for qualified people) to True and run again",
      ],
      code: biasDemo,
      python: { files: { "main.py": biasDemo }, stdin: "" },
      result: `Group A: selection rate = 5/6 = 83%, qualified people selected = 4/4 = 100%
Group B: selection rate = 2/6 = 33%, qualified people selected = 2/4 = 50%
Disparate impact ratio (B/A) = 0.40
Warning: below 0.8 - review this model for bias!`,
      explanation: "Both groups have 4 qualified people out of 6, yet the model selected 83% of Group A and only 33% of Group B, and missed half of the qualified people in Group B. The ratio 0.40 is far below the 0.8 rule of thumb. Note: the rates in the ratio line are typed in by hand (5/6 and 2/6) for clarity - in practice you would compute them in the loop. Checks like this are a first step; real fairness audits use several metrics and domain experts.",
    },
    {
      title: "Catch a hallucination: ask for sources, then verify",
      scenario: "Learn how a chat assistant can produce confident but unverifiable details, and how to prompt for honesty.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste prompt A: 'Give me 3 research papers with authors, year and DOI about AI bias in hiring.'",
        "Search each title on Google Scholar - do they exist exactly as written?",
        "Now paste the improved prompt below (prompt B) in a new chat",
        "Compare: prompt B should be more careful and clearly mark uncertainty",
      ],
      code: `Prompt B (safer):
I need well-known, real sources about AI bias in hiring.
Rules:
- Only mention sources you are highly confident exist.
- For each, say how confident you are (high/medium/low).
- Do not invent DOIs or URLs; if you are not sure, write "verify".
- If you cannot recall any reliably, say so and suggest search keywords instead.`,
      prompt: {
        system: "You are a careful research assistant. Accuracy matters more than completeness. Say 'I am not sure' when appropriate.",
        user: "I need well-known, real sources about AI bias in hiring.\nRules:\n- Only mention sources you are highly confident exist.\n- For each, say how confident you are (high/medium/low).\n- Do not invent DOIs or URLs; if you are not sure, write \"verify\".\n- If you cannot recall any reliably, say so and suggest search keywords instead.",
      },
      result: "A shorter list with confidence labels, 'verify' instead of invented links, and suggested search keywords (for example 'algorithmic hiring bias audit', 'four-fifths rule AI'). You verify each item on Google Scholar before using it.",
      explanation: "Models can invent realistic-looking citations. Giving explicit permission to say 'I am not sure', banning invented links, and verifying every source yourself are the core anti-hallucination habits. Tools with web search or your own documents (RAG) reduce the problem further.",
    },
    {
      title: "Anonymise data before asking AI for help",
      scenario: "You want help writing a reply to a customer complaint, but the message contains personal data. Practise removing it first.",
      steps: [
        "Read the original message (below) and highlight personal data",
        "Replace each item with a placeholder, as in the safe version",
        "Open claude.ai (or ChatGPT / Gemini) and paste ONLY the safe version",
        "After getting the reply, put the real name back yourself before sending",
      ],
      code: `ORIGINAL (do NOT paste into public AI):
"Hi, I am Priya Deshmukh, phone 98XXXXXX21, order #A99812, card ending 4421. My refund of Rs 2,340 is pending for 3 weeks."

SAFE VERSION (paste this):
Write a polite, empathetic reply (max 90 words) from a support agent to this customer message:
"Hi, I am [CUSTOMER_NAME], phone [PHONE], order [ORDER_ID], card ending [CARD_LAST4]. My refund of [AMOUNT] is pending for 3 weeks."
Promise an update within 48 hours. Keep the placeholders as they are.`,
      prompt: {
        system: "You are a customer support writing assistant. Keep placeholders in square brackets unchanged.",
        user: "Write a polite, empathetic reply (max 90 words) from a support agent to this customer message:\n\"Hi, I am [CUSTOMER_NAME], phone [PHONE], order [ORDER_ID], card ending [CARD_LAST4]. My refund of [AMOUNT] is pending for 3 weeks.\"\nPromise an update within 48 hours. Keep the placeholders as they are.",
      },
      result: "A reply like: 'Dear [CUSTOMER_NAME], thank you for reaching out, and I am sorry your refund of [AMOUNT] for order [ORDER_ID] has been delayed... We will update you within 48 hours.' - with all placeholders intact.",
      explanation: "The AI did the writing without ever seeing real personal data. This placeholder technique works for emails, reports and code (replace real API keys and database passwords with dummy values).",
    },
    {
      title: "Responsible AI review of an AI feature",
      scenario: "Your team wants to launch an AI that ranks loan applicants. Use an assistant to create a risk checklist.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Review the table and add at least one risk the AI missed",
        "Save it as a template for your final project report (Day 44-45)",
      ],
      code: `We plan an AI feature that ranks bank loan applicants for manual review.
Create a Responsible AI checklist as a table: Risk area (bias, privacy, hallucination/errors, transparency, security, accountability) | What could go wrong | How to test it | Mitigation.
Then list 3 decisions that must stay with a human.`,
      prompt: {
        system: "You are a Responsible AI reviewer. Be practical and specific. Do not invent statistics.",
        user: "We plan an AI feature that ranks bank loan applicants for manual review.\nCreate a Responsible AI checklist as a table: Risk area (bias, privacy, hallucination/errors, transparency, security, accountability) | What could go wrong | How to test it | Mitigation.\nThen list 3 decisions that must stay with a human.",
      },
      result: "A table such as: Bias - lower ranking for certain pin codes (proxy for community) - compare selection rates per group - remove proxies, audit regularly. Privacy - sensitive financial data leaks - access review - encryption, data minimisation. Transparency - applicants do not know AI is used - check notices - disclose and explain main factors. Plus human decisions: final approval/rejection, handling appeals, overriding the model.",
      explanation: "Responsible AI is a process, not a single tool. A short checklist like this, reviewed before launch, prevents many real-world failures.",
    },
  ],
  tools: [
    { name: "Google Scholar", use: "Verify that papers and citations from AI actually exist", url: "https://scholar.google.com" },
    { name: "Google reverse image search / Lens", use: "Check where a suspicious image came from", url: "https://lens.google" },
    { name: "Claude", use: "Create checklists and practise safe, anonymised prompting", url: "https://claude.ai" },
  ],
  interview: [
    { q: "What is Responsible AI?", a: "An approach to designing, building and using AI that is fair, transparent, private, safe, reliable and accountable, with humans responsible for outcomes.", level: "Easy" },
    { q: "How does bias get into AI models?", a: "Through historical bias in data, under-representation of groups, biased labels, proxy features correlated with protected attributes, and design choices. Models learn and can amplify these patterns.", level: "Medium" },
    { q: "What is the four-fifths (80%) rule?", a: "A rule of thumb for adverse impact: if a group's selection rate is less than 80% of the highest group's rate, the process may be discriminatory and should be investigated.", level: "Medium" },
    { q: "What is an AI hallucination?", a: "When a model generates fluent, confident output that is false or fabricated, such as fake citations or wrong facts. It arises because models predict likely text rather than retrieving verified facts.", level: "Easy" },
    { q: "How can you reduce hallucinations?", a: "Provide source documents and ask the model to answer only from them (grounding/RAG), allow it to say 'I don't know', ask for citations and verify them, use lower-risk tasks for automation, and keep human review.", level: "Medium" },
    { q: "What is a deepfake and how can you spot one?", a: "AI-generated or manipulated media showing a person saying or doing something they did not. Signs include odd lip-sync, unnatural blinking, lighting errors and suspicious urgency; verify via trusted sources or a call-back.", level: "Easy" },
    { q: "What data should never be pasted into a public AI chatbot?", a: "Passwords, API keys, government ID numbers, financial and medical details, confidential company code or documents, and other people's personal data without permission.", level: "Easy" },
    { q: "If you remove the gender column, is the model fair?", a: "Not necessarily. Other features (names, colleges, hobbies, pin codes) can act as proxies. You must test outcomes per group, not just remove columns.", level: "Hard" },
    { q: "What is 'human in the loop'?", a: "A design where humans review, approve or can override AI outputs, especially for high-stakes decisions like hiring, lending, medical or legal matters.", level: "Medium" },
    { q: "What is the EU AI Act in one line?", a: "A European Union law that regulates AI systems based on risk levels, with stricter obligations for high-risk uses and bans on certain unacceptable practices.", level: "Medium" },
  ],
  practice: [
    { task: "In the bias demo, compute the selection rates inside the loop and store them in a dictionary instead of typing 5/6 and 2/6 by hand.", hint: "Create rates = {} before the loop and set rates[group] = selected / len(rows).", solution: "rates = {}; inside the loop: rates[group] = selected / len(rows); after the loop: ratio = rates['B'] / rates['A']. Output stays 0.40." },
    { task: "Write a prompt that summarises a confidential HR document safely.", hint: "Anonymise first and tell the AI not to infer identities.", solution: "Replace names with Employee A/B, remove salary figures or bucket them, then: 'Summarise the document below in 5 bullets for a manager. Do not guess or infer identities. Keep placeholders unchanged. Text: ...'" },
    { task: "Ask a chat assistant a question about a very recent event (this week). Note how it answers and whether it mentions its knowledge cutoff or uses web search.", hint: "Look for words like 'as of my last update'.", solution: "A careful assistant states its cutoff or uses a search tool and cites sources. If it confidently invents details, that is a hallucination - verify with news websites." },
    { task: "Create your personal 5-rule 'AI use policy' for college or work.", hint: "Cover privacy, verification, disclosure, fairness and accountability.", solution: "Example: 1) No personal or confidential data in public tools. 2) Verify all facts, numbers and citations. 3) Disclose AI help when required. 4) Do not use AI to impersonate anyone. 5) I am responsible for anything I submit." },
    { task: "Find one real news story about a deepfake scam and list 3 ways it could have been prevented.", hint: "Search 'deepfake voice scam' on a trusted news site.", solution: "Common prevention ideas: verify by calling back on a known number, use a family/company code word, never transfer money under urgency without a second check, and report suspicious media." },
  ],
  quiz: [
    { question: "A hiring model trained on 10 years of biased hiring data will most likely:", options: ["Automatically become fair", "Learn and repeat the past bias", "Refuse to train", "Remove bias by itself"], answer: 1, explanation: "Models learn patterns in historical data, including unfair ones." },
    { question: "Group A selection rate is 50% and Group B is 30%. The disparate impact ratio (B/A) is:", options: ["0.6 - below 0.8, so investigate", "1.67 - fair", "0.8 - exactly fair", "0.3 - no issue"], answer: 0, explanation: "0.30 / 0.50 = 0.6, which is below the 0.8 rule of thumb." },
    { question: "Which is the safest way to get AI help with a customer complaint?", options: ["Paste the full message including card number", "Paste screenshots of the customer's account", "Replace personal details with placeholders first", "Share the customer's password so the AI can check"], answer: 2, explanation: "Anonymise data before using AI tools." },
    { question: "An AI gives a perfect-looking citation with a DOI that does not exist. This is:", options: ["Overfitting", "Encryption", "Tokenization", "A hallucination"], answer: 3, explanation: "Confident fabricated output is a hallucination." },
    { question: "For a high-stakes loan decision, Responsible AI suggests:", options: ["Fully automatic AI decisions with no review", "AI assists and a qualified human makes the final decision", "Never using any data", "Hiding AI use from applicants"], answer: 1, explanation: "Keep a human in the loop for high-stakes decisions." },
  ],
};
