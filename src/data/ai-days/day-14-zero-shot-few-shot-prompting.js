export default {
  id: "day-14-zero-shot-few-shot-prompting",
  title: "Zero-shot, Few-shot and Example-driven Prompting",
  module: "Module 3: Prompt Engineering",
  day: 14,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn when to simply ask (zero-shot), when to show one example (one-shot) and when to show several examples (few-shot) so the AI copies your exact style, labels and format.",
  objectives: [
    "Define zero-shot, one-shot and few-shot prompting",
    "Decide which approach fits a task (classification, extraction, style matching)",
    "Write good examples: diverse, correct, consistent and clearly separated",
    "Avoid common few-shot mistakes such as biased or copied examples"
  ],
  theory: [
    {
      heading: "Zero-shot prompting: just ask",
      content: "Zero-shot means you give the instruction with NO examples. Modern models are trained on huge amounts of text, so they already know how to summarise, translate, classify sentiment or write an email. Zero-shot is the fastest option and works well for common tasks with an obvious expected output. Analogy: asking an experienced chef to 'make a masala omelette' - no recipe needed.",
      syntax: `Classify the sentiment of this review as Positive, Negative or Neutral.
Review: "Delivery was late but the phone works perfectly."`,
      points: [
        "Best for: common tasks, quick questions, brainstorming",
        "Weakness: output style and labels may not match exactly what you want",
        "Always try zero-shot first; add examples only if the output is inconsistent"
      ]
    },
    {
      heading: "One-shot and few-shot prompting: show, don't just tell",
      content: "In one-shot prompting you give one solved example; in few-shot you give several (usually 2-5). The model detects the pattern - the labels, the length, the tone, the exact format - and repeats it for your new input. Analogy: a new employee learns your company's invoice format much faster from three filled invoices than from a paragraph describing it.",
      syntax: `Input: <example input 1>
Output: <example output 1>

Input: <example input 2>
Output: <example output 2>

Input: <NEW input>
Output:`,
      points: [
        "Best for: custom labels, company-specific formats, a particular writing voice, tricky edge cases",
        "Examples are often more powerful than long instructions for controlling format",
        "Claude works well with examples wrapped in <example> tags"
      ]
    },
    {
      heading: "What makes a good example?",
      content: "The model copies your examples very closely - including their mistakes. So examples must be correct, consistent and representative.",
      points: [
        "CORRECT - every example output must be exactly what you would accept",
        "DIVERSE - cover different cases (positive, negative, edge case) so the model doesn't over-copy one pattern",
        "CONSISTENT - same format, same label spelling, same field order in every example",
        "RELEVANT - examples similar to the real inputs you will send",
        "SEPARATED - wrap them in <example> tags or clear headings so the model knows they are examples, not the task"
      ],
      tip: "If every example is positive, the model may lean towards labelling everything positive. Balance your examples."
    },
    {
      heading: "Few-shot for classification and extraction",
      content: "Two of the most common business uses are classification (putting text into categories, e.g. support tickets into Billing / Technical / Delivery) and extraction (pulling fields like name, date, amount out of text). Examples show the model your exact category list and output shape, which makes results easy to paste into Excel or a database.",
      points: [
        "List the allowed labels explicitly AND show them in examples",
        "Include at least one tricky example (e.g. a ticket that mentions two issues) with the decision rule",
        "Ask the model to output ONLY the label or a fixed format so results are machine-readable"
      ]
    },
    {
      heading: "Example-driven style matching",
      content: "When you want the AI to write like you or like your brand, paste 2-3 real samples of the target style and ask it to match tone, sentence length and vocabulary. This works for social media posts, product descriptions, newsletters and customer replies. Tell the model to copy the STYLE, not the content, otherwise it may reuse facts from the examples.",
      tip: "Add the line 'Use the examples only for style; do not reuse their facts or wording.'"
    },
    {
      heading: "Choosing between zero-shot and few-shot",
      content: "Start with zero-shot. If results vary in format, use wrong labels, or miss your style, add one example. If edge cases still fail, add 2-4 more targeted examples. More examples cost more tokens (Day 8), so use the smallest number that gives consistent results.",
      points: [
        "Zero-shot: fast, cheap, good for general tasks",
        "One-shot: fixes format quickly",
        "Few-shot: best consistency for labels, styles and edge cases",
        "Too many examples: higher cost and risk of copying them too literally"
      ]
    }
  ],
  examples: [
    {
      title: "BAD (zero-shot) vs GOOD (few-shot): Support ticket classification",
      scenario: "An e-commerce support team wants every incoming ticket tagged as Billing, Delivery, Product Defect or Account so it goes to the right team. Zero-shot gives inconsistent labels like 'Shipping issue' or 'Payment problem', which break their Excel filter.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Run the BAD prompt: notice labels like 'Shipping/Delivery issue' that don't match your list",
        "Run the GOOD few-shot prompt below",
        "Copy the output into Excel; the labels are now consistent and filterable",
        "Optional: open AI Prompt Lab, use the 'Examples' field to store the 4 examples for reuse"
      ],
      code: `BAD PROMPT:
What category is this ticket? "I was charged twice for order #4521."

GOOD PROMPT:
Classify each support ticket into exactly one label:
Billing | Delivery | Product Defect | Account
Output only: <ticket id> - <label>

<example>
Ticket T1: "Refund for my cancelled order is still not credited."
T1 - Billing
</example>
<example>
Ticket T2: "Package shows delivered but I never received it."
T2 - Delivery
</example>
<example>
Ticket T3: "Mixer grinder stopped working after 2 days."
T3 - Product Defect
</example>
<example>
Ticket T4: "OTP is not coming, I can't log in."
T4 - Account
</example>

Now classify:
T5: "I was charged twice for order #4521."
T6: "Wrong size shoes delivered, need exchange pickup."
T7: "How do I change the email on my profile?"
T8: "Screen has a dead pixel line on arrival."`,
      prompt: {
        system: "You are a support ticket router. Classify each ticket into exactly one label from: Billing, Delivery, Product Defect, Account. Output only lines in the form '<ticket id> - <label>' with no extra text.",
        user: "<example>\nTicket T1: \"Refund for my cancelled order is still not credited.\"\nT1 - Billing\n</example>\n<example>\nTicket T2: \"Package shows delivered but I never received it.\"\nT2 - Delivery\n</example>\n<example>\nTicket T3: \"Mixer grinder stopped working after 2 days.\"\nT3 - Product Defect\n</example>\n<example>\nTicket T4: \"OTP is not coming, I can't log in.\"\nT4 - Account\n</example>\n\nNow classify:\nT5: \"I was charged twice for order #4521.\"\nT6: \"Wrong size shoes delivered, need exchange pickup.\"\nT7: \"How do I change the email on my profile?\"\nT8: \"Screen has a dead pixel line on arrival.\""
      },
      result: `T5 - Billing
T6 - Delivery
T7 - Account
T8 - Product Defect`,
      explanation: "The four examples teach the exact label spelling and the 'ID - Label' format, one per category, so the model does not invent new labels. T6 is an edge case (wrong item could be Product Defect or Delivery); if your team routes it differently, add an example showing the correct decision. Output like this can be pasted straight into Excel and split with Text to Columns."
    },
    {
      title: "Few-shot data extraction into a CSV row",
      scenario: "An accounts assistant receives vendor payment messages on WhatsApp and must enter them into an Excel sheet with columns Vendor, Invoice No, Amount, Due Date.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below with the 2 examples",
        "Add your new messages at the end",
        "Copy the CSV lines into Notepad, save as payments.csv and open in Excel"
      ],
      code: `Extract Vendor, Invoice No, Amount (number only), Due Date (DD-MM-YYYY) as a CSV row.
If a field is missing write NA. Output only CSV rows, no header.

Example 1
Message: "Hi, Sharma Traders here. Invoice ST-889 for Rs 12,500 is due on 5th April 2026."
Row: Sharma Traders,ST-889,12500,05-04-2026

Example 2
Message: "Please clear bill no. 4471 from Gupta Packaging, total 8,200/-"
Row: Gupta Packaging,4471,8200,NA

Now extract:
Message: "Reminder from Om Logistics - INV/2026/031 amount Rs 23,750 payable by 30-03-2026"
Message: "Krishna Stationery: bill K-12, 1,180 rupees, pay before 2 April 2026"`,
      prompt: {
        system: "You extract invoice data into CSV rows: Vendor,Invoice No,Amount,Due Date. Amount is a plain number without commas or currency. Date format DD-MM-YYYY. Missing fields are NA. Output only CSV rows, no header, no explanations.",
        user: "Example 1\nMessage: \"Hi, Sharma Traders here. Invoice ST-889 for Rs 12,500 is due on 5th April 2026.\"\nRow: Sharma Traders,ST-889,12500,05-04-2026\n\nExample 2\nMessage: \"Please clear bill no. 4471 from Gupta Packaging, total 8,200/-\"\nRow: Gupta Packaging,4471,8200,NA\n\nNow extract:\nMessage: \"Reminder from Om Logistics - INV/2026/031 amount Rs 23,750 payable by 30-03-2026\"\nMessage: \"Krishna Stationery: bill K-12, 1,180 rupees, pay before 2 April 2026\""
      },
      result: `Om Logistics,INV/2026/031,23750,30-03-2026
Krishna Stationery,K-12,1180,02-04-2026`,
      explanation: "Example 1 shows date conversion ('5th April 2026' -> 05-04-2026) and removing 'Rs' and commas. Example 2 shows the NA rule for a missing due date. With these two examples the model handles new message styles reliably. Always spot-check amounts against the original messages before posting payments."
    },
    {
      title: "Style matching: write Instagram captions in the brand's voice",
      scenario: "A small Pune bakery's social media intern needs captions that sound like the owner's past posts: short, warm, a little Marathi flavour, and always ending with the opening hours.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste 3 real past captions inside <style_examples>",
        "Describe the new post (new product) and run",
        "Ask for 3 options and pick the best one"
      ],
      code: `Here are 3 past captions from our bakery. Match their style (length, tone, emoji use,
sign-off) but do NOT reuse their content.

<style_examples>
1. Fresh pav straight out of the oven at 7 AM. Garam garam, just like aaji used to make. Open 7 AM - 9 PM
2. Weekend = chocolate truffle time. Pre-order by Friday, pick up Saturday! Open 7 AM - 9 PM
3. Rainy evening + our butter khari + chai = perfect. Kay mhanta? Open 7 AM - 9 PM
</style_examples>

New post: We launched a ragi (finger millet) cookie, sugar-free, Rs 120 for 200 g.
Write 3 caption options.`,
      prompt: {
        system: "You are a social media writer for a small family bakery in Pune. Match the style of provided examples exactly but never reuse their content.",
        user: "<style_examples>\n1. Fresh pav straight out of the oven at 7 AM. Garam garam, just like aaji used to make. Open 7 AM - 9 PM\n2. Weekend = chocolate truffle time. Pre-order by Friday, pick up Saturday! Open 7 AM - 9 PM\n3. Rainy evening + our butter khari + chai = perfect. Kay mhanta? Open 7 AM - 9 PM\n</style_examples>\n\nNew post: We launched a ragi (finger millet) cookie, sugar-free, Rs 120 for 200 g.\nWrite 3 caption options."
      },
      result: `1. Healthy can be tasty too! New sugar-free ragi cookies, Rs 120 for 200 g. Open 7 AM - 9 PM
2. Ragi cookie + evening chai = guilt-free happiness. Sugar-free, just Rs 120. Try karun bagha! Open 7 AM - 9 PM
3. Aaji's favourite grain, now a crunchy cookie. Sugar-free ragi cookies are here - Rs 120/200 g. Open 7 AM - 9 PM`,
      explanation: "Three style samples teach short sentences, a light Marathi touch and the fixed sign-off, which a description like 'warm and local' could not capture as precisely. The instruction 'do NOT reuse their content' stops the model from mentioning pav or truffles again."
    },
    {
      title: "Few-shot prompting in code: building the examples from a list",
      scenario: "A developer stores labelled examples in a Python list and builds a few-shot prompt automatically. This program only builds and prints the prompt (no API needed), so you can run it in the Python IDE.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Copy the printed prompt into claude.ai or AI Prompt Lab and run it",
        "Add a new example to the list and run again to see how the prompt grows"
      ],
      code: `examples = [
    ("The trainer explained DAX very clearly.", "Positive"),
    ("Projector didn't work for half the session.", "Negative"),
    ("Session was on Saturday at 10 AM.", "Neutral"),
]
new_feedback = "Content was good but the room was too hot."

lines = ["Classify training feedback as Positive, Negative, Mixed or Neutral.",
         "Answer with the label only.", ""]
for text, label in examples:
    lines.append("<example>")
    lines.append("Feedback: " + text)
    lines.append("Label: " + label)
    lines.append("</example>")
lines.append("")
lines.append("Feedback: " + new_feedback)
lines.append("Label:")
prompt = "\\n".join(lines)
print(prompt)
print("---")
print("Examples used:", len(examples), "| Prompt characters:", len(prompt))`,
      python: {
        files: {
          "main.py": `examples = [
    ("The trainer explained DAX very clearly.", "Positive"),
    ("Projector didn't work for half the session.", "Negative"),
    ("Session was on Saturday at 10 AM.", "Neutral"),
]
new_feedback = "Content was good but the room was too hot."

lines = ["Classify training feedback as Positive, Negative, Mixed or Neutral.",
         "Answer with the label only.", ""]
for text, label in examples:
    lines.append("<example>")
    lines.append("Feedback: " + text)
    lines.append("Label: " + label)
    lines.append("</example>")
lines.append("")
lines.append("Feedback: " + new_feedback)
lines.append("Label:")
prompt = "\\n".join(lines)
print(prompt)
print("---")
print("Examples used:", len(examples), "| Prompt characters:", len(prompt))
`
        },
        stdin: ""
      },
      prompt: {
        system: "Classify training feedback as Positive, Negative, Mixed or Neutral. Answer with the label only.",
        user: "<example>\nFeedback: The trainer explained DAX very clearly.\nLabel: Positive\n</example>\n<example>\nFeedback: Projector didn't work for half the session.\nLabel: Negative\n</example>\n<example>\nFeedback: Session was on Saturday at 10 AM.\nLabel: Neutral\n</example>\n\nFeedback: Content was good but the room was too hot.\nLabel:"
      },
      result: `Classify training feedback as Positive, Negative, Mixed or Neutral.
Answer with the label only.

<example>
Feedback: The trainer explained DAX very clearly.
Label: Positive
</example>
<example>
Feedback: Projector didn't work for half the session.
Label: Negative
</example>
<example>
Feedback: Session was on Saturday at 10 AM.
Label: Neutral
</example>

Feedback: Content was good but the room was too hot.
Label:
---
Examples used: 3 | Prompt characters: 415

When the printed prompt is run in Claude, the answer is:
Mixed`,
      explanation: "Building few-shot prompts from data keeps examples consistent and easy to update. Notice the label list includes 'Mixed' even though no example shows it - the model can still use it because it is listed in the instruction. For better reliability, add one Mixed example too."
    }
  ],
  tools: [
    { name: "Claude (claude.ai)", use: "Run zero-shot and few-shot prompts; Claude follows <example> tags well", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Compare how the same few-shot prompt behaves on another model", url: "https://chatgpt.com" },
    { name: "AI Prompt Lab (in-app)", use: "Store examples in the Examples field and reuse them through the template library", url: "/tools/ai-lab" },
    { name: "Python IDE (in-app)", use: "Build few-shot prompts automatically from lists of labelled data", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "What is zero-shot prompting?", a: "Giving the model an instruction without any examples and relying on its pre-trained knowledge to perform the task, e.g. 'Translate this sentence to Hindi.'", level: "Easy" },
    { q: "What is few-shot prompting?", a: "Including a few solved input-output examples in the prompt so the model learns the pattern (labels, format, style) and applies it to a new input. It is also called in-context learning because the model learns from the prompt without any retraining.", level: "Easy" },
    { q: "Is few-shot prompting the same as fine-tuning?", a: "No. Few-shot examples live only in the prompt and affect only that request; the model weights do not change. Fine-tuning updates the model's weights using a training dataset and persists across all requests.", level: "Medium" },
    { q: "When would you choose few-shot over zero-shot?", a: "When you need custom labels, a strict output format, a specific writing style, or consistent handling of edge cases that zero-shot gets wrong or answers inconsistently.", level: "Easy" },
    { q: "What are the qualities of good few-shot examples?", a: "They are correct, diverse (cover different classes and edge cases), consistent in format, relevant to real inputs, and clearly separated from the actual task, for example using <example> tags.", level: "Medium" },
    { q: "What risk arises if all your examples share the same label?", a: "Label bias: the model may over-predict that label. Examples should be balanced across the classes you expect.", level: "Medium" },
    { q: "How many examples should you use?", a: "Usually 2-5 is enough. Start small and add targeted examples for failing cases. More examples increase token cost and latency and can cause the model to copy examples too literally.", level: "Medium" },
    { q: "How do you stop the model from copying the content of style examples?", a: "Explicitly say to match only style (tone, length, structure) and not reuse facts or wording, and give examples with varied content so no single topic dominates.", level: "Medium" },
    { q: "How would you use few-shot prompting to extract structured data reliably at scale?", a: "Define the schema, give 2-4 examples including edge cases (missing fields, odd formats), require output only in the target format (CSV/JSON), validate the output in code, and use structured output features where available. Track failures and add examples covering them.", level: "Hard" },
    { q: "What is in-context learning?", a: "The ability of large language models to pick up a task from instructions and examples given in the prompt itself, without changing model weights.", level: "Hard" }
  ],
  practice: [
    { task: "Write a zero-shot prompt and then a 3-shot prompt to classify college emails as Academic, Placement, Event or Fee. Compare consistency on 5 test emails.", hint: "Give one example each for 3 classes and list all 4 labels in the instruction.", solution: "3-shot version: 'Classify each email into exactly one of: Academic, Placement, Event, Fee. Output: <no> - <label>. <example>Email: \"Mid-sem exam timetable released\" -> Academic</example> <example>Email: \"TCS pre-placement talk on Monday\" -> Placement</example> <example>Email: \"Last date for semester fee is 10th\" -> Fee</example>' then list 5 new emails." },
    { task: "Collect 3 of your own WhatsApp-style messages and ask the AI to write a birthday wish in YOUR style.", hint: "Use <style_examples> tags and say 'match style, do not reuse content'.", solution: "Paste the 3 messages in <style_examples>, then: 'Write a birthday wish for my friend Sameer who loves cricket, in the same style, max 25 words.'" },
    { task: "Create a few-shot prompt that converts informal expense notes ('chai 40, auto 120') into a table with Item, Category, Amount.", hint: "Show one example with 2 items, including the Category you want (Food, Travel, etc.).", solution: "Example: Notes: 'lunch 150, metro 30' -> | lunch | Food | 150 | | metro | Travel | 30 |. Then: Notes: 'chai 40, auto 120, printout 20'. Expected: chai-Food-40, auto-Travel-120, printout-Office-20." },
    { task: "Modify the Python IDE example to add a 'Mixed' example and a fifth test feedback. Run it and paste the prompt into AI Prompt Lab.", hint: "Append a tuple to the examples list.", solution: "Add (\"Good trainer but too many slides.\", \"Mixed\") to examples and change new_feedback. The prompt will now contain 4 <example> blocks." }
  ],
  quiz: [
    { question: "A prompt with an instruction and NO examples is called:", options: ["Few-shot", "Zero-shot", "Fine-tuning", "Chain prompting"], answer: 1, explanation: "Zero-shot means zero examples." },
    { question: "Few-shot prompting changes the model's weights permanently.", options: ["True, always", "True, but only for Claude", "False - examples only affect that prompt", "False - it deletes training data"], answer: 2, explanation: "Few-shot is in-context learning; only fine-tuning changes weights." },
    { question: "Which is the BEST set of examples for a 3-class sentiment task?", options: ["3 positive examples", "One example per class, consistent format", "10 long examples of the same class", "No examples but a long essay"], answer: 1, explanation: "Balanced, consistent examples avoid label bias and teach the format." },
    { question: "Why wrap examples in <example> tags?", options: ["To make the prompt look nice", "Tags are required for the API to work", "To make the AI ignore them", "To clearly separate examples from the real task"], answer: 3, explanation: "Clear separation helps the model understand which part is a sample and which part to answer." },
    { question: "What is a good first step when designing a new prompt?", options: ["Try zero-shot first, add examples if output is inconsistent", "Always use 20 examples", "Fine-tune a model", "Never give examples"], answer: 0, explanation: "Start simple; add examples only when needed to save tokens and effort." }
  ]
};
