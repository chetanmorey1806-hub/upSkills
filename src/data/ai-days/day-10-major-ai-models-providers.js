const scorecardDemo = `# Choosing a model with a weighted scorecard (scores 1-5 are YOUR team's ratings)
needs = {"quality": 5, "speed": 3, "low_cost": 4, "privacy_self_host": 2}  # importance

candidates = {
    "Large closed model (e.g. Claude Opus / top GPT / Gemini Pro)":
        {"quality": 5, "speed": 3, "low_cost": 2, "privacy_self_host": 2},
    "Small fast closed model (e.g. Claude Haiku / mini / Flash)":
        {"quality": 3, "speed": 5, "low_cost": 5, "privacy_self_host": 2},
    "Open-weight model you host (e.g. Llama / Mistral)":
        {"quality": 3, "speed": 4, "low_cost": 4, "privacy_self_host": 5},
}

results = []
for name, rating in candidates.items():
    total = sum(needs[k] * rating[k] for k in needs)
    results.append((total, name))

for total, name in sorted(results, reverse=True):
    print(f"{total:3}  {name}")
print("Max possible:", 5 * sum(needs.values()))
`;

export default {
  id: "day-10-major-ai-models-providers",
  title: "Major AI Models & Providers: Claude (Anthropic), GPT (OpenAI), Gemini (Google), Llama (Meta), Mistral; open vs closed models; choosing a model",
  module: "Module 2: Generative AI & Large Language Models",
  day: 10,
  level: "Beginner",
  duration: "2 hours",
  summary: "Get to know the main AI model families and the companies behind them - Anthropic's Claude, OpenAI's GPT, Google's Gemini, Meta's Llama and Mistral AI - plus the difference between closed (API-only) and open-weight models. Learn the practical factors for choosing a model (quality, speed, cost, context, privacy, multimodality, licence) and build a simple weighted scorecard in Python.",
  objectives: [
    "Name the major AI providers and their flagship model families",
    "Explain the difference between closed models and open-weight models",
    "Understand model tiers (large/capable vs small/fast) and why both exist",
    "Compare models using criteria like quality, latency, cost, context window, privacy and licence",
    "Make and justify a model choice for a given use case",
  ],
  theory: [
    {
      heading: "The AI model landscape (who makes what)",
      content: "A model is the trained 'brain'; a product is the app built around it. For example, Claude is both Anthropic's model family and its chat app; GPT models power ChatGPT; Gemini models power the Gemini app. Most providers offer: a consumer chat app (free tier available / paid plans), an API for developers, and several model sizes.",
      points: [
        "Anthropic - Claude: known for strong writing, reasoning, coding and agentic tasks, long context and a focus on AI safety. Apps: claude.ai, Claude Code; API via Anthropic and major cloud platforms",
        "OpenAI - GPT models: power ChatGPT; broad ecosystem including image generation and voice",
        "Google - Gemini: deeply integrated with Google products (Search, Workspace, Android); strong multimodal capabilities",
        "Meta - Llama: open-weight models you can download and run yourself (licence terms apply)",
        "Mistral AI (France): offers both open-weight and commercial models; popular for efficient, self-hostable options",
        "Others: Microsoft Copilot (built on partner models), xAI Grok, DeepSeek and Qwen (open-weight models from China), Cohere (enterprise), and thousands of models on Hugging Face",
      ],
      tip: "Model versions change every few months. Focus on understanding the families and the selection criteria; always check the provider's current model list before building.",
    },
    {
      heading: "Claude model family (current IDs for developers)",
      content: "Anthropic offers several Claude models at different capability and speed levels. When you call the API you pass the model ID exactly:",
      syntax: "claude-opus-5-5     -> default choice: most capable Opus model for complex reasoning, coding and agents\nclaude-sonnet-5-5   -> fast and capable: great balance of quality, speed and cost\nclaude-haiku-5-5    -> cheapest and fastest: high-volume, simple or real-time tasks\nclaude-fable-5-2    -> most capable, premium: the hardest problems where top quality matters most",
      points: [
        "A minimal API call (Python 'anthropic' SDK, Day 29): client.messages.create(model='claude-opus-5-5', max_tokens=1024, messages=[...])",
        "API keys come from the ANTHROPIC_API_KEY environment variable - never hard-code keys in code",
        "Current Claude models do not use temperature/top_p; you can set output_config with an effort level ('low' to 'max') to trade speed and cost for depth",
        "Other providers likewise have big/capable and small/fast tiers (for example 'mini' or 'Flash' style models)",
      ],
    },
    {
      heading: "Closed vs open-weight models",
      content: "Closed (proprietary) models: you use them through the provider's app or API; the weights (parameters) are not released. Open-weight models: the trained weights are published so you can download, run and fine-tune them on your own hardware or cloud (subject to the licence). 'Open source' strictly also means open training code and data - many 'open' models are open-weight only.\n\nAnalogy: a closed model is like eating at a restaurant (great food, no kitchen work, but you follow their rules and pay per meal). An open-weight model is like getting the recipe - you cook at home with your own kitchen, effort and control.",
      points: [
        "Closed (Claude, GPT, Gemini): usually top quality, no infrastructure to manage, frequent improvements, built-in safety; you send data to the provider (check data terms), pay per token",
        "Open-weight (Llama, Mistral open models, Qwen, DeepSeek, Gemma): run on your own servers for data control, offline use, customisation and fine-tuning; you manage hardware, scaling, updates and safety",
        "Tools to run open models locally: Ollama, LM Studio; on the web: Hugging Face",
        "Licences differ - some open-weight licences have usage restrictions; read them before commercial use",
      ],
    },
    {
      heading: "How to choose a model: the 8 criteria",
      content: "There is no single 'best' model - only the best model for your task, budget and constraints. Use these criteria:",
      points: [
        "1. Quality on YOUR task: test with 10-20 real examples; public leaderboards are only a starting point",
        "2. Speed (latency): chat and real-time features need fast responses; small models are faster",
        "3. Cost: price per input/output token x expected volume; small models are much cheaper for high volume",
        "4. Context window: how much text you must send at once (long documents, codebases)",
        "5. Modalities: do you need image input, image generation, audio, or video?",
        "6. Privacy and compliance: where data goes, data retention, regional hosting, or need for self-hosting",
        "7. Tooling and ecosystem: tool use/function calling, structured outputs, SDKs, cloud availability",
        "8. Licence and vendor risk: terms of use, open vs closed, ability to switch providers",
      ],
      tip: "Common pattern: start with a strong model to prove the idea works, then test whether a smaller, cheaper model is good enough for production. Some apps route easy questions to a small model and hard ones to a big model.",
    },
    {
      heading: "Benchmarks and leaderboards - use with care",
      content: "Providers publish benchmark scores (maths, coding, reasoning tests) and community sites rank models by human votes. These help with a first shortlist, but scores change quickly, may not match your use case, and some benchmarks leak into training data. Your own evaluation on your own examples matters most (Day 34).",
      points: [
        "Make a small test set: 10-50 real inputs with what a good answer looks like",
        "Run each candidate model on the same set and score the answers (accuracy, format, tone, speed, cost)",
        "Re-check when new model versions are released",
      ],
    },
  ],
  examples: [
    {
      title: "Compare three chat assistants on the same task",
      scenario: "You will hear 'which AI is best?' often. Answer it properly by testing on a real task.",
      steps: [
        "Open claude.ai, chatgpt.com and gemini.google.com in three browser tabs (free tiers available)",
        "Paste the same prompt below into each",
        "Score each answer from 1-5 on: correctness, following the format, clarity, and speed",
        "Record scores in a small table and pick a winner for THIS task",
        "Repeat with a different task type (for example a coding question) - the winner may change",
      ],
      code: `You are a career counsellor.
A final-year B.Com student is good at Excel and wants to move into data analytics.
Give a 6-week learning plan as a table: Week | Topics | One free resource type | Mini project.
Then list 3 common mistakes to avoid. Max 250 words.`,
      prompt: {
        system: "You are a practical career counsellor for students in India. Be specific and realistic.",
        user: "A final-year B.Com student is good at Excel and wants to move into data analytics.\nGive a 6-week learning plan as a table: Week | Topics | One free resource type | Mini project.\nThen list 3 common mistakes to avoid. Max 250 words.",
      },
      result: "Three similar but different 6-week plans (Excel advanced -> SQL -> Power BI/Tableau -> Python basics -> statistics -> portfolio project). Your scoring table shows which assistant followed the format and word limit best for this task.",
      explanation: "Models differ in style, accuracy and instruction-following, and the ranking depends on the task. A small personal test set is more useful than generic opinions.",
    },
    {
      title: "Weighted model-selection scorecard (pure Python)",
      scenario: "Your team is building a high-volume customer FAQ bot. Quality matters, cost matters a lot, speed matters, self-hosting matters a little. Score three types of model.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read the ranking - the totals are weight x rating summed over criteria",
        "Change the needs to a legal-research tool: quality 5, speed 2, low_cost 2, privacy_self_host 3 and run again",
        "Notice how the 'best' model changes with the requirements",
      ],
      code: scorecardDemo,
      python: { files: { "main.py": scorecardDemo }, stdin: "" },
      result: ` 54  Small fast closed model (e.g. Claude Haiku / mini / Flash)
 53  Open-weight model you host (e.g. Llama / Mistral)
 46  Large closed model (e.g. Claude Opus / top GPT / Gemini Pro)
Max possible: 70`,
      explanation: "For a high-volume FAQ bot, a small fast model wins narrowly over a self-hosted open model because cost and speed carry high weight. The ratings here are example opinions, not benchmarks - in a real project you would fill them from your own tests and current pricing. The method (weights x ratings) is what matters.",
    },
    {
      title: "Your first look at a Claude API call (read-only preview)",
      scenario: "See how a developer chooses a model in code. You will run this properly on Day 29; today just read and understand each line.",
      steps: [
        "Read the code below line by line",
        "Find where the model is chosen (the model= line)",
        "Notice the API key is read from an environment variable, not typed into the code",
        "Notice that the code checks stop_reason before reading the answer",
        "Optional: open the AI Prompt Lab (/tools/ai-lab) and use 'Run with Claude' with your own API key to call a model without writing code",
      ],
      code: `# pip install anthropic     (run on your computer, not in the browser IDE)
# export ANTHROPIC_API_KEY="..."   (set in your terminal; never hard-code keys)
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY automatically

response = client.messages.create(
    model="claude-opus-5-5",            # try claude-sonnet-5-5 or claude-haiku-5-5 too
    max_tokens=300,
    system="You are a concise tutor.",
    messages=[{"role": "user", "content": "Explain open vs closed AI models in 3 bullets."}],
)

if response.stop_reason == "refusal":
    print("The model declined this request.")
else:
    print(response.content[0].text)
    print("Tokens used:", response.usage.input_tokens, "in /", response.usage.output_tokens, "out")`,
      result: "Three bullet points explaining closed models (API-only, weights private) vs open-weight models (downloadable, self-hostable), followed by a line like 'Tokens used: 31 in / 95 out' (exact numbers vary).",
      explanation: "Switching models is often as simple as changing the model ID string - which is why it pays to test several. Bigger models cost more per token; smaller ones respond faster. Checking stop_reason and keeping keys in environment variables are professional habits from day one.",
    },
    {
      title: "Get a model recommendation with justification",
      scenario: "Use a chat assistant as a consultant - but verify the recommendation against today's criteria.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check that every recommendation mentions the criteria (quality, speed, cost, context, privacy, licence)",
        "Verify any specific model names on the provider websites because model lists change often",
      ],
      code: `Recommend a model TYPE (large closed, small fast closed, or open-weight self-hosted) for each project, with a 2-line justification using these criteria: quality, speed, cost, context window, privacy, licence.
1. A hospital wants to summarise patient notes and data must not leave its own servers
2. A startup builds an AI coding agent that edits large codebases
3. An e-commerce site auto-tags 5 million product titles per day
4. A student wants a free chatbot to help with exam revision
Do not quote prices.`,
      prompt: {
        system: "You are an independent AI consultant. Be vendor-neutral, practical, and avoid exact prices.",
        user: "Recommend a model TYPE (large closed, small fast closed, or open-weight self-hosted) for each project, with a 2-line justification using these criteria: quality, speed, cost, context window, privacy, licence.\n1. A hospital wants to summarise patient notes and data must not leave its own servers\n2. A startup builds an AI coding agent that edits large codebases\n3. An e-commerce site auto-tags 5 million product titles per day\n4. A student wants a free chatbot to help with exam revision\nDo not quote prices.",
      },
      result: "1 Open-weight self-hosted (privacy/compliance). 2 Large closed model (top quality, long context, strong tool use). 3 Small fast model or a fine-tuned small open model (volume and cost). 4 Free tier of a consumer chat app (Claude, ChatGPT or Gemini).",
      explanation: "Different constraints lead to different choices. Privacy needs can rule out cloud APIs (unless enterprise agreements and regional hosting satisfy policy); volume pushes toward small models; complex agentic work favours the most capable models.",
    },
  ],
  tools: [
    { name: "Claude", use: "Anthropic's assistant and model family", url: "https://claude.ai" },
    { name: "ChatGPT", use: "OpenAI's assistant powered by GPT models", url: "https://chatgpt.com" },
    { name: "Google Gemini", use: "Google's assistant and model family", url: "https://gemini.google.com" },
    { name: "Meta Llama", use: "Open-weight models you can download and self-host", url: "https://www.llama.com" },
    { name: "Mistral AI", use: "Open-weight and commercial models; Le Chat assistant", url: "https://mistral.ai" },
    { name: "Hugging Face", use: "Hub for thousands of open models and leaderboards", url: "https://huggingface.co" },
    { name: "Ollama", use: "Run open-weight models locally on your computer", url: "https://ollama.com" },
  ],
  interview: [
    { q: "Name the major LLM providers and their model families.", a: "Anthropic (Claude), OpenAI (GPT), Google (Gemini), Meta (Llama, open-weight), Mistral AI (Mistral models). Others include xAI (Grok), DeepSeek, Alibaba (Qwen) and Cohere.", level: "Easy" },
    { q: "What is the difference between open-weight and closed models?", a: "Closed models are accessed only via the provider's app/API and their weights are private. Open-weight models publish their weights so you can download, self-host and fine-tune them under a licence.", level: "Easy" },
    { q: "Is 'open-weight' the same as 'open source'?", a: "Not exactly. Open source traditionally means the full code, and ideally data and training process, are available under an open licence. Many models only release weights, often with usage restrictions.", level: "Medium" },
    { q: "How would you choose an LLM for a production app?", a: "Define requirements, shortlist models, build a test set from real inputs, compare quality, latency, cost, context window, modalities, tool support, privacy/compliance and licence, then pick the smallest model that meets the quality bar, and monitor after launch.", level: "Medium" },
    { q: "Why do providers offer both large and small models?", a: "Large models give the best quality for complex tasks but cost more and are slower. Small models are cheaper and faster for simple, high-volume or real-time tasks.", level: "Easy" },
    { q: "When would you self-host an open-weight model?", a: "When data must stay on your own infrastructure, you need offline/edge deployment, deep customisation or fine-tuning, or predictable costs at very high volume - and you can manage the infrastructure.", level: "Medium" },
    { q: "Why shouldn't you rely only on public benchmarks?", a: "Benchmarks may not reflect your task, can be contaminated by training data, and change quickly. Evaluating on your own representative examples is more reliable.", level: "Medium" },
    { q: "What is model routing?", a: "Sending each request to a different model based on difficulty or type - for example a small fast model for simple queries and a large model for complex ones - to balance cost and quality.", level: "Hard" },
    { q: "Where should an API key be stored?", a: "In environment variables or a secrets manager, never hard-coded in source code or committed to Git, and never exposed in front-end code.", level: "Easy" },
    { q: "What is vendor lock-in and how can you reduce it?", a: "Dependence on one provider's models and features. Reduce it with an abstraction layer in your code, portable prompts, your own evaluation set, and testing alternative models periodically.", level: "Hard" },
  ],
  practice: [
    { task: "In the scorecard demo, set needs for a legal-research tool: quality 5, speed 2, low_cost 2, privacy_self_host 3. Which model wins?", hint: "Recalculate weight x rating for each criterion.", solution: "Large closed: 25+6+4+6 = 41. Small fast: 15+10+10+6 = 41. Open-weight: 15+8+8+15 = 46. The open-weight self-hosted model wins (46) because privacy now matters more, and the two closed models tie at 41." },
    { task: "Add a fourth candidate to the scorecard: 'Mid-size closed model (e.g. Claude Sonnet)' with ratings quality 4, speed 4, low_cost 4, privacy_self_host 2.", hint: "Add another key to the candidates dictionary.", solution: "With the original needs: 5x4 + 3x4 + 4x4 + 2x2 = 20+12+16+4 = 52, placing it third, between the open-weight model (53) and the large closed model (46)." },
    { task: "Visit the websites of Anthropic, OpenAI, Google Gemini, Meta Llama and Mistral. For each, note: flagship model family, whether there is a free chat app, and whether weights are open.", hint: "Look for 'Models' or 'Developers' pages.", solution: "Claude (closed, free tier app), GPT (closed, free tier app), Gemini (closed, free tier app; Google also has open Gemma models), Llama (open-weight), Mistral (both open-weight and commercial; Le Chat app)." },
    { task: "Write a 10-question mini test set for choosing a model for a 'college FAQ bot'.", hint: "Mix easy questions, tricky ones and one that should be refused or answered 'I don't know'.", solution: "Example: fee due date, library timing, exam re-evaluation process, hostel rules, scholarship eligibility, a question not in the handbook (should say 'not available'), a Hindi question, a typo-filled question, a two-part question, and an off-topic request." },
    { task: "Install Ollama (optional, needs a decent laptop) and run a small open model, or browse Hugging Face to find three open-weight chat models and their licences.", hint: "Model cards list licence and size.", solution: "You should note model names, sizes (for example 1B-8B parameters for laptops), and licence types (Apache 2.0, Llama licence, etc.)." },
  ],
  quiz: [
    { question: "Which model family is released as open-weight by Meta?", options: ["Claude", "Gemini", "Llama", "GPT"], answer: 2, explanation: "Meta publishes Llama model weights under its licence." },
    { question: "A key advantage of self-hosting an open-weight model is:", options: ["No hardware needed", "Data can stay on your own infrastructure", "It is always the most accurate", "No setup required"], answer: 1, explanation: "Self-hosting gives data control, but you manage the infrastructure." },
    { question: "For millions of simple tagging requests per day, the best first choice is usually:", options: ["A small, fast, low-cost model", "The largest premium model", "Training a new model from scratch", "A human team only"], answer: 0, explanation: "High volume and simple tasks favour small, cheap, fast models." },
    { question: "Where should your ANTHROPIC_API_KEY live?", options: ["Hard-coded in the script", "In a public GitHub repo", "In front-end JavaScript", "In an environment variable or secrets manager"], answer: 3, explanation: "Never hard-code or expose keys." },
    { question: "The most reliable way to pick a model for your app is:", options: ["Choose the newest model", "Test candidates on your own representative examples", "Pick the one with the most social media buzz", "Pick the cheapest always"], answer: 1, explanation: "Your own evaluation on your real task beats generic rankings." },
  ],
};
