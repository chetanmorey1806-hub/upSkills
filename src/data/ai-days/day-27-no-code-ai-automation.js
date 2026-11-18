export default {
  id: "day-27-no-code-ai-automation",
  title: "No-code AI Automation: Zapier, Make, n8n and Power Automate with AI Steps",
  module: "Module 4: AI Tools for Productivity",
  day: 27,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Automate repetitive work without writing code. Learn triggers, actions, filters, routers and data mapping, then add AI steps that classify, summarise, extract or draft text. Build the same 'AI email triage' flow in Zapier, Make, n8n and Power Automate, and learn testing, error handling, cost and privacy best practices.",
  objectives: [
    "Explain automation building blocks: trigger, action, filter, router/branch, mapping, loop",
    "Add an AI step (classify, extract, summarise, draft) to a workflow and get structured output",
    "Build an AI email/form triage flow in Zapier or Make step by step",
    "Know when to choose Zapier, Make, n8n or Power Automate",
    "Design safe automations: human approval, error handling, logging, cost and data privacy"
  ],
  theory: [
    {
      heading: "What is workflow automation? Triggers, actions and data",
      content: "An automation is a recipe: 'WHEN something happens, DO these steps'. The WHEN is the trigger (new email, new form response, new row in a sheet, a schedule like every Monday 9 AM, or a webhook call). The DO part is one or more actions (send a Slack message, create a Trello card, add a row, send an email). Each step produces data (fields like subject, sender, body) that you map into later steps. Think of a railway: the trigger is the train arriving, each action is a station, and mapping is moving passengers (data) from one station to the next.",
      points: [
        "Trigger: the event that starts a run (polling every few minutes or instant via webhook)",
        "Action: the work done in an app (create, update, send, search)",
        "Mapping: inserting data from earlier steps into fields of later steps",
        "Filter: continue only if a condition is true (e.g. category = 'urgent')",
        "Router/Paths/Switch: send data down different branches based on conditions",
        "Iterator/Loop: repeat steps for each item in a list"
      ]
    },
    {
      heading: "Adding AI steps: classify, extract, summarise, draft",
      content: "An AI step sends text to a language model with a prompt and returns the answer as data that later steps can use. Common uses: classify an email into billing/support/sales/spam; extract fields (name, order ID, amount) from messy text; summarise a long ticket; draft a reply for a human to approve; translate; score sentiment. All four platforms offer built-in AI steps or connectors to providers like Anthropic (Claude), OpenAI and Google, usually using your own API key or the platform's AI credits.",
      points: [
        "Ask for structured output (e.g. JSON with fixed keys, or one word from a fixed list) so filters and routers can use it",
        "Give allowed values: 'Reply with exactly one of: billing, support, sales, spam, other'",
        "Keep a human-in-the-loop for anything sent to customers or that moves money",
        "Each AI step costs tokens/credits – filter out spam BEFORE the AI step to save cost"
      ],
      syntax: "AI step prompt:\nClassify this email. Reply ONLY with JSON: {\"category\": \"billing|support|sales|spam|other\", \"urgent\": true|false, \"summary\": \"max 20 words\"}\nEmail subject: {{subject}}\nEmail body: {{body}}",
      tip: "{{subject}} and {{body}} are placeholders – in the editor you click the field from the trigger step to insert it."
    },
    {
      heading: "The four platforms – which to choose",
      content: "Zapier is the easiest: linear 'Zaps' with thousands of app integrations, Paths for branching, and AI features to build and run steps. Make (formerly Integromat) uses a visual canvas of modules connected by lines, great for complex branching, loops and data transformation, with operations-based pricing. n8n is a node-based, fair-code tool you can self-host (good for data control and developers) or use in the cloud; it has strong AI agent and LLM nodes. Microsoft Power Automate is built for Microsoft 365 (Outlook, Teams, SharePoint, Excel) and includes AI Builder and Copilot to create flows from a description, plus desktop automation (RPA).",
      points: [
        "Zapier: fastest start, beginner friendly, huge app library",
        "Make: visual and powerful for multi-branch data flows",
        "n8n: self-hostable, developer friendly, AI agent nodes, good when data must stay on your servers",
        "Power Automate: best inside Microsoft 365 companies, approvals in Teams, desktop RPA",
        "All have free tiers or trials; paid plans scale with tasks/operations/executions"
      ]
    },
    {
      heading: "Step-by-step: how to use each tool",
      content: "The same idea – trigger, AI step, branch, actions – is built slightly differently in each platform. Follow these sequences the first time; after that you will recognise the pattern everywhere.",
      points: [
        "Zapier: 1) zapier.com -> Create -> Zaps. 2) Trigger: choose app (Gmail) and event (New Email), connect account, Test. 3) + Action: an AI step (AI by Zapier, or Anthropic (Claude) / ChatGPT app), write the prompt and map {{subject}}/{{body}}, Test. 4) + Paths (or Filter) on the AI output. 5) Actions per path (Google Sheets: Create Row, Slack: Send Message). 6) Publish and watch Zap history.",
        "Make: 1) make.com -> Create a new scenario. 2) Click + and add a trigger module (Gmail: Watch emails). 3) Add an AI module (Anthropic Claude or OpenAI) and map fields. 4) Add a JSON parse module if the AI returns JSON. 5) Add a Router with filters on each route. 6) Add actions, click 'Run once' to test, then turn scheduling ON.",
        "n8n: 1) Open n8n cloud or your self-hosted instance -> New workflow. 2) Add trigger node (Gmail Trigger or Webhook). 3) Add an AI/LLM node (e.g. Anthropic chat model with a Basic LLM Chain, or an AI Agent node) and set credentials. 4) Add a Switch node on the AI result. 5) Add action nodes. 6) Execute workflow to test, then Activate.",
        "Power Automate: 1) make.powerautomate.com -> Create -> Automated cloud flow (or describe it to Copilot). 2) Trigger: 'When a new email arrives (V3)'. 3) Add an AI Builder / AI prompt action and map the email body. 4) Add Condition or Switch. 5) Actions: post in Teams, add row to Excel, Start an approval. 6) Save and Test."
      ]
    },
    {
      heading: "Making automations reliable, cheap and safe",
      content: "Automations run while you sleep, so mistakes repeat silently. Test with sample data, add error handling (Zapier error notifications, Make error handlers, n8n error workflow, Power Automate 'Configure run after'), log every run to a sheet, and set alerts. Control cost by filtering early, sending only needed text to the AI, and choosing smaller/faster models for simple classification. Protect privacy: use company-approved connectors, avoid sending sensitive personal data to AI steps unless approved, and store API keys only in the platform's credentials manager – never paste them inside prompts or shared docs.",
      points: [
        "Test with 5–10 real examples, including tricky ones",
        "Human approval step before customer-facing sends or payments",
        "Log input, AI output and action taken for auditing",
        "Handle AI failures: if output isn't valid JSON or category is unknown -> route to 'manual review'",
        "Least privilege: connect accounts with the minimum permissions needed"
      ],
      tip: "Start with 'AI drafts, human sends'. Move to full automation only after the flow has been accurate for weeks."
    }
  ],
  examples: [
    {
      title: "AI email triage flow – simulate the logic in Python",
      scenario: "Before building in Zapier/Make, understand the logic: trigger (new email) -> AI classify -> filter/router -> actions. This runnable simulation uses simple keyword rules in place of the AI step.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide) or run python3 locally",
        "Paste the code into main.py and click Run",
        "Add a new email dictionary (e.g. a payment failure) and see which branch it takes",
        "Map each part of the code to a platform block: emails list = trigger, ai_classify = AI step, if/elif = router, print = action"
      ],
      code: "Trigger (new email) -> AI step (classify) -> Router -> Actions\nspam -> stop | billing -> Google Sheet + draft reply | support -> Trello card (+ Slack if urgent)",
      python: {
        files: {
          "main.py": `# Simulates a Zapier/Make/n8n flow: Trigger -> AI step -> Filter/Router -> Actions
emails = [
    {"from": "ravi@client.com", "subject": "Invoice 4521 overdue?", "body": "We have not received the invoice copy for March."},
    {"from": "noreply@promo.com", "subject": "50% OFF today", "body": "Huge sale on shoes."},
    {"from": "anita@client.com", "subject": "App crashing", "body": "The app crashes when I upload a photo. Urgent!"},
]

def ai_classify(email):   # stands in for the "AI by Zapier" / OpenAI / Claude step
    text = (email["subject"] + " " + email["body"]).lower()
    if "invoice" in text or "payment" in text:
        cat = "billing"
    elif "crash" in text or "error" in text or "bug" in text:
        cat = "support"
    elif "off" in text or "sale" in text:
        cat = "spam"
    else:
        cat = "other"
    urgent = "urgent" in text
    return {"category": cat, "urgent": urgent}

for e in emails:
    r = ai_classify(e)
    if r["category"] == "spam":
        action = "Skip (filter stopped the run)"
    elif r["category"] == "billing":
        action = "Add row to Google Sheet 'Billing' + reply draft"
    else:
        action = "Create Trello card" + (" + Slack alert #urgent" if r["urgent"] else "")
    print(f"{e['subject']:<24} -> {r['category']:<8} urgent={r['urgent']!s:<5} -> {action}")
`
        },
        stdin: ""
      },
      result: "Invoice 4521 overdue?    -> billing  urgent=False -> Add row to Google Sheet 'Billing' + reply draft\n50% OFF today            -> spam     urgent=False -> Skip (filter stopped the run)\nApp crashing             -> support  urgent=True  -> Create Trello card + Slack alert #urgent",
      explanation: "Every no-code platform runs exactly this loop for each trigger event. Keyword rules are brittle (an email saying 'no error, just a question' would be misclassified), which is why the real flow uses an AI step with a fixed list of allowed categories."
    },
    {
      title: "Build the triage Zap in Zapier with an AI step",
      scenario: "A small business wants support emails turned into Trello cards and billing emails logged in Google Sheets automatically.",
      steps: [
        "Go to zapier.com -> Create -> Zaps",
        "Trigger: Gmail -> New Email (optionally filtered by label 'inbox-support'); connect account; click Test trigger",
        "Action: choose an AI step (AI by Zapier, or the Anthropic (Claude) app) and paste the prompt below; map Subject and Body Plain from the trigger; Test",
        "Add Paths: Path A condition category = billing; Path B category = support; Path C category = other",
        "Path A action: Google Sheets -> Create Spreadsheet Row (Date, From, Summary). Path B: Trello -> Create Card (Title = Subject, Description = Summary). Path C: Gmail -> Add label 'manual-review'",
        "Test each path with a sample email, then Publish and check Zap history after a day"
      ],
      code: "Classify the customer email below.\nReply ONLY with valid JSON and nothing else:\n{\"category\": \"billing\" | \"support\" | \"sales\" | \"spam\" | \"other\", \"urgent\": true | false, \"summary\": \"<max 20 words>\"}\n\nSubject: {{subject}}\nBody: {{body_plain}}",
      prompt: {
        system: "You are an email triage assistant. You output only valid JSON with the exact keys requested.",
        user: "Classify the customer email below. Reply ONLY with valid JSON: {\"category\": \"billing\" | \"support\" | \"sales\" | \"spam\" | \"other\", \"urgent\": true | false, \"summary\": \"<max 20 words>\"}\n\nSubject: App crashing\nBody: The app crashes when I upload a photo. Urgent!"
      },
      result: "{\"category\": \"support\", \"urgent\": true, \"summary\": \"App crashes when uploading a photo; customer marked it urgent.\"}",
      explanation: "A fixed category list and JSON output make the AI result machine-usable: Paths can test category exactly. Anything unexpected falls into 'other' for manual review, which is your safety net."
    },
    {
      title: "Same flow in Make and n8n, plus a Power Automate approval",
      scenario: "Your team prefers a visual canvas (Make), a self-hosted tool (n8n), or Microsoft 365 (Power Automate). Build the equivalent flow.",
      steps: [
        "Make: Create scenario -> Gmail 'Watch emails' -> Anthropic Claude (or OpenAI) 'Create a message' module with the triage prompt -> JSON 'Parse JSON' -> Router with 3 filtered routes -> Google Sheets / Trello / Gmail modules -> Run once -> schedule ON",
        "n8n: New workflow -> Gmail Trigger -> Basic LLM Chain with an Anthropic chat model (credentials in n8n Credentials) -> Structured/JSON output parser -> Switch on category -> action nodes -> Execute workflow -> Activate",
        "Power Automate: Create -> Automated cloud flow -> 'When a new email arrives (V3)' -> AI prompt / AI Builder action to classify -> Switch on category -> for billing 'Add a row into a table' (Excel), for support 'Post message in a chat or channel' (Teams) -> for draft replies add 'Start and wait for an approval' -> Save -> Test",
        "In every tool, add an error path: if parsing fails, send the email to a 'manual review' label/channel"
      ],
      code: "Platform mapping\nConcept        | Zapier        | Make            | n8n            | Power Automate\nTrigger        | Trigger step  | Trigger module  | Trigger node   | Trigger\nAI step        | AI action     | AI module       | LLM/Agent node | AI Builder / AI prompt\nBranch         | Paths         | Router+filters  | Switch / IF    | Condition / Switch\nLoop           | Looping       | Iterator        | Loop / items   | Apply to each\nError handling | Error alerts  | Error handlers  | Error workflow | Configure run after",
      result: "Three working versions of the same triage logic. In Power Automate, billing replies wait in Teams for a manager's Approve/Reject before sending.",
      explanation: "Once you understand trigger -> AI -> branch -> action, switching platforms is mostly learning new names for the same blocks. Approvals add the human-in-the-loop for risky actions."
    },
    {
      title: "Weekly AI summary report on a schedule",
      scenario: "Every Monday at 9 AM, summarise last week's form feedback from a Google Sheet and post it to Slack/Teams.",
      steps: [
        "Trigger: Schedule (Zapier 'Schedule by Zapier', Make scheduling, n8n Schedule Trigger, Power Automate Recurrence) – weekly, Monday 09:00",
        "Action: get rows from the sheet for the last 7 days",
        "Combine rows into one text block (Zapier Formatter / Make Text aggregator / n8n Aggregate)",
        "AI step with the prompt below",
        "Post the result to a Slack or Teams channel",
        "Run a manual test with last week's data before switching it on"
      ],
      code: "You are a product analyst. Below are last week's customer feedback comments (one per line).\nWrite a Slack-friendly summary:\n- Top 3 themes with count of mentions\n- 2 representative quotes (exact text)\n- 1 suggested action\nKeep under 120 words. Do not invent counts – count only what is listed.\n\nFeedback:\n{{combined_feedback}}",
      prompt: {
        system: "You are a careful product analyst who counts precisely and quotes exactly.",
        user: "Below are last week's customer feedback comments (one per line). Write a Slack-friendly summary: top 3 themes with count of mentions, 2 representative quotes (exact text), 1 suggested action. Under 120 words.\n\nFeedback:\nDelivery was late\nLove the new app design\nDelivery took 6 days\nApp crashes on upload\nGreat support team\nDelivery partner was rude"
      },
      result: "Top themes: Delivery problems (3), App experience (2: 1 positive design, 1 crash), Support (1 positive).\nQuotes: 'Delivery took 6 days', 'App crashes on upload'.\nAction: Review delivery partner SLAs this week.",
      explanation: "Scheduled triggers plus aggregation turn many rows into one AI call – cheaper than calling AI per row and easier for the team to read."
    }
  ],
  tools: [
    { name: "Zapier", use: "Beginner-friendly linear automations with AI steps and Paths. How to use: 1) Create Zap. 2) Pick trigger app/event and test. 3) Add AI action and map fields. 4) Add Paths/Filter. 5) Add actions. 6) Publish and monitor Zap history.", url: "https://zapier.com" },
    { name: "Make", use: "Visual scenario builder for complex, branching data flows. How to use: 1) Create scenario. 2) Add trigger module. 3) Add AI module + Parse JSON. 4) Router with filters. 5) Run once to test. 6) Turn scheduling on.", url: "https://www.make.com" },
    { name: "n8n", use: "Node-based workflows, self-hostable, with LLM chain and AI agent nodes. How to use: 1) New workflow. 2) Trigger node. 3) LLM/Agent node with credentials. 4) Switch node. 5) Action nodes. 6) Execute, then Activate.", url: "https://n8n.io" },
    { name: "Microsoft Power Automate", use: "Microsoft 365 automations with AI Builder, Copilot flow creation and Teams approvals. How to use: 1) Create automated cloud flow (or describe it to Copilot). 2) Add trigger. 3) Add AI prompt/AI Builder action. 4) Condition/Switch. 5) Actions + approval. 6) Save and Test.", url: "https://make.powerautomate.com" },
    { name: "Claude (claude.ai)", use: "Design and test your AI-step prompts before putting them in a workflow. How to use: paste the prompt with 5 sample inputs and check the JSON is always valid.", url: "https://claude.ai" },
    { name: "AI Prompt Lab (in-app)", use: "Build and quality-check the classification prompt, then run it with your API key. How to use: open /tools/ai-lab, set format = JSON, add constraints, run with samples.", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What are triggers and actions in workflow automation?", a: "A trigger is the event that starts a workflow run (new email, form submission, schedule, webhook). Actions are the steps that run afterwards in connected apps (create a record, send a message, update a row).", level: "Easy" },
    { q: "Why should the AI step return structured output like JSON?", a: "Later steps (filters, routers, field mapping) need predictable values. Free text varies run to run; JSON with fixed keys and an allowed-values list can be parsed and tested reliably, and invalid output can be detected and routed to manual review.", level: "Medium" },
    { q: "Compare Zapier, Make, n8n and Power Automate.", a: "Zapier: simplest, largest app library, linear with Paths. Make: visual canvas, strong for branching and data transformation. n8n: node-based, self-hostable, developer friendly with AI agent nodes. Power Automate: deep Microsoft 365 integration, approvals, desktop RPA and AI Builder.", level: "Medium" },
    { q: "What is a webhook?", a: "A URL that receives an HTTP request when an event happens in another system, letting a workflow start instantly instead of polling for changes.", level: "Easy" },
    { q: "How do you control the cost of AI steps in automations?", a: "Filter irrelevant items before the AI step, send only needed text, batch/aggregate items into one call where possible, use a smaller faster model for simple classification, cap output length, and monitor task/credit usage.", level: "Medium" },
    { q: "What is human-in-the-loop and when is it required?", a: "A step where a person reviews or approves AI output before it takes effect. It is needed for customer-facing messages, financial actions, legal/HR content and early stages of any new automation.", level: "Easy" },
    { q: "How would you handle an AI step that returns invalid JSON or an unknown category?", a: "Validate the output (parse JSON, check keys and allowed values); on failure, retry once with a stricter prompt or route the item to a manual-review queue and log the error. Never let unvalidated output drive actions.", level: "Hard" },
    { q: "When would you choose self-hosted n8n over a cloud tool?", a: "When data must stay within your own infrastructure for compliance, when you need custom code nodes, high execution volume at predictable cost, or integration with internal systems not reachable from the cloud.", level: "Hard" },
    { q: "What security practices apply to automation credentials?", a: "Store API keys and OAuth connections only in the platform's credential manager, use least-privilege scopes and service accounts, rotate keys, restrict who can edit flows, and never paste keys into prompts, sheets or shared docs.", level: "Medium" }
  ],
  practice: [
    { task: "Build a free Zapier or Make flow: new Google Form response -> AI summary -> row in a Google Sheet.", hint: "Use a prompt that returns one-line summary + sentiment (positive/neutral/negative).", solution: "Trigger: Google Forms New Response. AI step prompt: 'Return JSON {\"sentiment\": \"positive|neutral|negative\", \"summary\": \"<15 words>\"} for: {{answer}}'. Parse JSON (Make) or use fields (Zapier). Action: Google Sheets Create Row with timestamp, sentiment, summary." },
    { task: "Write a triage prompt with 5 allowed categories and test it on 8 tricky emails in the AI Prompt Lab.", hint: "Include ambiguous ones: 'no error, just a question', a refund request with an angry tone.", solution: "In /tools/ai-lab set format = JSON with fixed keys, constraint = 'only these categories; if unsure use other'. Record which samples were misclassified and refine the category definitions." },
    { task: "Extend the Python simulation: add an 'other' route that adds the email to a manual-review list and print that list at the end.", hint: "Create review = [] before the loop.", solution: "Add elif r['category'] == 'other': action = 'Manual review'; review.append(e['subject']). After the loop: print('Manual review:', review)." },
    { task: "Design (on paper) a Power Automate flow where AI drafts replies to leave requests and a manager approves in Teams.", hint: "Trigger, AI prompt, Start and wait for an approval, Condition on outcome, Send email.", solution: "When a new email arrives (subject contains 'Leave') -> AI prompt drafts a reply -> Start and wait for an approval (Approve/Reject) assigned to manager -> Condition: Approve -> Send email with draft; Reject -> notify employee to contact manager." },
    { task: "List 5 data-privacy rules for your team's automations.", hint: "Think about what text goes to AI and where credentials live.", solution: "1) Only approved connectors. 2) Strip or mask personal data before AI steps when possible. 3) Keys only in credential manager. 4) Least-privilege accounts. 5) Log runs and review access quarterly." }
  ],
  quiz: [
    { question: "In 'When a new form response arrives, add a row to a sheet', what is the trigger?", options: ["Adding a row", "A new form response", "The sheet", "The AI step"], answer: 1, explanation: "The event that starts the workflow is the trigger." },
    { question: "Why put a spam filter BEFORE the AI step?", options: ["AI cannot read spam", "It saves AI cost and reduces noise", "Filters must be first by law", "It makes the flow slower"], answer: 1, explanation: "Filtering early avoids paying for AI calls on items you will discard." },
    { question: "Which tool is best known for being self-hostable?", options: ["Zapier", "Power Automate", "n8n", "Gmail"], answer: 2, explanation: "n8n can be self-hosted on your own servers." },
    { question: "What should happen when the AI step returns an unexpected category?", options: ["Delete the item", "Route it to manual review", "Send it to the customer", "Ignore the error"], answer: 1, explanation: "A manual-review route is the safety net for unexpected AI output." },
    { question: "In Make, which module sends data down different branches?", options: ["Router", "Iterator", "Aggregator", "Webhook"], answer: 0, explanation: "A Router with filters splits the flow into routes." }
  ]
};
