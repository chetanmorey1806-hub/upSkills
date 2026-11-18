export default {
  id: "day-13-prompt-engineering-basics",
  title: "Prompt Engineering Basics: Anatomy of a Good Prompt (Role, Context, Task, Format, Constraints)",
  module: "Module 3: Prompt Engineering",
  day: 13,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn what a prompt is, why the same AI gives weak or excellent answers depending on how you ask, and how to build every prompt from five parts: Role, Context, Task, Format and Constraints.",
  objectives: [
    "Explain what prompt engineering is and why it matters at work",
    "Identify the five building blocks of a good prompt: role, context, task, format, constraints",
    "Rewrite a vague prompt into a clear, specific prompt",
    "Understand the difference between a system prompt and a user prompt",
    "Use the AI Prompt Lab prompt builder and quality checker to improve prompts"
  ],
  theory: [
    {
      heading: "What is a prompt and what is prompt engineering?",
      content: "A prompt is the instruction (text, and sometimes files or images) that you give to an AI model such as Claude, ChatGPT or Gemini. Prompt engineering is the skill of writing prompts so that the model gives a useful, correct and well-formatted answer on the first or second try. Think of the AI as a very smart new intern who joined today: they know a lot of general knowledge, but they know nothing about YOUR company, YOUR customer, or what YOU want the final document to look like. If you say 'write a report', the intern guesses. If you say who the report is for, what data to use, how long it should be and what format to use, the intern delivers exactly what you need.",
      points: [
        "The model only knows what is in its training data plus what you put in the prompt",
        "A vague prompt gives a generic answer; a specific prompt gives a specific answer",
        "Prompt engineering is used daily by analysts, developers, marketers, HR, support teams and students",
        "Good prompting saves time: fewer back-and-forth messages and less editing"
      ],
      tip: "Rule of thumb: if a human colleague would need to ask you follow-up questions before doing the task, your prompt is missing information."
    },
    {
      heading: "The 5 building blocks: Role, Context, Task, Format, Constraints",
      content: "Almost every strong prompt contains these five parts. You do not always need all five, but checking each one is a quick way to improve any prompt.",
      points: [
        "ROLE - who the AI should act as. Example: 'You are a senior HR recruiter in an IT company.' A role sets vocabulary, tone and level of expertise.",
        "CONTEXT - background the AI needs. Example: 'Our company is hiring 5 freshers for a .NET developer role in Pune. Candidates are final-year B.Tech students.'",
        "TASK - the exact thing to do, starting with an action verb. Example: 'Write 10 technical interview questions with model answers.'",
        "FORMAT - how the output should look. Example: 'Return a table with columns: No, Question, Ideal Answer, Difficulty.'",
        "CONSTRAINTS - limits and rules. Example: 'Max 40 words per answer, no questions about personal life, simple English.'"
      ],
      syntax: `[ROLE]        You are a ...
[CONTEXT]     Background: ... Audience: ... Goal: ...
[TASK]        Write / Summarise / Compare / Extract / Fix ...
[FORMAT]      Return as: table / bullet list / JSON / email ...
[CONSTRAINTS] Length, tone, language, what to avoid, what to do if unsure`,
      tip: "Easy memory trick: R-C-T-F-C, 'Really Clear Tasks Feel Calm'."
    },
    {
      heading: "System prompt vs user prompt",
      content: "Chat apps and APIs separate two kinds of instructions. The SYSTEM prompt is set once and describes long-lasting behaviour: role, tone, rules, what to refuse. The USER prompt is the specific request for this turn. Analogy: the system prompt is the job description given to an employee on day one; the user prompt is today's task from the manager. In claude.ai you get a similar effect with 'Projects' (project instructions), in ChatGPT with 'Custom GPTs' or 'Custom instructions', and in Gemini with 'Gems'. In the Claude API you pass it as the `system` parameter.",
      syntax: `client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 1024,
  system: "You are a friendly Excel trainer for beginners. Use simple English.",
  messages: [{ role: "user", content: "Explain VLOOKUP with one example." }]
})`,
      points: [
        "Put stable rules (role, tone, safety rules) in the system prompt",
        "Put the changing request and the data in the user prompt",
        "If you only have one box (normal chat), simply write the role at the top of your message"
      ]
    },
    {
      heading: "Be specific: vague words vs measurable words",
      content: "Words like 'good', 'short', 'professional' and 'detailed' mean different things to different people. Replace them with measurable instructions. 'Short' becomes 'under 120 words'. 'Professional' becomes 'polite, formal, no slang, no emojis'. 'Detailed' becomes 'include 3 examples and 1 common mistake'. Also give the reason behind a rule: 'Keep it under 120 words because it will be read on a phone' helps the model make better choices than a bare rule.",
      points: [
        "Give numbers: word counts, number of bullets, number of options",
        "Name the audience: 'for a 10th-class student' vs 'for a CFO'",
        "Explain WHY: models follow rules better when they understand the purpose",
        "Say what TO do rather than only what NOT to do"
      ]
    },
    {
      heading: "Separating instructions from data (delimiters)",
      content: "When you paste an email, a CSV or an article into a prompt, mark clearly where the data starts and ends. Use XML-style tags like <email>...</email>, triple quotes, or headings. This prevents the model from confusing your data with your instructions, and it is also the first defence against prompt injection (Day 19).",
      syntax: `Summarise the customer complaint below in 3 bullets.

<complaint>
I ordered a laptop on 2 March and it still hasn't arrived...
</complaint>`,
      tip: "Claude models are trained to pay close attention to XML tags, so tags like <document>, <data>, <instructions> work very well."
    },
    {
      heading: "The prompt improvement loop",
      content: "Prompting is iterative. Write a first version, run it, read the output critically, then fix the prompt rather than only fixing the output by hand. Ask: Was something missing (context)? Was the shape wrong (format)? Was it too long or off-tone (constraints)? Save prompts that work well as templates so the whole team can reuse them. The in-app AI Prompt Lab (/tools/ai-lab) has a prompt builder with fields for role, context, task, format, constraints and examples, plus a quality checker that warns you when a block is missing.",
      points: [
        "Draft -> Run -> Review -> Refine -> Save as template",
        "Change one thing at a time so you know what improved the result",
        "Keep a personal 'prompt library' in a notes app or the Prompt Lab template library"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Leave application email",
      scenario: "Priya, a junior data analyst, needs to email her manager for 2 days of leave for her sister's wedding. Her first prompt gives a stiff, generic email that she has to rewrite.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and start a new chat",
        "First paste the BAD prompt and look at the result: generic, missing dates and handover details",
        "Start a new chat and paste the GOOD prompt below",
        "Compare both outputs side by side",
        "Optional: open AI Prompt Lab (/tools/ai-lab), paste the GOOD prompt and click 'Check quality' to see all 5 blocks detected"
      ],
      code: `BAD PROMPT:
write leave email

GOOD PROMPT:
[ROLE] You are a polite corporate communication assistant.
[CONTEXT] I am Priya, a junior data analyst. My manager is Mr. Rahul Mehta.
My sister's wedding is on 14-15 March. My weekly sales dashboard is due on 15 March;
my teammate Ankit has agreed to refresh and publish it.
[TASK] Write a leave request email for 14-15 March.
[FORMAT] Subject line + email body with greeting, 2 short paragraphs, sign-off.
[CONSTRAINTS] Under 120 words, formal but warm, no emojis, mention the handover.`,
      prompt: {
        system: "You are a polite corporate communication assistant. You write short, clear, professional emails in simple Indian business English.",
        user: "I am Priya, a junior data analyst. My manager is Mr. Rahul Mehta. My sister's wedding is on 14-15 March. My weekly sales dashboard is due on 15 March; my teammate Ankit has agreed to refresh and publish it.\n\nTask: Write a leave request email for 14-15 March.\nFormat: Subject line + email body with greeting, 2 short paragraphs, sign-off.\nConstraints: Under 120 words, formal but warm, no emojis, mention the handover."
      },
      result: `Subject: Leave Request for 14-15 March

Dear Rahul Sir,

I would like to request leave on 14 and 15 March as I will be attending my sister's wedding.

I have arranged a handover for the weekly sales dashboard due on 15 March. Ankit has kindly agreed to refresh and publish it, and I will share the data source details and steps with him before I leave. I will also be reachable on phone for anything urgent.

Kindly approve my leave request.

Thanks and regards,
Priya
Junior Data Analyst`,
      explanation: "The BAD prompt has only a task, so the AI invents names, dates and reasons (or leaves [placeholders]). The GOOD prompt supplies all five blocks: the role sets tone, the context gives real facts (names, dates, handover), the format fixes the structure and the constraints control length and style. The result can be sent with almost no editing."
    },
    {
      title: "Turning a vague request into a clear analysis prompt",
      scenario: "A store manager pastes monthly sales numbers and asks 'analyse this'. The AI returns a long, generic essay. We rebuild the prompt with role, context, task, format and constraints.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the GOOD prompt below including the data inside the <sales> tags",
        "Press Enter and read the output",
        "Check: is it a table + exactly 3 insights + 1 action? If not, refine the FORMAT line and run again"
      ],
      code: `BAD PROMPT:
analyse this
Jan 4.2L, Feb 3.9L, Mar 5.1L, Apr 4.0L, May 6.3L, Jun 6.0L

GOOD PROMPT:
You are a retail business analyst explaining results to a non-technical store manager.

Context: These are monthly sales (in lakh rupees) for our Nagpur electronics store.
March had a Holi sale; May-June is summer AC season.

<sales>
Jan 4.2, Feb 3.9, Mar 5.1, Apr 4.0, May 6.3, Jun 6.0
</sales>

Task: Analyse the trend.
Format:
1. A table with Month, Sales, Change vs previous month (%)
2. Exactly 3 key insights as bullets
3. One recommended action for July
Constraints: Simple English, under 150 words outside the table. Only use the numbers given.`,
      prompt: {
        system: "You are a retail business analyst explaining results to a non-technical store manager. Only use numbers that are provided. Show calculations rounded to 1 decimal place.",
        user: "Context: These are monthly sales (in lakh rupees) for our Nagpur electronics store. March had a Holi sale; May-June is summer AC season.\n\n<sales>\nJan 4.2, Feb 3.9, Mar 5.1, Apr 4.0, May 6.3, Jun 6.0\n</sales>\n\nTask: Analyse the trend.\nFormat:\n1. A table with Month, Sales, Change vs previous month (%)\n2. Exactly 3 key insights as bullets\n3. One recommended action for July\nConstraints: Simple English, under 150 words outside the table. Only use the numbers given."
      },
      result: `| Month | Sales (L) | Change vs prev. |
|-------|-----------|-----------------|
| Jan   | 4.2       | -               |
| Feb   | 3.9       | -7.1%           |
| Mar   | 5.1       | +30.8%          |
| Apr   | 4.0       | -21.6%          |
| May   | 6.3       | +57.5%          |
| Jun   | 6.0       | -4.8%           |

Key insights
- Summer (May-Jun) is the strongest period, with sales about 50% above Jan-Feb levels.
- The Holi sale lifted March by about 31%, but sales fell back in April, so the boost was short-term.
- Jun dipped only slightly from May, so AC demand stayed strong.

Recommended action for July
- Monsoon may slow AC sales; plan a "monsoon offer" on fans, dehumidifiers and laptops to keep sales above 5 lakh.`,
      explanation: "Adding the context (store type, Holi sale, summer season) lets the AI explain WHY numbers changed, not just repeat them. The fixed format (table + exactly 3 insights + 1 action) makes the answer scannable for a busy manager, and 'Only use the numbers given' reduces hallucinated figures. Always verify the % calculations yourself: (5.1-3.9)/3.9 = 30.8%."
    },
    {
      title: "Using a role and audience to change the explanation level",
      scenario: "A trainer wants the same concept (Power BI DAX CALCULATE) explained for two different audiences. Only the role and audience lines change.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run Version A (school student audience) and save the answer",
        "Open a new chat and run Version B (experienced Excel analyst audience)",
        "Compare vocabulary, length and examples between the two answers"
      ],
      code: `VERSION A
You are a patient teacher. Explain DAX CALCULATE to a 12th-class commerce student
who has never used Power BI. Use a school canteen example. Max 100 words. No code.

VERSION B
You are a Power BI consultant. Explain DAX CALCULATE to an analyst who knows Excel
SUMIFS well. Compare it with SUMIFS, show one DAX measure, and mention filter context.
Max 120 words.`,
      prompt: {
        system: "You are a Power BI consultant who trains experienced Excel users. Be precise and concise.",
        user: "Explain DAX CALCULATE to an analyst who knows Excel SUMIFS well. Compare it with SUMIFS, show one DAX measure, and mention filter context. Max 120 words."
      },
      result: `CALCULATE is like SUMIFS for your whole data model. SUMIFS adds a range only for rows matching conditions; CALCULATE evaluates any measure after changing the filter context (the filters coming from slicers, rows and columns of a visual).

Example:
North Sales = CALCULATE( SUM(Sales[Amount]), Sales[Region] = "North" )

In a matrix by Month, each cell already has a Month filter; CALCULATE adds Region = "North" on top of it. Unlike SUMIFS, it can also remove filters, e.g. CALCULATE([Total Sales], ALL(Sales[Region])) for a grand total used in % share calculations.`,
      explanation: "Role + audience is the fastest lever for controlling difficulty. Version A produces a no-code analogy (canteen sales on Fridays only), Version B produces technical language and a working measure. Same task, different prompts, completely different usefulness for each audience."
    },
    {
      title: "Calling Claude from Python with system + user prompts",
      scenario: "A developer wants to reuse the 5-block prompt inside a small script. The prompt is built from variables so it can be reused for any product.",
      steps: [
        "Install the SDK on your own computer: pip install anthropic",
        "Set your key in the terminal: export ANTHROPIC_API_KEY=your_key (Windows: set ANTHROPIC_API_KEY=your_key)",
        "Save the code below as product_desc.py and run: python product_desc.py",
        "Or, without coding, paste the system and user text into AI Prompt Lab and click 'Run with Claude'"
      ],
      code: `import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

product = {"name": "Boat Airdopes 141", "price": "Rs 1,299",
           "features": "42h playback, ENx noise cancellation, IPX4"}

system = ("You are an e-commerce copywriter for an Indian electronics website. "
          "Write honest copy; never invent features that are not given.")

user = f"""Context: Product data below. Audience: college students on a budget.
<product>
Name: {product['name']}
Price: {product['price']}
Features: {product['features']}
</product>
Task: Write a product description.
Format: 1 headline (max 8 words) + 3 bullet points + 1 closing line.
Constraints: Under 70 words, friendly tone, no emojis."""

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=400,
    system=system,
    messages=[{"role": "user", "content": user}],
)

if response.stop_reason == "refusal":
    print("Model refused the request.")
else:
    print(response.content[0].text)`,
      prompt: {
        system: "You are an e-commerce copywriter for an Indian electronics website. Write honest copy; never invent features that are not given.",
        user: "Context: Product data below. Audience: college students on a budget.\n<product>\nName: Boat Airdopes 141\nPrice: Rs 1,299\nFeatures: 42h playback, ENx noise cancellation, IPX4\n</product>\nTask: Write a product description.\nFormat: 1 headline (max 8 words) + 3 bullet points + 1 closing line.\nConstraints: Under 70 words, friendly tone, no emojis."
      },
      result: `Big Sound, Bigger Battery, Student-Friendly Price

- 42 hours of total playback - lectures, gym and late-night music covered
- ENx noise cancellation for clearer calls, even in a noisy canteen
- IPX4 water resistance, so sweat and light rain are no problem

All this for just Rs 1,299 - the smart pick for your budget.`,
      explanation: "The same 5-block structure works in code: the system parameter holds the role and honesty rule, the user message holds context, delimited data, task, format and constraints. The code reads the key from the environment (never hard-coded) and checks stop_reason before printing. Note there is no temperature parameter; current Claude models do not accept it."
    }
  ],
  tools: [
    { name: "Claude (claude.ai)", use: "Chat assistant to practise prompts; Projects let you save a system prompt (project instructions) for repeated tasks", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Practise the same prompts and compare outputs; Custom instructions act like a personal system prompt", url: "https://chatgpt.com" },
    { name: "Google Gemini", use: "Compare outputs; Gems store reusable instructions", url: "https://gemini.google.com" },
    { name: "AI Prompt Lab (in-app)", use: "Build prompts block-by-block (role, context, task, format, constraints, examples), check prompt quality and run with your own API key", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What is prompt engineering?", a: "Prompt engineering is the practice of designing and refining the instructions given to an AI model so it produces accurate, relevant and well-formatted output. It covers choosing a role, giving context, stating the task clearly, specifying the output format and adding constraints, then iterating based on results.", level: "Easy" },
    { q: "Name the main components of a good prompt.", a: "Role (who the AI acts as), Context (background and audience), Task (the exact action), Format (shape of the output such as table, JSON, email) and Constraints (length, tone, language, what to avoid, what to do if unsure). Examples are an optional sixth component.", level: "Easy" },
    { q: "What is the difference between a system prompt and a user prompt?", a: "The system prompt sets persistent behaviour for the whole conversation: role, tone, rules, safety boundaries. The user prompt is the specific request in a turn. In the Claude API the system prompt is the 'system' parameter; user prompts are messages with role 'user'.", level: "Easy" },
    { q: "Why does adding context improve an AI answer?", a: "The model only knows its general training data and what is in the prompt. Context such as the audience, the business situation, data and goals lets it tailor the answer instead of guessing, which reduces generic output and hallucinated details.", level: "Easy" },
    { q: "Why should you use delimiters like XML tags around pasted data?", a: "Delimiters clearly separate instructions from data, so the model does not mistake text inside a document for instructions. This improves accuracy and is a basic defence against prompt injection hidden in pasted content.", level: "Medium" },
    { q: "How do you make vague instructions measurable? Give examples.", a: "Replace subjective words with numbers and specifics: 'short' -> 'under 100 words', 'simple' -> 'for a 10th-class student, no jargon', 'detailed' -> 'include 3 examples and 1 common mistake', 'professional' -> 'formal, no slang, no emojis'.", level: "Medium" },
    { q: "Why is it useful to explain the reason behind a constraint?", a: "When the model knows why a rule exists (for example 'keep it under 50 words because it is an SMS'), it can generalise and make better decisions in edge cases instead of following the rule mechanically.", level: "Medium" },
    { q: "Your prompt returns a long essay when you wanted a table. What do you change?", a: "Fix the Format block: explicitly ask for a table with named columns, say 'no text before or after the table' if needed, and optionally show a one-row example of the table. Then re-run and compare.", level: "Medium" },
    { q: "How would you standardise prompts across a team?", a: "Create tested prompt templates with placeholders for variable parts, store them in a shared library (Projects, Custom GPTs, Gems or a wiki), document the intended use and expected output, and version them when they are changed.", level: "Hard" },
    { q: "Does prompt engineering still matter as models get smarter?", a: "Yes. Smarter models need less trickery, but they still cannot know your context, audience, data or required format unless you provide it. The focus shifts from 'magic words' to clear communication and good context.", level: "Hard" }
  ],
  practice: [
    { task: "Rewrite the vague prompt 'make a diet plan' using all 5 blocks for a 22-year-old vegetarian student in a hostel.", hint: "Role: nutrition coach. Context: age, veg, hostel mess food, budget. Format: table by meal. Constraints: no supplements, simple foods.", solution: "You are a certified nutrition coach. Context: I am a 22-year-old vegetarian engineering student living in a hostel; I eat mess food (dal, rice, roti, sabzi) and can spend Rs 100/day extra on snacks. Goal: gain energy for studies. Task: Create a 1-day meal plan. Format: table with Meal, Food, Approx protein (g). Constraints: only easily available Indian foods, no supplements, under 150 words of notes." },
    { task: "Write a system prompt for a chatbot that answers questions about your college library timings and rules.", hint: "Include role, tone, the facts it can use and what to do if it does not know.", solution: "You are the friendly help assistant of ABC College Library. Answer only questions about library timings, membership, borrowing and fines using the information below. Timings: Mon-Sat 9 AM-8 PM. Max 3 books for 14 days. Fine: Rs 2/day. If a question is outside this information, say 'Please contact the librarian at the front desk.' Keep answers under 60 words." },
    { task: "In AI Prompt Lab (/tools/ai-lab), build a prompt for summarising a meeting transcript and run the quality checker. Fix every warning.", hint: "The checker flags missing role, format or constraints.", solution: "Example: Role: executive assistant. Context: weekly project sync of a Power BI team. Task: summarise the transcript in <transcript> tags. Format: Decisions, Action items (owner, due date), Open questions. Constraints: max 150 words, do not invent owners or dates; write 'not stated' if missing." },
    { task: "Take one prompt you used this week. Run it once as-is and once improved with the 5 blocks. Note 3 differences in the outputs.", hint: "Look at accuracy, format, length and how much editing you needed.", solution: "Typical findings: the improved prompt used real names/dates instead of placeholders, followed the requested structure, and needed little or no editing; the original was longer and more generic." },
    { task: "Write a prompt that asks for a LinkedIn post announcing your Power BI certification, with clear format and constraints.", hint: "Specify audience (recruiters), length, hashtags count, tone.", solution: "You are a LinkedIn personal branding coach. Context: I just completed the Microsoft PL-300 Power BI certification after 2 months of practice building sales dashboards. Task: write a LinkedIn post. Format: hook line, 3 short lines about what I learned, thank-you line, 3 hashtags. Constraints: under 90 words, confident not boastful, max 1 emoji." }
  ],
  quiz: [
    { question: "Which prompt block tells the AI WHO it should act as?", options: ["Format", "Role", "Constraints", "Context"], answer: 1, explanation: "The Role block (for example 'You are a senior HR recruiter') sets expertise, vocabulary and tone." },
    { question: "'Return the answer as a table with columns Name, Score, Grade' belongs to which block?", options: ["Task", "Context", "Role", "Format"], answer: 3, explanation: "It describes the shape of the output, so it is the Format block." },
    { question: "Where should long-lasting rules like tone and safety boundaries usually go?", options: ["In the system prompt", "At the end of every user message", "In the file name", "Nowhere; models already know them"], answer: 0, explanation: "The system prompt holds persistent behaviour for the whole conversation." },
    { question: "Why wrap pasted data inside tags like <email>...</email>?", options: ["It makes the answer longer", "It is required by law", "It separates data from instructions and reduces confusion and injection risk", "It reduces the cost to zero"], answer: 2, explanation: "Delimiters show the model exactly what is data and what is instruction." },
    { question: "Which is the most measurable constraint?", options: ["Make it short", "Make it nice", "Under 100 words, 3 bullets, no jargon", "Make it professional"], answer: 2, explanation: "Numbers and specific rules remove guesswork; 'short', 'nice', 'professional' are subjective." }
  ]
};
