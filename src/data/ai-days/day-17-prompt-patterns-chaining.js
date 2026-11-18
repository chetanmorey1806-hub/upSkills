export default {
  id: "day-17-prompt-patterns-chaining",
  title: "Prompt Patterns: Persona, Template, Critique-and-Refine, Iterative Refinement, Prompt Chaining",
  module: "Module 3: Prompt Engineering",
  day: 17,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Learn reusable prompt patterns that professionals use every day: personas, fill-in templates, asking the AI to critique and improve its own draft, refining step by step in conversation, and chaining prompts where the output of one step feeds the next.",
  objectives: [
    "Apply the persona pattern to get expert-level or audience-specific answers",
    "Build reusable prompt templates with placeholders",
    "Use critique-and-refine to improve drafts against a checklist",
    "Run iterative refinement conversations efficiently",
    "Design a prompt chain for a multi-stage task such as research -> outline -> draft -> review"
  ],
  theory: [
    {
      heading: "What is a prompt pattern?",
      content: "A prompt pattern is a reusable recipe for solving a common type of problem, similar to design patterns in programming or standard formulas in Excel. Instead of inventing a new prompt each time, you pick the pattern that fits the job and fill in the details. Today you learn five widely used patterns.",
      points: [
        "Persona - 'Act as X for audience Y'",
        "Template - fill-in-the-blanks prompt with placeholders",
        "Critique-and-refine - draft, criticise against criteria, rewrite",
        "Iterative refinement - improve the output over several short follow-ups",
        "Prompt chaining - split a workflow into steps; each step's output becomes the next step's input"
      ]
    },
    {
      heading: "Persona pattern",
      content: "You assign the AI a specific identity, expertise or viewpoint, and often a specific audience. Personas change vocabulary, depth, priorities and tone. You can also flip it: ask the AI to act as your AUDIENCE ('Act as a strict interviewer', 'Act as a confused first-time customer') to test your work. Personas should be specific and realistic: 'senior chartered accountant who audits small businesses' is better than 'expert'.",
      syntax: `Act as a [specific role with experience].
Your audience is [who].
Your goal is to [outcome].`,
      tip: "Interview practice trick: 'Act as a technical interviewer for a Power BI developer role. Ask me one question at a time, wait for my answer, then give feedback and a score out of 10.'"
    },
    {
      heading: "Template pattern",
      content: "A template is a prompt with placeholders like {topic}, {audience}, {word_limit}. Teams keep tested templates in a shared library so everyone gets consistent, high-quality results. Templates can be stored in Claude Projects, ChatGPT Custom GPTs, Gemini Gems, the AI Prompt Lab template library, or in code as string variables.",
      syntax: `Write a {content_type} about {topic} for {audience}.
Tone: {tone}. Length: {word_limit} words.
Must include: {must_include}.
Avoid: {avoid}.`
    },
    {
      heading: "Critique-and-refine pattern",
      content: "First draft, then critique, then rewrite. The key is to give the critique a clear checklist or rubric (clarity, accuracy, tone, length, call to action) so feedback is specific. You can do it in one prompt ('Draft, then critique against these criteria, then provide the improved version') or in separate turns. For important work, use a separate 'reviewer' persona so the critique is more independent.",
      syntax: `1. Write a first draft.
2. Critique it against: [criteria list]. List specific weaknesses.
3. Rewrite the draft fixing every weakness.
Show only the critique and the final version.`,
      points: [
        "Generic 'make it better' gives generic changes - give criteria",
        "Ask for scores (1-10) per criterion to make progress measurable",
        "Stop after 2-3 rounds; more rounds often add little"
      ]
    },
    {
      heading: "Iterative refinement",
      content: "Real work rarely ends with one prompt. After the first answer you steer: 'shorter', 'more formal', 'add a table', 'remove point 3', 'make the opening stronger'. Good iteration is specific and changes one or two things at a time. When the conversation becomes long and messy, start a fresh chat with a consolidated prompt that includes everything you learned - long chats can drift and use more tokens.",
      points: [
        "Give targeted feedback: say what to keep and what to change",
        "Refer to parts precisely: 'In paragraph 2...', 'Bullet 3...'",
        "When satisfied, ask: 'Write the single prompt that would have produced this final version' - save it as a template"
      ]
    },
    {
      heading: "Prompt chaining",
      content: "Prompt chaining splits a complex workflow into a sequence of smaller prompts. Each step has one clear job, and its output is passed as input to the next step. Analogy: a factory assembly line - each station does one task well. Chains are easier to debug (you can see which step failed), each step can use a different model or effort level, and you can insert checks between steps. This is the foundation for automation tools (Day 27) and agents (Day 33).",
      syntax: `Step 1 (Extract):  notes -> list of key facts
Step 2 (Outline):  key facts -> outline
Step 3 (Draft):    outline -> full draft
Step 4 (Review):   draft + checklist -> issues + final version`,
      points: [
        "Pass outputs between steps inside tags like <facts>...</facts>",
        "Validate between steps (e.g. check JSON parses before moving on)",
        "Use a cheaper/faster model for simple steps and a stronger model for hard steps"
      ]
    }
  ],
  examples: [
    {
      title: "Persona pattern: mock interview for a data analyst role",
      scenario: "Sneha is preparing for a data analyst interview. A plain prompt 'give me interview questions' produces a long list. The persona pattern turns the AI into an interactive interviewer that asks one question at a time and gives feedback.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the persona prompt below and press Enter",
        "Answer the first question in your own words",
        "Read the feedback and score, then continue for 5 questions",
        "At the end ask: 'Summarise my strengths and 3 areas to improve.'"
      ],
      code: `BAD PROMPT:
give me data analyst interview questions

GOOD PROMPT (persona):
Act as a senior data analytics hiring manager at a mid-size e-commerce company.
You are interviewing me for a Junior Data Analyst role (Excel, SQL, Power BI).
Rules:
- Ask ONE question at a time, then wait for my answer.
- After my answer give: score out of 10, what was good, what was missing, a model answer in max 60 words.
- Mix technical (SQL, DAX, Excel) and scenario questions; increase difficulty gradually.
- Ask 5 questions in total.
Start with the first question.`,
      prompt: {
        system: "Act as a senior data analytics hiring manager at a mid-size e-commerce company interviewing a candidate for a Junior Data Analyst role (Excel, SQL, Power BI). Ask ONE question at a time and wait. After each answer give: score out of 10, what was good, what was missing, and a model answer in max 60 words. Ask 5 questions in total, increasing difficulty.",
        user: "I am ready. My answer to your question will follow. Please start with the first question."
      },
      result: `Welcome! Let's begin.

Question 1 of 5 (Excel):
Our sales team sends a sheet with 20,000 orders. You need total revenue per city, but some city names are written as "pune", "Pune " and "PUNE". How would you clean this and get the totals?

(Take your time and answer in your own words.)

--- after the candidate answers "I will use pivot table" ---

Score: 4/10
Good: Pivot table is the right tool for totals by city.
Missing: You did not clean the inconsistent names first, so "pune" and "PUNE " would show as separate rows.
Model answer: Add a helper column =PROPER(TRIM(B2)) to standardise names (or use Power Query: Trim + Capitalize Each Word), then build a PivotTable with City in Rows and Revenue as Sum. Check for remaining spelling variants with a filter.`,
      explanation: "The persona sets expertise and context, and the rules turn a one-shot list into an interactive coaching session. Using the AI as a role-play partner is one of the most practical uses for students and job seekers."
    },
    {
      title: "Critique-and-refine: improving a cold email",
      scenario: "A freelancer writes a cold email to a restaurant owner offering Power BI dashboards. He asks the AI to critique it against a checklist and rewrite it.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt with your draft in <draft> tags",
        "Read the scored critique - do you agree with each point?",
        "Use the final version, or reply with one more targeted change"
      ],
      code: `Critique my cold email against these criteria, scoring each 1-10:
1. Clear benefit for the reader in the first 2 lines
2. Specific and believable (no hype)
3. Length under 120 words
4. One clear call to action
5. Professional but friendly tone

Then rewrite it to score 9+ on all criteria. Show: the score table, then the final email.

<draft>
Hello Sir, I am a very experienced data expert and I make the best dashboards in Power BI.
Dashboards are the future and every business needs it. I have done many projects. Please
contact me if you want to grow your business. I can do anything related to data. Thanks.
</draft>

Context: The restaurant has 2 branches in Nagpur and uses Petpooja POS which exports Excel reports.`,
      prompt: {
        system: "You are a B2B sales copywriting coach. Critique honestly against the given criteria and then rewrite.",
        user: "Critique my cold email against these criteria, scoring each 1-10:\n1. Clear benefit for the reader in the first 2 lines\n2. Specific and believable (no hype)\n3. Length under 120 words\n4. One clear call to action\n5. Professional but friendly tone\n\nThen rewrite it to score 9+ on all criteria. Show: the score table, then the final email.\n\n<draft>\nHello Sir, I am a very experienced data expert and I make the best dashboards in Power BI. Dashboards are the future and every business needs it. I have done many projects. Please contact me if you want to grow your business. I can do anything related to data. Thanks.\n</draft>\n\nContext: The restaurant has 2 branches in Nagpur and uses Petpooja POS which exports Excel reports."
      },
      result: `| Criterion             | Score | Issue                                                    |
|-----------------------|-------|----------------------------------------------------------|
| Benefit in first lines| 2     | Opens with "I am..." - about you, not the owner          |
| Specific, believable  | 2     | "best", "anything", "many projects" are vague hype       |
| Under 120 words       | 9     | Short enough                                             |
| One clear CTA         | 3     | "contact me if..." is weak, no next step                 |
| Tone                  | 6     | Polite but generic                                       |

Final email:

Subject: See both Nagpur branches' daily sales on one screen

Hello Mr. Deshmukh,

Your Petpooja POS already exports Excel reports for each branch. I can turn those files into one Power BI dashboard showing daily sales, best-selling dishes and peak hours for both branches - updated every morning without manual work.

I recently built a similar dashboard for a 3-outlet cafe in Pune, which helped them spot slow-moving menu items.

Could I show you a 10-minute demo using sample data this Thursday or Friday?

Regards,
Amit Kale | Power BI Freelancer | 98XXXXXX10`,
      explanation: "Criteria turn 'make it better' into specific, measurable fixes. The context about Petpooja exports lets the rewrite speak the owner's language. Check that any claims (like the Pune cafe project) are TRUE for you - never send AI-invented achievements."
    },
    {
      title: "Prompt chaining: from meeting notes to a client update email",
      scenario: "A project coordinator converts rough meeting notes into a polished client email in 3 chained steps: extract facts -> draft email -> review. Each step's output is pasted into the next step.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run STEP 1 with your notes; copy the <facts> output",
        "Run STEP 2, pasting the facts inside <facts> tags",
        "Run STEP 3, pasting the draft inside <draft> tags",
        "Optional: build the same chain in AI Prompt Lab as three saved templates"
      ],
      code: `STEP 1 - EXTRACT
From the notes in <notes>, list: decisions, completed items, pending items with owner
and date, risks. Output inside <facts> tags as bullets. Do not add anything not in the notes.

<notes>
call w/ client (Sharma Pharma) 12 nov. sales dashboard v1 approved. they want region filter
+ monthly target line. data from SAP - their IT (Vikas) will give access by 18 nov. we deliver
v2 on 28 nov if access on time. risk - SAP access delay. invoice 1 to be raised this week.
</notes>

STEP 2 - DRAFT
Using only the facts in <facts>, write a professional client update email to Mr. Sharma.
Structure: thank-you line, what's done, next steps (owner + date), one risk, sign-off. Max 150 words.

STEP 3 - REVIEW
Check the email in <draft> against <facts>: list any fact that is missing, changed or invented.
Then output the corrected final email.`,
      prompt: {
        system: "You are a project coordinator's assistant. Use only the facts provided. Never invent dates, names or commitments.",
        user: "Using only the facts below, write a professional client update email to Mr. Sharma. Structure: thank-you line, what's done, next steps (owner + date), one risk, sign-off. Max 150 words.\n\n<facts>\n- Decision: Sales dashboard v1 approved by client (Sharma Pharma) on 12 Nov\n- New requirements: region filter, monthly target line\n- Pending: SAP data access - owner Vikas (client IT) - by 18 Nov\n- Pending: Deliver dashboard v2 - our team - 28 Nov (if SAP access is on time)\n- Pending: Raise invoice 1 - our team - this week\n- Risk: SAP access delay would delay v2\n</facts>"
      },
      result: `Subject: Sales Dashboard - Update after our call on 12 Nov

Dear Mr. Sharma,

Thank you for your time on 12 November and for approving the Sales Dashboard v1.

Next steps:
- Vikas (your IT team) to share SAP data access by 18 November
- Our team to deliver Dashboard v2 with the region filter and monthly target line by 28 November
- We will share Invoice 1 this week

Risk: The 28 November date depends on SAP access by 18 November. If access is delayed, we will share a revised date immediately.

Please let us know if we missed anything.

Best regards,
Neha Joshi
Project Coordinator`,
      explanation: "Step 1 converts messy notes into clean facts, Step 2 only has to write, and Step 3 catches invented or missing details. If the final email is wrong, you can see exactly which step failed. This is how many AI automations in Zapier/Make/n8n are built (Day 27)."
    },
    {
      title: "Prompt chaining in code with a reusable template (Python)",
      scenario: "A developer automates a 2-step chain: generate an outline from a topic, then write a LinkedIn post from the outline. The template uses placeholders filled by Python.",
      steps: [
        "pip install anthropic and set ANTHROPIC_API_KEY",
        "Save as chain.py and run python chain.py",
        "Change TOPIC and AUDIENCE and run again - the template stays the same",
        "Add a third step: a review prompt that checks the post is under 120 words"
      ],
      code: `import anthropic

client = anthropic.Anthropic()
MODEL = "claude-opus-5-5"

def ask(system, user, max_tokens=800):
    r = client.messages.create(model=MODEL, max_tokens=max_tokens, system=system,
                               messages=[{"role": "user", "content": user}])
    if r.stop_reason == "refusal":
        raise RuntimeError("Model refused")
    return r.content[0].text

OUTLINE_TEMPLATE = """Topic: {topic}
Audience: {audience}
Create an outline of exactly 4 bullet points for a LinkedIn post. Bullets only."""

POST_TEMPLATE = """Write a LinkedIn post using only this outline:
<outline>
{outline}
</outline>
Hook first line, short paragraphs, under 120 words, end with a question, 2 hashtags."""

TOPIC = "3 Excel skills that saved me hours as a fresher analyst"
AUDIENCE = "final-year students and freshers"

outline = ask("You are a LinkedIn content strategist.",
              OUTLINE_TEMPLATE.format(topic=TOPIC, audience=AUDIENCE))
post = ask("You are a LinkedIn ghostwriter. Friendly, specific, no hype.",
           POST_TEMPLATE.format(outline=outline))
print("OUTLINE:\\n", outline, "\\n\\nPOST:\\n", post)`,
      prompt: {
        system: "You are a LinkedIn ghostwriter. Friendly, specific, no hype.",
        user: "Write a LinkedIn post using only this outline:\n<outline>\n- Hook: I used to spend 3 hours on a weekly report\n- Skill 1: XLOOKUP instead of manual matching\n- Skill 2: PivotTables for summaries in minutes\n- Skill 3: Power Query to clean and refresh data automatically\n</outline>\nHook first line, short paragraphs, under 120 words, end with a question, 2 hashtags."
      },
      result: `I used to spend 3 hours every Monday on one weekly report.

Now it takes 20 minutes. Three Excel skills made the difference:

1. XLOOKUP - no more matching customer IDs by hand across two sheets.

2. PivotTables - summaries by region and product in a few clicks instead of long SUMIF formulas.

3. Power Query - I clean the raw export once, and every week I just click Refresh.

None of these are advanced. They just remove the boring, repeated work.

Which Excel skill saved YOU the most time?

#Excel #DataAnalytics`,
      explanation: "Templates with placeholders make the chain reusable for any topic. Each step has a focused job and its own system prompt. In real projects you would add validation between steps (e.g. check the outline has 4 bullets before writing the post)."
    }
  ],
  tools: [
    { name: "Claude Projects", use: "Save personas and templates as project instructions for repeated use", url: "https://claude.ai" },
    { name: "ChatGPT Custom GPTs", use: "Package a persona + instructions + files into a reusable assistant", url: "https://chatgpt.com" },
    { name: "Gemini Gems", use: "Create custom expert personas with saved instructions", url: "https://gemini.google.com" },
    { name: "AI Prompt Lab (in-app)", use: "Template library and prompt builder to save and reuse patterns", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What is a prompt pattern?", a: "A reusable prompt structure for a common problem type - like persona, template, critique-and-refine or chaining - that can be filled with task-specific details.", level: "Easy" },
    { q: "Explain the persona pattern with an example.", a: "You assign the model a role and audience, e.g. 'Act as a senior tax consultant explaining GST to a small shop owner.' It shapes vocabulary, depth and priorities. A flipped persona (act as the interviewer/customer) is useful for practice and testing.", level: "Easy" },
    { q: "What is critique-and-refine and how do you make it effective?", a: "The model drafts, critiques the draft and rewrites it. It works best with explicit criteria or a rubric, scores per criterion, and a limited number of rounds.", level: "Medium" },
    { q: "What is prompt chaining and what are its advantages?", a: "Splitting a task into sequential prompts where each output feeds the next. Advantages: each step is simpler and more accurate, failures are easy to locate, checks can be inserted between steps, and different models/effort levels can be used per step.", level: "Medium" },
    { q: "Prompt chaining vs one long prompt - when to use which?", a: "Use one prompt for simple tasks. Use chaining for multi-stage work (extract -> transform -> write -> review), when steps need validation, or when one prompt produces inconsistent results.", level: "Medium" },
    { q: "How do you pass data between chain steps safely?", a: "Wrap outputs in clear tags, keep steps grounded ('use only the facts in <facts>'), validate structured outputs before the next step, and stop the chain on errors or refusals.", level: "Medium" },
    { q: "What is iterative refinement and a common mistake in it?", a: "Improving output through successive targeted follow-ups. A common mistake is vague feedback ('make it better') or a very long drifting chat; better to give specific changes and restart with a consolidated prompt when needed.", level: "Medium" },
    { q: "How would you build a team prompt library?", a: "Collect tested prompts as templates with placeholders, document purpose, inputs and sample outputs, store them centrally (Projects/Custom GPTs/wiki/code), assign owners and version them after changes.", level: "Hard" },
    { q: "How does prompt chaining relate to AI agents?", a: "Chains are fixed sequences defined by a human. Agents decide their own next steps and tool calls dynamically. Chains are more predictable; agents are more flexible. Many production systems use chains where possible and agents where needed.", level: "Hard" },
    { q: "Why use a separate reviewer prompt instead of asking the same prompt to self-review?", a: "A separate reviewer with its own instructions and checklist gives a more independent critique and is less anchored to the original reasoning, catching more errors.", level: "Hard" }
  ],
  practice: [
    { task: "Use the persona pattern to practise a spoken-English HR interview: 'Tell me about yourself'.", hint: "Ask it to act as an HR interviewer, one question at a time, with feedback on clarity and confidence.", solution: "Act as an HR interviewer at an IT services company. Ask me 'Tell me about yourself' and 4 follow-up HR questions, one at a time. After each answer: score /10, 2 strengths, 2 improvements, a better sample answer in max 80 words." },
    { task: "Create a reusable template for writing product descriptions with 5 placeholders and test it on 2 products.", hint: "{product}, {features}, {audience}, {tone}, {word_limit}.", solution: "Write a product description for {product} with features {features} for {audience}. Tone: {tone}. Max {word_limit} words. Format: headline + 3 bullets + closing line. Do not invent features." },
    { task: "Apply critique-and-refine to your resume summary with 5 criteria.", hint: "Criteria: role-specific, quantified achievements, under 60 words, keywords, no clichés.", solution: "Paste summary in <summary>, list the 5 criteria, ask for a score table and a rewrite scoring 9+. Verify every number in the rewrite is true." },
    { task: "Design a 3-step chain for writing a blog post: research questions -> outline -> draft. Run it manually.", hint: "Each step output goes into tags in the next prompt.", solution: "Step 1: 'List 6 questions a beginner has about {topic}' -> <questions>. Step 2: 'Create an H2/H3 outline answering <questions>' -> <outline>. Step 3: 'Write a 600-word post following <outline>, simple English.'" },
    { task: "After a long chat, ask the AI to write the single consolidated prompt that would produce the final result. Save it in AI Prompt Lab.", hint: "Prompt: 'Write one prompt that would produce this final version on the first try.'", solution: "The AI returns a full prompt combining all your refinements (role, tone, length, structure). Save it in the template library for reuse." }
  ],
  quiz: [
    { question: "'Act as a strict CA and review my GST invoice' is an example of which pattern?", options: ["Prompt chaining", "Template", "Persona", "Zero-shot only"], answer: 2, explanation: "Assigning a role/identity is the persona pattern." },
    { question: "What makes critique-and-refine most effective?", options: ["Saying 'make it better' many times", "Providing clear criteria or a rubric", "Using the longest possible draft", "Removing all context"], answer: 1, explanation: "Criteria make the critique specific and measurable." },
    { question: "In prompt chaining:", options: ["The output of one step becomes the input of the next", "All steps run in one giant prompt", "Only images are used", "The model weights are retrained"], answer: 0, explanation: "Chaining passes outputs between focused steps." },
    { question: "Which is a benefit of prompt chaining?", options: ["It always uses fewer tokens", "It removes the need for any review", "It works only with JSON", "Easier debugging because you can see which step failed"], answer: 3, explanation: "Separate steps make failures visible and fixable." },
    { question: "A template prompt mainly helps with:", options: ["Random creativity", "Consistent, reusable results across people and tasks", "Making the model forget context", "Avoiding all errors"], answer: 1, explanation: "Templates standardise prompts so outputs are consistent." }
  ]
};
