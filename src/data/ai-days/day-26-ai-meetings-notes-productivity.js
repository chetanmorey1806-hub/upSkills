export default {
  id: "day-26-ai-meetings-notes-productivity",
  title: "AI for Meetings, Notes & Productivity: Otter.ai, Fireflies, Copilot in Teams/Outlook, Notion AI",
  module: "Module 4: AI Tools for Productivity",
  day: 26,
  level: "Beginner",
  duration: "2 hours",
  summary: "Use AI to record, transcribe and summarise meetings, extract action items and decisions, draft follow-up emails, triage your inbox and organise notes. Learn Otter.ai, Fireflies.ai, Microsoft 365 Copilot in Teams and Outlook, Notion AI, and the privacy etiquette of recording people.",
  objectives: [
    "Explain how AI meeting assistants work: record -> transcribe -> diarise speakers -> summarise -> extract actions",
    "Set up Otter.ai or Fireflies to join and summarise an online meeting",
    "Use Copilot in Teams and Outlook to recap meetings and draft/summarise emails",
    "Use Notion AI to turn messy notes into structured pages, tasks and Q&A",
    "Follow consent, privacy and accuracy rules when recording and summarising meetings"
  ],
  theory: [
    {
      heading: "How an AI meeting assistant works",
      content: "Picture a very fast note-taker sitting in your meeting. First the tool records the audio (a bot joins Zoom/Meet/Teams, or the app listens through your device). Speech-to-text converts the audio into a transcript. Speaker diarisation labels who said what ('Speaker 1', or real names when matched to the calendar invite). Then a large language model reads the transcript and produces a summary, a list of action items (owner + task + due date), decisions, questions and keywords. Finally, the tool shares the notes by email, Slack or CRM integrations.",
      points: [
        "Record -> Transcribe -> Identify speakers -> Summarise -> Extract actions/decisions -> Share",
        "Accuracy depends on audio quality, accents, crosstalk and jargon",
        "Summaries are only as good as the transcript – if a word is wrong in the transcript, the summary can be wrong too",
        "Most tools also let you search past meetings and ask questions ('What did the client say about budget?')"
      ],
      tip: "Use a headset, reduce background noise and ask people to say their names when they first speak – transcripts improve a lot."
    },
    {
      heading: "Otter.ai and Fireflies.ai",
      content: "Otter.ai gives live transcription and automatic summaries. Its assistant can join your scheduled Zoom, Google Meet or Teams calls, show a live transcript, capture slides and produce a summary with action items. Fireflies.ai is similar: its notetaker joins calls from your calendar, transcribes, summarises, and can push notes and tasks to tools like Slack, CRMs and project boards. Both have free tiers with limits and paid plans for more minutes and integrations.",
      points: [
        "Otter how-to: 1) Sign up at otter.ai. 2) Connect Google or Microsoft calendar. 3) Turn on auto-join for meetings (or click 'Record' for in-person). 4) After the call open the conversation -> Summary, Action items. 5) Edit speaker names and errors. 6) Share or export.",
        "Fireflies how-to: 1) Sign up at fireflies.ai. 2) Connect calendar and choose which meetings the notetaker joins. 3) Let the bot in when it requests to join. 4) Open the notebook after the meeting: overview, action items, topics. 5) Use the AI chat to ask questions about the meeting. 6) Turn on integrations (Slack, CRM, Notion).",
        "Both: tell participants a notetaker is present; many tools announce themselves in the meeting chat"
      ]
    },
    {
      heading: "Microsoft 365 Copilot in Teams and Outlook",
      content: "In organisations with Microsoft 365 Copilot licences, Copilot works inside Teams and Outlook using your work data with your existing permissions. In Teams meetings (with transcription turned on) you can ask Copilot 'Summarise what I missed', 'List action items with owners', or 'What were the unresolved questions?'. Intelligent recap creates notes after the meeting. In Outlook, Copilot can summarise long email threads, draft replies in a chosen tone and length, and coach you on clarity. Google Workspace offers similar features with Gemini in Gmail, Docs and Meet ('Take notes for me').",
      points: [
        "Teams how-to: 1) Start the meeting and turn on Recording/Transcription. 2) Open Copilot in the meeting. 3) Use a suggested prompt or type your own. 4) After the meeting, open the Recap tab for notes and tasks.",
        "Outlook how-to: 1) Open a long thread. 2) Click 'Summarize' (Copilot) at the top. 3) To reply, choose 'Draft with Copilot', describe what you want, choose tone/length. 4) Review and edit before sending.",
        "Copilot follows your organisation's data permissions – it cannot show you files you are not allowed to open",
        "Features vary by licence and admin settings"
      ]
    },
    {
      heading: "Notion AI and AI note organisation",
      content: "Notion AI works inside Notion pages and databases. You can select messy notes and ask it to summarise, find action items, fix grammar, translate, change tone or turn bullets into a table. It can fill database properties automatically (for example a 'Summary' or 'Priority' column) and answer questions across your workspace. Similar AI features exist in Microsoft Loop/OneNote with Copilot, Google Docs with Gemini, and Evernote.",
      points: [
        "Notion AI how-to: 1) Open a page with notes. 2) Select text or press Space on an empty line to open AI. 3) Choose 'Summarize' or 'Find action items' or type a custom instruction. 4) Insert below or Replace. 5) Convert action items into a task database with owners and dates.",
        "Keep a standard meeting template: Agenda, Notes, Decisions, Action items (Owner | Task | Due), Open questions",
        "Ask AI to always show 'Unclear / needs confirmation' items instead of guessing"
      ]
    },
    {
      heading: "Privacy, consent and accuracy rules",
      content: "Recording a meeting records other people's voices and opinions. Laws and company policies differ, but the professional default is: announce recording, get agreement, avoid recording confidential HR/legal/medical discussions unless approved, store recordings in company-approved tools, and set retention (auto-delete). Do not paste confidential transcripts into personal, non-approved AI tools. Treat AI summaries as drafts: check names, numbers, owners and deadlines before you send them out, because a wrong action item can cause real work problems.",
      points: [
        "Announce: 'This meeting is being recorded and summarised by AI – any objections?'",
        "Use company-approved tools only for internal or client data",
        "Review the summary before distribution; correct owners and dates",
        "Set retention and access (who can see the transcript?)"
      ],
      tip: "If someone objects to recording, turn it off and take manual notes – respecting consent builds trust."
    }
  ],
  examples: [
    {
      title: "Turn a raw transcript into minutes with action items",
      scenario: "You have the transcript of a 30-minute project call and need to send minutes to the team in 5 minutes.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) – use your company-approved AI tool for real work data",
        "Paste the prompt below, then paste the transcript under it",
        "Check every owner and due date against the transcript",
        "Copy the result into email or Notion and send"
      ],
      code: "You are a project coordinator.\nFrom the meeting transcript below, create minutes with these sections:\n1. Summary (max 5 bullets)\n2. Decisions\n3. Action items table: Owner | Task | Due date\n4. Open questions\nRules: use only information in the transcript. If an owner or date is not stated, write 'Not stated' – do not guess.\n\nTranscript:\n<paste transcript here>",
      prompt: {
        system: "You are a precise project coordinator. You never invent owners, dates or decisions.",
        user: "From the meeting transcript below, create minutes with sections: Summary (max 5 bullets), Decisions, Action items table (Owner | Task | Due date), Open questions. If an owner or date is not stated, write 'Not stated'.\n\nTranscript:\nPriya: Let's finalise the Q3 launch plan.\nArjun: I will prepare the pricing sheet by Friday.\nPriya: Good. Meera, can you book the venue?\nMeera: Sure, I will book the venue by 15 July.\nArjun: We decided to launch on 1 August.\nPriya: Sam will send the press release draft by Monday.\nPriya: Who handles the social media posts? Let's discuss next week."
      },
      result: "Summary: Q3 launch plan finalised; launch date set...\nDecisions: Launch on 1 August.\nAction items:\nArjun | Prepare pricing sheet | Friday\nMeera | Book venue | 15 July\nSam | Send press release draft | Monday\nOpen questions: Who handles social media posts? (to discuss next week)",
      explanation: "The 'do not guess / write Not stated' constraint reduces hallucinated owners and dates, which are the most harmful errors in meeting notes."
    },
    {
      title: "How action-item extraction works (runnable Python)",
      scenario: "See a simplified, rule-based version of what meeting tools do after transcription. Real tools use an LLM, but the input -> structured output idea is the same.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide) or run python3 locally",
        "Paste the code into main.py and click Run",
        "Add a new line to the transcript such as 'Ravi: I will fix the login bug by Tuesday.' and run again",
        "Notice what the rules miss (e.g. 'can you book the venue?') – this is why LLMs are used in real tools"
      ],
      code: "import re\n\ntranscript = \"\"\"Priya: Let's finalise the Q3 launch plan.\nArjun: I will prepare the pricing sheet by Friday.\nPriya: Good. Meera, can you book the venue?\nMeera: Sure, I will book the venue by 15 July.\nArjun: We decided to launch on 1 August.\nPriya: Sam will send the press release draft by Monday.\"\"\"\n\nactions, decisions = [], []\nfor line in transcript.splitlines():\n    speaker, text = line.split(\": \", 1)\n    m = re.search(r\"(?:I will|(\\w+) will) (.+?) by (.+?)\\.?$\", text)\n    if m:\n        owner = m.group(1) or speaker\n        actions.append((owner, m.group(2), m.group(3)))\n    if \"decided\" in text.lower():\n        decisions.append(text)\n\nprint(\"ACTION ITEMS\")\nfor i, (owner, task, due) in enumerate(actions, 1):\n    print(f\"{i}. {owner:<6} | {task:<28} | due {due}\")\nprint(\"DECISIONS\")\nfor d in decisions:\n    print(\"-\", d)\n",
      python: {
        files: {
          "main.py": `import re

transcript = """Priya: Let's finalise the Q3 launch plan.
Arjun: I will prepare the pricing sheet by Friday.
Priya: Good. Meera, can you book the venue?
Meera: Sure, I will book the venue by 15 July.
Arjun: We decided to launch on 1 August.
Priya: Sam will send the press release draft by Monday."""

actions, decisions = [], []
for line in transcript.splitlines():
    speaker, text = line.split(": ", 1)
    m = re.search(r"(?:I will|(\\w+) will) (.+?) by (.+?)\\.?$", text)
    if m:
        owner = m.group(1) or speaker
        actions.append((owner, m.group(2), m.group(3)))
    if "decided" in text.lower():
        decisions.append(text)

print("ACTION ITEMS")
for i, (owner, task, due) in enumerate(actions, 1):
    print(f"{i}. {owner:<6} | {task:<28} | due {due}")
print("DECISIONS")
for d in decisions:
    print("-", d)
`
        },
        stdin: ""
      },
      result: "ACTION ITEMS\n1. Arjun  | prepare the pricing sheet    | due Friday\n2. Meera  | book the venue               | due 15 July\n3. Sam    | send the press release draft | due Monday\nDECISIONS\n- We decided to launch on 1 August.",
      explanation: "The regex finds sentences of the form 'X will <task> by <date>' and uses the speaker as owner when the sentence says 'I will'. It misses requests phrased as questions, which is exactly why real meeting tools use an LLM to understand meaning instead of fixed patterns."
    },
    {
      title: "Summarise a long email thread and draft a reply (Copilot in Outlook style)",
      scenario: "A client thread has 14 emails about a delayed delivery. You need the status and a polite reply.",
      steps: [
        "In Outlook with Copilot: open the thread and click Summarize. Without Copilot: copy the thread into your approved AI chat tool",
        "Use the prompt below (or type it into 'Draft with Copilot')",
        "Check dates and commitments against the original emails",
        "Edit the tone if needed and send"
      ],
      code: "Summarise this email thread in 4 bullets: what the client wants, what we promised, current status, open risks.\nThen draft a reply that: apologises once, gives the new delivery date of 28 Nov, offers a 15-minute call, and stays under 120 words. Tone: professional and warm.",
      prompt: {
        system: "You are an account manager's email assistant. Be accurate, concise and polite.",
        user: "Summarise this email thread in 4 bullets: what the client wants, what we promised, current status, open risks. Then draft a reply that apologises once, gives the new delivery date of 28 Nov, offers a 15-minute call, and stays under 120 words.\n\nThread:\nClient (3 Nov): Where is our order of 200 chairs? It was due 1 Nov.\nUs (4 Nov): Sorry, the supplier delayed fabric. We expect 20 Nov.\nClient (18 Nov): Is 20 Nov still on? We have an event on 30 Nov.\nUs (19 Nov): Fabric arrived late again; production finishes 26 Nov."
      },
      result: "Bullets: client needs 200 chairs before a 30 Nov event; we promised 20 Nov; production now finishes 26 Nov; risk: tight margin before the event.\nReply: 'Dear ..., I'm sorry for the repeated delay. Production completes on 26 Nov and your 200 chairs will be delivered on 28 Nov, two days before your event...'",
      explanation: "A structured summary (want / promised / status / risk) makes the thread actionable, and explicit constraints (one apology, date, length) produce a reply that needs minimal editing."
    }
  ],
  tools: [
    { name: "Otter.ai", use: "Live transcription, meeting summaries and action items. How to use: 1) Sign up. 2) Connect calendar. 3) Enable auto-join or press Record. 4) After the call open Summary and Action items. 5) Fix speaker names. 6) Share/export.", url: "https://otter.ai" },
    { name: "Fireflies.ai", use: "AI notetaker that joins calls, summarises, and pushes notes/tasks to Slack, CRM and project tools. How to use: 1) Sign up and connect calendar. 2) Choose meetings to join. 3) Admit the bot. 4) Review the notebook. 5) Ask questions with the AI chat. 6) Enable integrations.", url: "https://fireflies.ai" },
    { name: "Microsoft 365 Copilot (Teams & Outlook)", use: "Meeting recap, live 'what did I miss', email thread summaries and draft replies using work data. How to use: 1) Turn on transcription in Teams. 2) Open Copilot and ask for summary/actions. 3) In Outlook click Summarize or Draft with Copilot. 4) Review before sending.", url: "https://www.microsoft.com/microsoft-365/copilot" },
    { name: "Notion AI", use: "Summarise notes, find action items, autofill database properties and answer questions across your workspace. How to use: 1) Open a page. 2) Select text or press Space. 3) Choose Summarize / Find action items. 4) Insert or Replace. 5) Move tasks into a database.", url: "https://www.notion.com/product/ai" },
    { name: "Gemini in Google Workspace", use: "Take notes in Google Meet, summarise Gmail threads and draft in Docs. How to use: 1) In Meet click 'Take notes for me' (if enabled). 2) In Gmail open the Gemini side panel and ask for a summary. 3) Review and edit.", url: "https://workspace.google.com/solutions/ai/" },
    { name: "Claude (claude.ai)", use: "Turn transcripts into minutes, draft follow-ups and status reports. How to use: 1) Paste a structured prompt. 2) Paste transcript. 3) Verify owners and dates.", url: "https://claude.ai" },
    { name: "Python IDE (in-app)", use: "Run the action-item extraction demo. How to use: open /tools/python-ide, paste code into main.py, click Run.", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "Describe the pipeline of an AI meeting assistant.", a: "Audio capture (bot joins the call or device mic) -> speech-to-text transcription -> speaker diarisation -> LLM summarisation and extraction (actions, decisions, questions) -> sharing and integrations (email, Slack, CRM, task tools) -> searchable archive.", level: "Easy" },
    { q: "What is speaker diarisation?", a: "The process of splitting audio by speaker and labelling who spoke when. It lets transcripts show 'Priya:' or 'Speaker 2:' and is needed to assign action items to the right person.", level: "Medium" },
    { q: "What can make an AI meeting summary inaccurate?", a: "Poor audio, crosstalk, accents, jargon or names the speech model doesn't know, wrong speaker labels, and LLM hallucination or over-summarisation (dropping nuance or inventing owners/dates). Humans should review before distributing.", level: "Medium" },
    { q: "How does Microsoft 365 Copilot respect data security?", a: "It works within the Microsoft 365 tenant using the user's existing permissions, so it only accesses content the user can already access, and it follows the organisation's compliance and admin settings.", level: "Medium" },
    { q: "What etiquette and legal steps should you follow before recording a meeting?", a: "Announce recording and AI note-taking, get agreement, follow local law and company policy, avoid recording sensitive HR/legal/medical meetings unless approved, use approved tools, and set retention and access controls.", level: "Easy" },
    { q: "How would you prompt an LLM to extract action items reliably?", a: "Give a clear role and output schema (Owner | Task | Due), instruct it to use only the transcript, write 'Not stated' for missing fields, and list ambiguous items separately. Optionally request JSON for automation and validate it.", level: "Medium" },
    { q: "Why might a company block personal AI notetakers?", a: "They can send confidential conversations to unapproved third-party servers, may store data outside required regions, and may join meetings without everyone's consent – creating legal and security risks.", level: "Medium" },
    { q: "How would you automatically turn meeting action items into Jira or Trello tasks?", a: "Have the notetaker or an LLM output structured JSON (owner, task, due date), then use an integration or automation tool (Zapier, Make, Power Automate) to create tasks, with a human approval step before creation to catch extraction errors.", level: "Hard" },
    { q: "Rule-based extraction vs LLM-based extraction – compare.", a: "Rules (regex) are predictable, cheap and explainable but miss varied phrasing. LLMs understand intent and paraphrase, handling questions like 'can you book the venue?', but can hallucinate and need validation and evaluation sets.", level: "Hard" }
  ],
  practice: [
    { task: "Record a 5-minute mock meeting with friends using Otter.ai or Fireflies (free tier) and compare its action items with your own notes.", hint: "Say names clearly and give at least three tasks with dates.", solution: "Count how many action items the tool captured correctly, which owners/dates were wrong, and note audio or phrasing issues that caused errors." },
    { task: "Write a reusable 'meeting minutes' prompt with sections and a 'do not guess' rule. Test it in the AI Prompt Lab.", hint: "Role, task, output sections, rules for missing information.", solution: "Open /tools/ai-lab, fill Role = project coordinator, Task = create minutes, Format = Summary/Decisions/Action table/Open questions, Constraints = only from transcript, 'Not stated' when missing. Run with a sample transcript." },
    { task: "Extend the Python demo so it also catches lines containing 'can you' as requests with owner = the person addressed.", hint: "Use a regex like r'(\\w+), can you (.+?)\\?'.", solution: "Add: m2 = re.search(r\"(\\w+), can you (.+?)\\?\", text); if m2: actions.append((m2.group(1), m2.group(2), 'Not stated')). Meera's 'book the venue' then appears twice, so de-duplicate by (owner, task)." },
    { task: "Use Notion AI (or Google Docs with Gemini) to turn a page of messy class notes into a structured study page.", hint: "Ask for headings, key terms table and 5 quiz questions.", solution: "Select the notes -> AI -> custom instruction: 'Reorganise into headings, add a key-terms table (Term | Meaning) and 5 quiz questions with answers at the end.' Review for errors." },
    { task: "Draft a team policy (6 bullets) for using AI notetakers.", hint: "Consent, approved tools, sensitive meetings, review, retention, access.", solution: "1) Announce AI notes at start. 2) Only approved tools. 3) No AI notes in HR/legal/medical meetings without approval. 4) Organiser reviews summary before sharing. 5) Transcripts auto-delete after 90 days. 6) Access limited to attendees." }
  ],
  quiz: [
    { question: "What does speaker diarisation do?", options: ["Translates audio", "Labels who spoke when", "Removes background music", "Compresses video"], answer: 1, explanation: "Diarisation separates and labels speakers in a recording." },
    { question: "Which instruction best reduces hallucinated owners in AI meeting notes?", options: ["Be creative", "Write 'Not stated' when the owner is not mentioned", "Make it longer", "Use emojis"], answer: 1, explanation: "Explicitly allowing 'Not stated' stops the model guessing." },
    { question: "Copilot in Outlook can access...", options: ["Every mailbox in the company", "Only content you already have permission to access", "Public internet emails", "Nothing at all"], answer: 1, explanation: "Microsoft 365 Copilot respects existing user permissions." },
    { question: "What should you do first when an AI notetaker joins a client call?", options: ["Hide it", "Announce it and get agreement", "Mute everyone", "Turn off the camera"], answer: 1, explanation: "Transparency and consent are the baseline etiquette and often a legal requirement." },
    { question: "Why do real meeting tools use LLMs instead of only regex rules?", options: ["Regex is illegal", "LLMs understand varied phrasing like questions and implied tasks", "LLMs never make mistakes", "Regex cannot read text"], answer: 1, explanation: "LLMs handle paraphrase and intent; rules only catch fixed patterns (but LLM output still needs review)." }
  ]
};
