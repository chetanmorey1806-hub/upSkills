export default {
  id: "day-22-ai-research-learning",
  title: "AI for Research & Learning: Perplexity, NotebookLM, Deep Research, Citations and Fact-checking",
  module: "Module 4: AI Tools for Productivity",
  day: 22,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn to research and study with AI the right way: answer engines with citations (Perplexity), source-grounded notebooks (NotebookLM), deep research modes in Claude, ChatGPT and Gemini, and a practical fact-checking routine so you never repeat a hallucinated 'fact'.",
  objectives: [
    "Explain the difference between a chat answer, a web-grounded answer and a source-grounded answer",
    "Use Perplexity to research with citations, step by step",
    "Use NotebookLM to study from your own documents (summaries, FAQs, audio overviews)",
    "Run a deep research task and evaluate the report",
    "Apply a fact-checking routine: open sources, verify claims, cross-check, cite correctly"
  ],
  theory: [
    {
      heading: "Three ways AI can answer a research question",
      content: "Not all AI answers are equally trustworthy. (1) Model-only answer: the model answers from its training data - fast but may be outdated or hallucinated, with no sources. (2) Web-grounded answer: the tool searches the web first and answers with citations (Perplexity, web search in Claude/ChatGPT/Gemini/Copilot). (3) Source-grounded answer: the AI answers only from documents YOU provide (NotebookLM, Claude Projects, uploaded PDFs) - best for studying your syllabus or company documents. Analogy: (1) is asking a well-read friend from memory, (2) is a friend who quickly googles and shows the links, (3) is a friend who reads only your textbook and points to the page.",
      points: [
        "For current facts (prices, laws, news, versions) -> web-grounded",
        "For your own notes, syllabus, company policies -> source-grounded",
        "For explanations of stable concepts -> model-only is usually fine, but verify key facts"
      ]
    },
    {
      heading: "Perplexity - the AI answer engine",
      content: "Perplexity (perplexity.ai) is an AI-powered search/answer engine. You ask a question in natural language; it searches the web, reads several sources and writes a concise answer with numbered citations you can click. Features include follow-up questions, focus modes (e.g. academic or social sources, depending on current options), file upload, Spaces (collections of research threads with instructions), and a deeper research mode. Free tier available; paid plan offers more advanced searches and model choices.",
      points: [
        "Where used: market research by business analysts, competitor checks by marketers, journalists' background research, students finding sources for projects, developers checking latest library versions",
        "How to use: 1) Go to perplexity.ai 2) Type a specific question 3) Read the answer and click the numbered citations 4) Ask follow-ups 5) Save the thread to a Space or share the link",
        "Limitation: citations can be to weak sources, and the summary can still misread a source - always open the important ones"
      ]
    },
    {
      heading: "NotebookLM - your AI study notebook",
      content: "NotebookLM (notebooklm.google.com) by Google is a research and study tool that works ONLY from sources you add: PDFs, Google Docs/Slides, websites, YouTube video links, pasted text and audio. It answers with inline citations pointing to the exact passage in your sources. It can generate study guides, FAQs, briefing docs, timelines, mind maps, flashcards/quizzes and 'Audio Overviews' - a podcast-style discussion of your sources - plus video overviews in supported regions.",
      points: [
        "Where used: students revising a semester's notes, employees onboarding with policy documents, researchers comparing papers, trainers preparing course material, lawyers reviewing case files",
        "How to use: 1) Go to notebooklm.google.com and sign in 2) Create new notebook 3) Add sources (upload PDF, paste link, Google Drive) 4) Ask questions in the chat panel - click citation numbers to see the source passage 5) Use the Studio panel to create a study guide, FAQ, mind map or Audio Overview 6) Save useful answers as notes",
        "Because answers are grounded in your sources, hallucination risk is lower - but not zero; check citations"
      ]
    },
    {
      heading: "Deep research features",
      content: "Claude (Research), ChatGPT (deep research), Gemini (Deep Research) and Perplexity offer agent-like research modes. Instead of one search, the AI plans the research, runs many searches, reads dozens of pages, and writes a long structured report with citations. It takes from a few minutes to longer. Claude's Research can also search your connected work apps (e.g. Google Drive, Gmail) if you enable them.",
      points: [
        "Where used: market sizing drafts, competitor landscapes, literature reviews, technology comparisons, policy summaries, preparing for client meetings",
        "How to use: 1) Choose the research/deep research option in the assistant 2) Write a detailed brief: question, scope, region, time period, sources to prefer/avoid, output format 3) Answer the clarifying questions it asks 4) Wait for the report 5) Verify key claims by opening citations",
        "A report full of citations can still contain errors - treat it as a strong first draft"
      ],
      tip: "A good research brief is like a good prompt: role, question, scope (country, years), what to include/exclude, and the final format (executive summary + table + sources)."
    },
    {
      heading: "Citations and how to read them",
      content: "A citation shows where a claim came from. Good habits: click citations for the claims that matter most; check that the source actually says what the AI claims (AI sometimes cites a page that doesn't support the sentence); prefer primary sources (official government sites, company annual reports, original research papers, official documentation) over blogs; check dates; and for academic work, cite the original source - not 'ChatGPT' or 'Perplexity' - unless your institution's policy asks you to disclose AI use as well.",
      points: [
        "Primary source: RBI circular, company annual report, original research paper, official docs",
        "Secondary source: news article or blog about the primary source",
        "Red flags: no date, anonymous site, broken link, source says something different"
      ]
    },
    {
      heading: "Fact-checking routine (the SIFT-style habit)",
      content: "Use a quick routine for any important AI-provided fact: Stop (is this important enough to verify?), Investigate the source (who published it, when?), Find better coverage (do 2 independent reliable sources agree?), Trace claims to the original (find the actual report or data). Ask the AI to help: 'List each factual claim in your answer with its source and your confidence.' Then verify the high-impact claims yourself.",
      syntax: `List every factual claim in the text below as a table:
Claim | Source cited | Is the source primary? | What to verify
Do not add new claims.`,
      tip: "Numbers, dates, names, quotes, laws and medical information are the most commonly wrong - always verify them."
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Researching a market question",
      scenario: "A business analyst at a fintech startup must brief her manager on UPI adoption trends among small merchants. A model-only answer gives confident numbers without sources; a web-grounded research prompt gives cited, dated facts.",
      steps: [
        "Go to perplexity.ai (or use web search in claude.ai / ChatGPT / Gemini)",
        "First ask the BAD question in a model-only chat and note that numbers have no sources",
        "Paste the GOOD prompt into Perplexity",
        "Click citations [1], [2]... for every number; prefer NPCI, RBI or government sources",
        "Copy the verified facts into your brief with source links and dates"
      ],
      code: `BAD PROMPT:
How many merchants use UPI?

GOOD PROMPT:
I am a business analyst preparing a 1-page brief for a fintech product manager in India.
Question: What are the latest trends in UPI adoption among small merchants?
Scope: India, last 2 years. Prefer primary sources (NPCI, RBI, government releases),
then reputable news. Avoid blogs without sources.
Format:
1. 5 key findings, each with the date of the data and a citation
2. A short note on what data is NOT publicly available
3. 3 implications for a merchant-payments product`,
      prompt: {
        system: "You are a careful research assistant. Every factual claim must come with a source and the date of the data. Prefer primary sources. Clearly say when data is unavailable instead of estimating.",
        user: "I am a business analyst preparing a 1-page brief for a fintech product manager in India.\nQuestion: What are the latest trends in UPI adoption among small merchants?\nScope: India, last 2 years. Prefer primary sources (NPCI, RBI, government releases), then reputable news.\nFormat:\n1. 5 key findings, each with the date of the data and a citation\n2. A short note on what data is NOT publicly available\n3. 3 implications for a merchant-payments product"
      },
      result: `(Shape of a good web-grounded answer - the numbers and links you see will be current figures from the sources found at the time you run it.)

1. Key findings
- UPI monthly transaction volumes have continued to grow strongly year on year, according to NPCI's monthly statistics [1] (data month: ...)
- Person-to-merchant (P2M) transactions form a large and growing share of UPI volume [1][2]
- Small-ticket payments dominate merchant transactions ... [2]
- QR-code acceptance has spread widely among small shops ... [3]
- UPI Lite and credit-on-UPI features are expanding small-value and credit use ... [4]

2. Not publicly available
- Exact number of active small merchants by city tier; churn of merchants; merchant-level profitability.

3. Implications
- Focus on low-cost, high-volume small-ticket flows...
- Offer value-added services (bookkeeping, credit) since basic payments are commoditised...
- Use tier-2/3 city adoption as a growth opportunity, validated with your own data...

Sources: [1] npci.org.in - UPI product statistics ... [2] RBI publication ... [3] ... [4] ...`,
      explanation: "The GOOD prompt asks for dates, primary sources and an explicit 'not available' section - which stops the AI from inventing merchant counts. The sample shows the structure; real numbers come from the live sources at the time of the search, and you must open the citations before putting any number in your brief."
    },
    {
      title: "Step by step: Studying a semester with NotebookLM",
      scenario: "Rahul, a B.Com student, has 6 PDFs of Business Statistics notes and 2 YouTube lecture links. He uses NotebookLM to build a study guide and quiz himself from ONLY his course material.",
      steps: [
        "Go to notebooklm.google.com and sign in with a Google account",
        "Click 'Create new' (new notebook) and name it 'Business Statistics - Sem 3'",
        "Add sources: upload the 6 PDFs, paste the 2 YouTube links ('Website' / 'YouTube' source)",
        "In the chat panel, paste the prompt below",
        "Click the citation numbers in the answer to jump to the exact passage in the notes",
        "In the Studio panel, generate a Study guide and a Mind map; generate an Audio Overview to listen while commuting",
        "Save the best answers as notes using 'Save to note'"
      ],
      code: `Using only my sources, create a revision sheet for Unit 3 (Measures of Dispersion):
1. Definitions of range, quartile deviation, mean deviation, standard deviation, coefficient of variation
2. The formula for each (as written in my notes)
3. When to use which measure (one line each)
4. 5 exam-style questions with answers, with citations to my notes
If something isn't covered in my sources, say "Not in sources".`,
      prompt: {
        system: "You are a study assistant that answers ONLY from the provided course notes. Cite the source for each point. If information is missing, say 'Not in sources'.",
        user: "Source (Unit 3 notes): 'Range = Largest value - Smallest value. Quartile Deviation = (Q3 - Q1)/2. Standard deviation is the square root of the mean of squared deviations from the mean. Coefficient of Variation (CV) = (SD / Mean) x 100; used to compare consistency of two series - lower CV means more consistent.'\n\nUsing only this source, create a revision sheet: definitions and formulas of range, quartile deviation, standard deviation, coefficient of variation and mean deviation; when to use each; and 2 exam-style questions with answers. If something isn't covered, say 'Not in sources'."
      },
      result: `Revision Sheet - Unit 3: Measures of Dispersion

1-2. Definitions and formulas
- Range = Largest value - Smallest value [1]
- Quartile Deviation = (Q3 - Q1) / 2 [1]
- Standard Deviation: square root of the mean of squared deviations from the mean [1]
- Coefficient of Variation = (SD / Mean) x 100 [1]
- Mean Deviation: Not in sources

3. When to use
- Range: quick rough idea of spread [1]
- Quartile Deviation: spread of the middle 50% of data [1]
- CV: comparing consistency of two series - lower CV = more consistent [1]

4. Exam questions
Q1. Batsman A: mean 50, SD 10. Batsman B: mean 40, SD 6. Who is more consistent?
A1. CV(A) = 10/50 x 100 = 20%; CV(B) = 6/40 x 100 = 15%. B is more consistent (lower CV). [1]
Q2. Q1 = 20, Q3 = 36. Find the Quartile Deviation.
A2. (36 - 20) / 2 = 8 [1]`,
      explanation: "Because NotebookLM is source-grounded, it says 'Not in sources' for Mean Deviation instead of inventing a formula that might differ from your syllabus. Citations [1] let you verify each point in your notes. The Audio Overview and Study guide turn the same sources into different revision formats."
    },
    {
      title: "Deep research brief: comparing BI tools for a mid-size company",
      scenario: "An IT manager must recommend a BI tool. He uses a deep research mode to produce a cited comparison, then verifies key claims before presenting.",
      steps: [
        "Open claude.ai and select Research (or ChatGPT deep research / Gemini Deep Research / Perplexity research mode)",
        "Paste the research brief below",
        "Answer any clarifying questions (e.g. budget, existing tools)",
        "Wait for the report (can take several minutes)",
        "Open citations for licensing and feature claims - check them on official vendor pages",
        "Convert the summary table into a slide (Day 24)"
      ],
      code: `Research brief
Role: Independent BI consultant.
Question: Which BI tool should a 300-employee Indian manufacturing company choose:
Power BI, Tableau or Looker Studio?
Context: Company uses Microsoft 365 and SQL Server; 15 report creators, 150 viewers;
data team of 2; needs mobile access and row-level security.
Scope: Official vendor documentation and reputable analyst/tech publications from the last
2 years. No affiliate/review-farm sites.
Output:
1. Executive summary (5 lines) with a recommendation
2. Comparison table: integration with M365/SQL Server, row-level security, mobile,
   learning curve, licensing model (describe the model, do not quote exact prices)
3. Risks of the recommended choice
4. Sources list with dates`,
      prompt: {
        system: "You are an independent BI consultant producing a cited research report. Base claims on official documentation where possible. Describe licensing models without quoting exact prices. Clearly separate facts (with sources) from your recommendation.",
        user: "Question: Which BI tool should a 300-employee Indian manufacturing company choose: Power BI, Tableau or Looker Studio?\nContext: Company uses Microsoft 365 and SQL Server; 15 report creators, 150 viewers; data team of 2; needs mobile access and row-level security.\nOutput: 1. Executive summary (5 lines) with a recommendation 2. Comparison table: integration with M365/SQL Server, row-level security, mobile, learning curve, licensing model (no exact prices) 3. Risks of the recommended choice 4. Sources list."
      },
      result: `1. Executive summary
Power BI is the recommended choice. It integrates natively with Microsoft 365 (Teams, SharePoint, Excel) and SQL Server, supports row-level security, and has mobile apps. Its Excel-like DAX and Power Query make it easier for a 2-person data team to adopt. Tableau is strong for visual exploration but adds a separate ecosystem. Looker Studio is free and simple but limited for enterprise governance needs.

2. Comparison
| Criterion           | Power BI                         | Tableau                          | Looker Studio                    |
|---------------------|----------------------------------|----------------------------------|----------------------------------|
| M365 / SQL Server   | Native, on-prem gateway [1]      | Connectors available [4]         | Possible via connectors; Google-first [6] |
| Row-level security  | Yes (roles in model) [2]         | Yes (user filters / data policies) [4] | Limited compared with the others [6] |
| Mobile              | Mobile apps [3]                  | Mobile apps [5]                  | Browser-based, responsive        |
| Learning curve      | Moderate; familiar for Excel users | Moderate to steep              | Easy                             |
| Licensing model     | Per user (Pro/Premium per user) or capacity-based [1] | Role-based per user (Creator/Explorer/Viewer) [5] | Free; Pro version available [6] |

3. Risks
- Capacity/licensing choice for 150 viewers must be costed carefully [1]
- DAX skills needed for complex measures - plan training
- Dependence on the on-premises data gateway for SQL Server refresh [1]

4. Sources: [1] learn.microsoft.com - Power BI licensing ... [2] ... [6] ...`,
      explanation: "The brief defines context (M365, SQL Server, team size) so the recommendation is specific. Asking for 'licensing model, not exact prices' avoids outdated figures. Before presenting, the manager opens [1]-[6] and confirms each claim on the official vendor pages; he also gets a current price quote directly from vendors."
    },
    {
      title: "Fact-checking an AI-written paragraph",
      scenario: "A content writer received a paragraph from an AI tool for a blog on Indian space missions. Before publishing, she asks AI to extract every factual claim, then verifies each one with reliable sources.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and paste the claim-extraction prompt",
        "Get the claims table",
        "Verify each claim with Perplexity or a search engine, preferring primary sources (isro.gov.in)",
        "Correct or delete any claim you cannot verify",
        "Record the source URL for every claim you keep"
      ],
      code: `List every factual claim in the paragraph below as a table:
# | Claim | Type (date/number/name/event) | Best primary source to check | Risk if wrong (High/Med/Low)
Do not judge whether claims are true and do not add new claims.

<paragraph>
Chandrayaan-3 landed near the Moon's south pole on 23 August 2023, making India the
first country to land near the lunar south pole. The lander was named Vikram and the
rover Pragyan. The mission was launched on an LVM3 rocket from Sriharikota, and the
total mission cost was about Rs 100 crore.
</paragraph>`,
      prompt: {
        system: "You are a fact-checking assistant. Extract factual claims only; do not evaluate them and do not add new information.",
        user: "List every factual claim in the paragraph below as a table:\n# | Claim | Type (date/number/name/event) | Best primary source to check | Risk if wrong (High/Med/Low)\n\n<paragraph>\nChandrayaan-3 landed near the Moon's south pole on 23 August 2023, making India the first country to land near the lunar south pole. The lander was named Vikram and the rover Pragyan. The mission was launched on an LVM3 rocket from Sriharikota, and the total mission cost was about Rs 100 crore.\n</paragraph>"
      },
      result: `| # | Claim                                              | Type   | Best primary source to check      | Risk |
|---|----------------------------------------------------|--------|-----------------------------------|------|
| 1 | Chandrayaan-3 landed near the lunar south pole     | Event  | ISRO mission page (isro.gov.in)   | Med  |
| 2 | Landing date was 23 August 2023                    | Date   | ISRO mission page / press release | High |
| 3 | India was first to land near the lunar south pole  | Event  | ISRO + reputable international news | High |
| 4 | Lander named Vikram                                | Name   | ISRO mission page                 | Low  |
| 5 | Rover named Pragyan                                | Name   | ISRO mission page                 | Low  |
| 6 | Launched on LVM3                                   | Name   | ISRO launch page                  | Med  |
| 7 | Launched from Sriharikota                          | Name   | ISRO launch page                  | Low  |
| 8 | Total mission cost about Rs 100 crore              | Number | Official statements / Parliament replies | High |

Verification result (done by the writer):
Claims 1-7 are confirmed by ISRO and widely reported sources.
Claim 8 is NOT supported: widely reported figures put the cost at roughly Rs 600 crore. Corrected before publishing.`,
      explanation: "Separating claim extraction from verification prevents the AI from 'confirming' its own errors. Here, a wrong cost figure (a typical hallucination) was caught. Numbers and 'first/largest/only' claims carry the highest risk and deserve the most checking."
    }
  ],
  tools: [
    { name: "Perplexity", use: "AI answer engine: web search with numbered citations, follow-ups, Spaces and a research mode", url: "https://www.perplexity.ai" },
    { name: "NotebookLM", use: "Source-grounded notebook: chat with your PDFs/Docs/links/videos, study guides, mind maps, Audio Overviews", url: "https://notebooklm.google.com" },
    { name: "Claude Research", use: "Agentic multi-search research with citations; can include connected work apps", url: "https://claude.ai" },
    { name: "ChatGPT deep research", use: "Multi-step web research producing long cited reports", url: "https://chatgpt.com" },
    { name: "Gemini Deep Research", use: "Research plan + browsing + cited report; exports to Google Docs", url: "https://gemini.google.com" },
    { name: "Google Scholar", use: "Find and cite academic papers (primary sources) to verify research claims", url: "https://scholar.google.com" }
  ],
  interview: [
    { q: "What is the difference between a model-only answer and a web-grounded answer?", a: "A model-only answer comes from the model's training data and may be outdated or hallucinated without sources. A web-grounded answer is generated after searching the web and includes citations to current sources.", level: "Easy" },
    { q: "What is Perplexity and when would you use it?", a: "An AI answer engine that searches the web and writes concise answers with clickable citations. Use it for quick, current, sourced research like market facts, competitor information or latest versions of tools.", level: "Easy" },
    { q: "What is NotebookLM?", a: "A Google tool that lets you chat with and transform your own sources (PDFs, Docs, websites, YouTube) with citations to exact passages, and generate study guides, FAQs, mind maps and Audio Overviews.", level: "Easy" },
    { q: "What does 'source-grounded' mean and why does it reduce hallucination?", a: "The AI is restricted to answering from provided documents and cites passages. It has less room to invent information, and you can check every claim against the source - though errors are still possible.", level: "Medium" },
    { q: "How do deep research features differ from normal web search in chat?", a: "Deep research plans the task, runs many searches, reads many pages and synthesises a long structured report with citations over several minutes, rather than answering from one quick search.", level: "Medium" },
    { q: "Why should you click citations instead of trusting them?", a: "AI can cite weak sources or misrepresent what a source says. Opening citations confirms the source exists, is reliable, is current and actually supports the claim.", level: "Easy" },
    { q: "What is a primary source? Give examples.", a: "The original origin of information: official statistics, government circulars, company annual reports, original research papers, official documentation. News articles and blogs are secondary sources.", level: "Easy" },
    { q: "Describe a fact-checking workflow for AI-generated content.", a: "Extract each factual claim, rank by risk (numbers, dates, names, 'first/only' claims are high), verify against primary or two independent reliable sources, correct or remove unverified claims, and record sources.", level: "Medium" },
    { q: "How should students cite information found through AI tools?", a: "Cite the original source the information came from, after reading it; follow the institution's policy on disclosing AI assistance. Don't cite a chatbot as the source of a fact.", level: "Medium" },
    { q: "What makes a good deep research brief?", a: "Clear role and question, context, scope (region, time period), preferred and excluded source types, output format, and instructions to separate facts from opinions and flag unavailable data.", level: "Hard" },
    { q: "What are the limitations of AI research tools for business decisions?", a: "They can miss paywalled or non-public data, rely on secondary sources, misread numbers, reflect source bias and present uncertain information confidently. Use them for speed, but validate key facts and combine with internal data and expert judgment.", level: "Hard" }
  ],
  practice: [
    { task: "Ask Perplexity: 'What are the latest features added to Power BI in the last 3 months?' Open 3 citations and check whether they are official Microsoft sources.", hint: "Look for learn.microsoft.com or the Power BI blog.", solution: "Good answers cite the official Power BI blog/feature summary. If citations are third-party blogs, ask a follow-up: 'Use only official Microsoft sources.'" },
    { task: "Create a NotebookLM notebook with notes from one subject. Generate a study guide and a 10-question quiz; check 3 answers against your notes using citations.", hint: "Use the Studio panel; click citation numbers.", solution: "Expected: answers link to exact passages; anything outside your notes is marked as not covered or missing." },
    { task: "Write a deep research brief on 'career opportunities for Power BI developers in India'. Run it and list 3 claims you verified and how.", hint: "Include scope, sources to prefer and an output format.", solution: "Example verifications: job counts checked on job portals directly; skill requirements checked in 5 real job descriptions; certification details checked on Microsoft Learn." },
    { task: "Take any AI-written paragraph and run the claim-extraction prompt. Verify every High-risk claim.", hint: "Numbers and dates are high risk.", solution: "Record a table: claim, verified (Y/N), source URL, correction." },
    { task: "Compare the same question in (a) a model-only chat, (b) Perplexity, (c) NotebookLM with a relevant document. Write 3 differences.", hint: "Look at sources, specificity and freshness.", solution: "Typical: (a) no sources, possibly outdated; (b) current, cited web sources; (c) answers strictly from the document with exact passage citations." }
  ],
  quiz: [
    { question: "Which tool answers ONLY from documents you upload, with citations to exact passages?", options: ["Midjourney", "NotebookLM", "Excel Flash Fill", "Canva"], answer: 1, explanation: "NotebookLM is source-grounded on your own documents." },
    { question: "Perplexity is best described as:", options: ["An image generator", "A video editor", "An AI answer engine that searches the web and cites sources", "A spreadsheet tool"], answer: 2, explanation: "It combines search with AI-written answers and citations." },
    { question: "Which is a PRIMARY source for a UPI statistic?", options: ["NPCI's official statistics page", "A random blog", "A social media post", "An AI chatbot's answer"], answer: 0, explanation: "NPCI publishes the original UPI data." },
    { question: "Which claims are usually highest risk when fact-checking?", options: ["Greetings", "Formatting", "Opinions about colours", "Numbers, dates and 'first/only' claims"], answer: 3, explanation: "Specific figures and superlatives are most often wrong and most damaging." },
    { question: "A deep research report has 40 citations. You should:", options: ["Trust it completely", "Treat it as a strong draft and verify key claims by opening sources", "Delete the citations", "Only read the title"], answer: 1, explanation: "Citations help, but can still be weak or misrepresented." }
  ]
};
