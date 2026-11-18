export default {
  id: "day-15-step-by-step-reasoning-self-check",
  title: "Step-by-step Reasoning, Breaking Down Problems and Self-Check Prompts",
  module: "Module 3: Prompt Engineering",
  day: 15,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn how asking the AI to think step by step, splitting big problems into smaller ones, and asking it to check its own work produce more accurate answers for maths, logic, analysis and decisions.",
  objectives: [
    "Explain why step-by-step (chain-of-thought) prompting improves accuracy",
    "Break a large task into smaller sub-tasks the AI can handle reliably",
    "Write self-check and verification prompts that catch mistakes",
    "Understand extended/adaptive thinking and effort settings in modern models",
    "Know when reasoning prompts are unnecessary"
  ],
  theory: [
    {
      heading: "Why 'think step by step' works",
      content: "An LLM produces text one token at a time (Day 8). If you ask for only the final answer, the model must 'jump' to it in one go. If you ask it to show the steps, every step it writes becomes context for the next one, so it can work through calculations and logic gradually - just like a student who writes rough work in the margin makes fewer mistakes than one who does mental maths. This technique is called chain-of-thought (CoT) prompting.",
      syntax: `Solve this step by step. Show your working, then give the final answer
on a separate line starting with "Answer:".`,
      points: [
        "Helps with: arithmetic, percentages, multi-condition logic, scheduling, comparisons, debugging",
        "Makes errors visible: you can see which step went wrong",
        "Separating the final answer ('Answer:' line or <answer> tags) makes it easy to read or parse"
      ]
    },
    {
      heading: "Built-in thinking: adaptive thinking and effort",
      content: "Modern models such as Claude Opus 5.5 and Sonnet 5.5 can 'think' internally before answering. In claude.ai this appears as extended thinking you can expand; in the API you enable it with thinking: {type: 'adaptive'} and control how hard the model works with output_config: {effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'}. With built-in thinking you often don't need to write 'think step by step' yourself, but asking for structured working is still useful when YOU want to see and check the steps.",
      syntax: `client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4000,
  thinking: { type: "adaptive" },
  output_config: { effort: "high" },
  messages: [{ role: "user", content: "Which plan is cheaper over 3 years? ..." }]
})`,
      tip: "Use higher effort for hard reasoning (financial comparisons, complex bugs) and low effort for simple tasks like rewriting a sentence - it is faster and cheaper."
    },
    {
      heading: "Decomposition: break big problems into small steps",
      content: "Large vague tasks ('Plan our product launch') produce shallow answers. Break them into sub-tasks: first list the goals, then the audience, then the channels, then a timeline, then the budget. You can do this inside one prompt (numbered steps) or across several prompts (prompt chaining, Day 17). Analogy: you don't build a house in one instruction; you plan foundation, walls, roof and wiring separately.",
      points: [
        "Ask the AI to first list the sub-problems before solving them ('plan first, then execute')",
        "Solve each sub-problem separately and feed results into the next",
        "Least-to-most: solve the easiest sub-question first, then use it to solve harder ones"
      ]
    },
    {
      heading: "Self-check and verification prompts",
      content: "Models can catch many of their own mistakes if you explicitly ask them to review. Add a verification step: 'Before finalising, re-check each calculation and confirm the answer satisfies all the conditions.' Even better, ask for a different method to verify (e.g. reverse-calculate, or check against the original data). For important work, run a separate 'reviewer' prompt that receives the draft and a checklist.",
      syntax: `After solving, verify:
1. Recalculate every number.
2. Check each condition in the question is satisfied.
3. If you find an error, correct it and state what changed.`,
      points: [
        "Ask for assumptions to be listed explicitly",
        "Ask 'what could be wrong with this answer?'",
        "Ask for a confidence level and what information would increase it",
        "Self-check reduces but does NOT eliminate errors - humans still verify critical outputs"
      ]
    },
    {
      heading: "Giving the model permission to say 'I don't know'",
      content: "Models sometimes invent an answer instead of admitting missing data (hallucination, Day 6/8). Tell them explicitly what to do when information is missing: 'If the data needed is not provided, say what is missing instead of guessing.' This simple line greatly improves trustworthiness in business reports.",
      tip: "Combine with: 'Quote the exact lines from the data that support each conclusion.'"
    },
    {
      heading: "When NOT to use step-by-step",
      content: "Reasoning costs more tokens and time. For simple tasks - translating a sentence, fixing grammar, writing a short caption - step-by-step adds no value. Also, if you need only the final result in an app, ask the model to put reasoning in <thinking> tags and the answer in <answer> tags, and show only the answer to users.",
      points: [
        "Use for: maths, logic, multi-step analysis, decisions with trade-offs, debugging",
        "Skip for: simple rewriting, formatting, short creative tasks",
        "In apps, separate reasoning from the user-facing answer"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Discount and GST calculation",
      scenario: "A shop owner asks the AI for the final bill amount of a multi-step discount problem. A direct-answer prompt can produce a wrong number; the step-by-step prompt with self-check gets it right and shows working he can verify.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run the BAD prompt and note the answer",
        "Run the GOOD prompt below in a new chat",
        "Check each step of the working with a calculator",
        "Optional: run it in AI Prompt Lab and compare effort 'low' vs 'high'"
      ],
      code: `BAD PROMPT:
Laptop MRP 60000, 10% discount, then extra 5% coupon on discounted price, then 18% GST. Final price? Just the number.

GOOD PROMPT:
Calculate the final price step by step.
- MRP: Rs 60,000
- Store discount: 10% on MRP
- Coupon: extra 5% on the price after store discount
- GST: 18% on the price after both discounts
Show each step with the formula. Then verify by computing the final price with
a single multiplication (60000 x 0.90 x 0.95 x 1.18) and confirm both match.
End with: "Final price: Rs ____"`,
      prompt: {
        system: "You are a careful accountant. Show every calculation step and verify the result using a second method before giving the final answer.",
        user: "Calculate the final price step by step.\n- MRP: Rs 60,000\n- Store discount: 10% on MRP\n- Coupon: extra 5% on the price after store discount\n- GST: 18% on the price after both discounts\nShow each step with the formula. Then verify by computing the final price with a single multiplication (60000 x 0.90 x 0.95 x 1.18) and confirm both match.\nEnd with: \"Final price: Rs ____\""
      },
      result: `Step 1 - Store discount
60,000 x 10% = 6,000 -> 60,000 - 6,000 = 54,000

Step 2 - Coupon (5% of 54,000)
54,000 x 5% = 2,700 -> 54,000 - 2,700 = 51,300

Step 3 - GST (18% of 51,300)
51,300 x 18% = 9,234 -> 51,300 + 9,234 = 60,534

Verification
60,000 x 0.90 = 54,000; x 0.95 = 51,300; x 1.18 = 60,534. Both methods match.

Final price: Rs 60,534`,
      explanation: "A common mistake (by humans and AI) is adding the discounts (10% + 5% = 15%) giving 51,000 before GST. The step-by-step prompt forces the correct sequence and the verification step uses a second method. Note that after a 15.5% effective discount and 18% GST, the final price is slightly ABOVE the MRP - a useful insight the owner can see only because the working is shown."
    },
    {
      title: "Decomposing a big task: planning a college tech fest budget",
      scenario: "A student coordinator asks 'plan our tech fest budget' and gets a generic list. Breaking the problem into sub-steps produces a realistic, checkable plan.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the decomposed prompt below",
        "Read the output step by step; check the totals add up to the budget",
        "Ask a follow-up: 'Reduce the total by 10% without cutting prizes.'"
      ],
      code: `You are an experienced college event coordinator.

Context: 1-day tech fest, 400 expected students, total budget Rs 1,50,000,
college provides the auditorium and 2 labs for free.

Work through these steps in order:
Step 1: List the main cost categories for this event.
Step 2: Allocate the budget to each category with a one-line reason.
Step 3: Check the total equals exactly Rs 1,50,000; fix it if not.
Step 4: List 3 risks that could exceed the budget and a mitigation for each.

Format: Step 2 as a table (Category, Amount, Reason). Others as short bullets.
If you assume anything, list it under "Assumptions".`,
      prompt: {
        system: "You are an experienced college event coordinator who plans realistic budgets for Indian engineering colleges.",
        user: "Context: 1-day tech fest, 400 expected students, total budget Rs 1,50,000, college provides the auditorium and 2 labs for free.\n\nWork through these steps in order:\nStep 1: List the main cost categories for this event.\nStep 2: Allocate the budget to each category with a one-line reason.\nStep 3: Check the total equals exactly Rs 1,50,000; fix it if not.\nStep 4: List 3 risks that could exceed the budget and a mitigation for each.\n\nFormat: Step 2 as a table (Category, Amount, Reason). Others as short bullets.\nIf you assume anything, list it under \"Assumptions\"."
      },
      result: `Step 1 - Cost categories
- Prizes, Food & refreshments, Decoration & stage, Printing & publicity, Guest speaker, Certificates & kits, Contingency

Step 2 - Allocation
| Category              | Amount (Rs) | Reason                                        |
|-----------------------|-------------|-----------------------------------------------|
| Prizes                | 40,000      | Main attraction for 5 competitions            |
| Food & refreshments   | 40,000      | Lunch + snacks for ~400 at about Rs 100 each  |
| Guest speaker         | 15,000      | Travel and honorarium for one industry expert |
| Decoration & stage    | 15,000      | Banners, stage backdrop, sound support        |
| Printing & publicity  | 10,000      | Posters, standees, social media boosts        |
| Certificates & kits   | 15,000      | Participant certificates, ID cards, lanyards  |
| Contingency           | 15,000      | 10% buffer for last-minute costs              |

Step 3 - Check
40,000 + 40,000 + 15,000 + 15,000 + 10,000 + 15,000 + 15,000 = 1,50,000. Total matches.

Step 4 - Risks
- More attendees than expected -> use pre-registration and food coupons
- Speaker travel cost rises -> fix honorarium in writing; prefer a local speaker
- Equipment damage in labs -> assign volunteers per lab, use contingency

Assumptions
- Sound system partly provided by the college; 5 competitions planned.`,
      explanation: "Numbered steps force the model to plan (categories), act (allocate), verify (Step 3) and think ahead (risks). The 'Assumptions' section exposes guesses you can correct. Always re-add the table yourself - here it totals 1,50,000."
    },
    {
      title: "Self-check prompt: reviewing an Excel formula",
      scenario: "A junior analyst wrote a formula to give a bonus. He asks the AI to check it against the business rule, reasoning step by step and testing sample values.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt with the formula and rule",
        "Read the test-case table and the verdict",
        "Copy the corrected formula into Excel and test with the same sample values"
      ],
      code: `Rule: Bonus = 10% of salary if Rating >= 4 AND Tenure >= 2 years;
5% if Rating >= 4 but Tenure < 2; otherwise 0.
Salary is in B2, Rating in C2, Tenure in D2.

My formula: =IF(C2>=4,IF(D2>2,B2*10%,B2*5%),0)

Task: Check if my formula matches the rule.
1. Explain what the formula does step by step.
2. Test it on these cases: (Rating 4, Tenure 2), (Rating 5, Tenure 1), (Rating 3, Tenure 5).
3. Compare with the rule for each case in a table.
4. If there is a bug, give the corrected formula and re-test.`,
      prompt: {
        system: "You are an Excel expert who reviews formulas carefully. Always test formulas on the given cases before concluding.",
        user: "Rule: Bonus = 10% of salary if Rating >= 4 AND Tenure >= 2 years; 5% if Rating >= 4 but Tenure < 2; otherwise 0.\nSalary is in B2, Rating in C2, Tenure in D2.\n\nMy formula: =IF(C2>=4,IF(D2>2,B2*10%,B2*5%),0)\n\nTask: Check if my formula matches the rule.\n1. Explain what the formula does step by step.\n2. Test it on these cases: (Rating 4, Tenure 2), (Rating 5, Tenure 1), (Rating 3, Tenure 5).\n3. Compare with the rule for each case in a table.\n4. If there is a bug, give the corrected formula and re-test."
      },
      result: `1. What the formula does
- If Rating >= 4 -> checks Tenure: if Tenure > 2 gives 10%, else 5%
- If Rating < 4 -> 0

2-3. Test cases
| Rating | Tenure | Formula gives | Rule says | Match? |
|--------|--------|---------------|-----------|--------|
| 4      | 2      | 5%            | 10%       | No     |
| 5      | 1      | 5%            | 5%        | Yes    |
| 3      | 5      | 0             | 0         | Yes    |

4. Bug: D2>2 excludes exactly 2 years. The rule says ">= 2".
Corrected formula: =IF(C2>=4,IF(D2>=2,B2*10%,B2*5%),0)
Re-test (4, 2): Rating >= 4 and Tenure >= 2 -> 10%. All 3 cases now match.`,
      explanation: "The boundary case (Tenure exactly 2) is where most formula bugs hide. Asking the AI to test specific cases instead of just 'check my formula' turns a vague review into a verifiable test table. Include boundary values in your own test cases every time."
    },
    {
      title: "Reasoning with thinking + separate answer in an app (Python)",
      scenario: "A developer builds a loan eligibility helper. The model should reason internally and return a short answer for the user. The code uses adaptive thinking and effort instead of temperature.",
      steps: [
        "pip install anthropic on your computer",
        "Set ANTHROPIC_API_KEY as an environment variable",
        "Save as eligibility.py and run python eligibility.py",
        "Change effort to 'low' and compare speed and answer quality"
      ],
      code: `import anthropic

client = anthropic.Anthropic()

question = """Applicant: monthly salary Rs 45,000, existing EMI Rs 12,000.
Bank rule: total EMIs must not exceed 50% of salary.
New loan EMI would be Rs 9,500. Is the applicant eligible?
Check your arithmetic, then answer in <answer> tags with Yes/No and one sentence."""

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=2000,
    thinking={"type": "adaptive"},
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": question}],
)

if response.stop_reason == "refusal":
    print("Refused")
else:
    for block in response.content:
        if block.type == "text":
            print(block.text)`,
      prompt: {
        system: "You are a bank loan officer assistant. Reason carefully and verify arithmetic. Put the final decision in <answer> tags with Yes/No and one sentence.",
        user: "Applicant: monthly salary Rs 45,000, existing EMI Rs 12,000.\nBank rule: total EMIs must not exceed 50% of salary.\nNew loan EMI would be Rs 9,500. Is the applicant eligible?\nCheck your arithmetic, then answer in <answer> tags with Yes/No and one sentence."
      },
      result: `Limit: 50% of 45,000 = 22,500
Total EMI with new loan: 12,000 + 9,500 = 21,500
21,500 <= 22,500, so the rule is satisfied (Rs 1,000 headroom).

<answer>Yes - total EMIs of Rs 21,500 are within the 50% limit of Rs 22,500.</answer>`,
      explanation: "With thinking enabled the model reasons internally (thinking blocks) and the code prints only the text blocks. The <answer> tags let your app extract the decision easily. Notice there is no temperature parameter - current Claude models control depth with effort instead."
    }
  ],
  tools: [
    { name: "Claude (claude.ai)", use: "Turn on extended thinking for hard maths/logic and expand it to read the reasoning", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Reasoning modes for multi-step problems; compare answers with Claude", url: "https://chatgpt.com" },
    { name: "Google Gemini", use: "Thinking models for step-by-step problem solving", url: "https://gemini.google.com" },
    { name: "AI Prompt Lab (in-app)", use: "Save step-by-step and self-check templates; run with different effort levels", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What is chain-of-thought prompting?", a: "A technique where the model is asked to produce intermediate reasoning steps before the final answer. Because each written step becomes context for the next, accuracy improves on multi-step tasks like maths and logic.", level: "Easy" },
    { q: "Why does step-by-step reasoning improve LLM accuracy?", a: "LLMs generate token by token. Writing intermediate results lets the model use them as context instead of computing everything in one jump, and it exposes errors so they can be checked.", level: "Medium" },
    { q: "What is a self-check (self-verification) prompt?", a: "An instruction asking the model to review its own answer: recompute numbers, confirm all conditions are met, list assumptions, and correct any errors before finalising.", level: "Easy" },
    { q: "What is problem decomposition in prompting?", a: "Breaking a complex task into smaller sub-tasks (in one prompt as numbered steps, or across multiple chained prompts) so each part is solved reliably and the results build on each other.", level: "Easy" },
    { q: "How do modern Claude models handle reasoning in the API?", a: "They support adaptive thinking (thinking: {type: 'adaptive'}) where the model decides how much to think, and an effort setting in output_config (low to max) that trades speed and cost for depth.", level: "Medium" },
    { q: "When should you avoid chain-of-thought prompting?", a: "For simple tasks like rewriting, translation or formatting where reasoning adds cost and latency without improving quality.", level: "Medium" },
    { q: "How do you show only the final answer to users while still using reasoning?", a: "Ask for reasoning in <thinking> tags and the answer in <answer> tags, then parse and display only the answer; or use built-in thinking blocks and show only text blocks.", level: "Medium" },
    { q: "Does self-verification guarantee correctness?", a: "No. It reduces errors but models can confidently confirm wrong answers. Critical outputs need independent checks: code execution, a calculator, a second method or human review.", level: "Medium" },
    { q: "How can you reduce hallucination in analytical answers?", a: "Provide the data, instruct the model to use only that data, ask it to quote supporting lines, allow it to say 'not enough information', and add a verification step.", level: "Hard" },
    { q: "Explain least-to-most prompting.", a: "Decompose a hard problem into a sequence of simpler sub-questions, solve the simplest first, and feed each answer into the next sub-question until the original problem is solved.", level: "Hard" }
  ],
  practice: [
    { task: "Ask the AI: 'A train leaves Pune at 6:40 AM and reaches Mumbai at 10:05 AM with a 15-minute halt. What is the running time?' once directly and once with step-by-step + verification.", hint: "Total time minus halt.", solution: "6:40 to 10:05 = 3 h 25 min; minus 15 min halt = 3 h 10 min running time. The step-by-step version shows both sub-calculations." },
    { task: "Write a decomposed prompt to plan a 4-week study schedule for the PL-300 Power BI exam.", hint: "Steps: list topics, estimate hours, allocate weeks, add revision and mock tests, check total hours.", solution: "Steps: 1) List exam skill areas. 2) Estimate hours each. 3) Allocate across 4 weeks at 10 h/week. 4) Reserve week 4 for revision and 2 mock tests. 5) Check total = 40 hours. Format: table Week, Topics, Hours." },
    { task: "Paste one of your own Excel formulas and ask the AI to test it on 3 cases including a boundary value.", hint: "Boundary = exactly at the limit (e.g. marks = 40 for pass).", solution: "Example: =IF(B2>40,\"Pass\",\"Fail\") tested on 39, 40, 41 reveals that 40 fails when the rule says '40 and above passes'. Fix: >=40." },
    { task: "Add a self-check block to a prompt that compares two mobile recharge plans over 1 year.", hint: "Ask it to compute cost per day and total, then recompute in a second way.", solution: "Add: 'Verify: compute yearly cost as (price / validity days) x 365 for each plan and confirm it matches your first calculation. List any assumptions.'" }
  ],
  quiz: [
    { question: "Chain-of-thought prompting mainly helps with:", options: ["Making answers shorter", "Multi-step reasoning such as maths and logic", "Generating images", "Reducing token cost"], answer: 1, explanation: "Writing intermediate steps improves multi-step reasoning; it usually increases tokens." },
    { question: "Which line is a self-check instruction?", options: ["Write in a friendly tone", "Use bullet points", "Before finalising, recompute each number and confirm all conditions are met", "You are an expert accountant"], answer: 2, explanation: "It asks the model to verify its own work." },
    { question: "In the current Claude API, how do you ask for deeper reasoning?", options: ["Set temperature to 0", "Use thinking: {type: 'adaptive'} and a higher effort in output_config", "Prefill the assistant message", "Use top_k"], answer: 1, explanation: "Current Claude models use adaptive thinking and effort; temperature and prefill are rejected." },
    { question: "For which task is step-by-step reasoning LEAST useful?", options: ["Fixing grammar in one sentence", "Calculating EMI eligibility", "Debugging a nested IF formula", "Comparing two loan offers"], answer: 0, explanation: "Simple rewriting doesn't benefit from reasoning steps." },
    { question: "Why tell the model 'If data is missing, say what is missing'?", options: ["To make it faster", "To get longer answers", "It is required syntax", "To reduce made-up (hallucinated) answers"], answer: 3, explanation: "Giving permission to admit gaps reduces guessing." }
  ]
};
