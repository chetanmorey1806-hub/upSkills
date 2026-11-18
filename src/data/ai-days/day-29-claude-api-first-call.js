export default {
  id: "day-29-claude-api-first-call",
  title: "Using AI APIs: Your First Call to the Claude API (Python & JavaScript), API Keys, Tokens, Cost, Models and Errors",
  module: "Module 5: AI for Developers",
  day: 29,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Move from chatting in a browser to calling an AI model from your own code. Create an API key, store it safely in an environment variable, install the official SDKs (Python 'anthropic' and JavaScript '@anthropic-ai/sdk'), send your first Messages API request, read the response and stop_reason, understand tokens, cost and model choice, control effort, and handle errors like a professional.",
  objectives: [
    "Explain what an API is and how an AI API request/response works",
    "Create an Anthropic API key and store it in the ANTHROPIC_API_KEY environment variable (never in code)",
    "Make a first Claude API call in Python and JavaScript using the official SDKs",
    "Read the response correctly: check stop_reason, extract text blocks, read token usage",
    "Choose a model and effort level, estimate cost, and handle common errors (401, 400, 429, 5xx, connection)"
  ],
  theory: [
    {
      heading: "What is an API and why use the Claude API?",
      content: "An API (Application Programming Interface) is a menu that one program offers to other programs. A restaurant analogy: you (your code) give an order (request) to the waiter (the API), the kitchen (the AI model on Anthropic's servers) prepares it, and the waiter brings back the dish (response). With claude.ai you chat by hand; with the API your own app – a website, a script, a chatbot, an automation – can ask Claude questions thousands of times automatically. The Claude API's main endpoint is the Messages API: you send a model name, a maximum output length, an optional system prompt and a list of messages; it returns Claude's reply plus metadata.",
      points: [
        "Request: model, max_tokens, system (optional), messages (list of {role, content})",
        "Response: content (list of blocks, e.g. text), stop_reason, usage (input/output tokens), model, id",
        "Official SDKs: Python package 'anthropic' and JavaScript/TypeScript package '@anthropic-ai/sdk' – they handle HTTP, retries and types for you",
        "The API is stateless: it does not remember earlier calls. For a conversation you send the history every time (Day 30)"
      ]
    },
    {
      heading: "API keys, environment variables and security",
      content: "An API key is like the password to your paid account – anyone who has it can spend your money. Create it in the Claude Console (platform.claude.com) under API keys. Store it in an environment variable named ANTHROPIC_API_KEY; the SDKs read it automatically, so your code never contains the key. Never commit keys to Git, never paste them into front-end JavaScript that runs in the browser, and never share them in screenshots or chats. If a key leaks, delete (revoke) it immediately in the Console and create a new one.",
      syntax: "# macOS / Linux (current terminal)\nexport ANTHROPIC_API_KEY=\"sk-ant-...your key...\"\n\n# Windows PowerShell (current window)\n$env:ANTHROPIC_API_KEY = \"sk-ant-...your key...\"\n\n# Or a .env file (add .env to .gitignore!) loaded by python-dotenv / dotenv\nANTHROPIC_API_KEY=sk-ant-...your key...",
      points: [
        "Console steps: 1) Sign up at platform.claude.com. 2) Add billing / credits as required. 3) Settings -> API keys -> Create key. 4) Copy it once (it won't be shown again). 5) Set it as ANTHROPIC_API_KEY.",
        "Set spend limits and usage alerts in the Console to avoid surprise bills",
        "Use separate keys for development and production, and for each app",
        "Browser apps must call YOUR backend, which then calls the API with the key (Day 35)"
      ],
      tip: "In the in-app AI Prompt Lab, 'Run with Claude' uses your own key only in your browser session – fine for learning, but real products keep keys on a server."
    },
    {
      heading: "Models, tokens and cost",
      content: "A token is a chunk of text – roughly 3–4 characters of English on average, so 100 words is very roughly 130–150 tokens (other languages and code can use more). You pay per input token (what you send: system prompt + messages) and per output token (what Claude writes), and output tokens cost more. Prices differ by model and change over time, so always check the official pricing page. Current Claude model IDs: claude-opus-5-5 (default, most capable Opus), claude-sonnet-5-5 (fast and capable), claude-haiku-5-5 (cheapest and fastest), and claude-fable-5-2 (most capable, premium). Use the exact ID with no date suffix.",
      points: [
        "Cost per call ≈ input_tokens × input price + output_tokens × output price (prices are per million tokens)",
        "max_tokens is the hard cap on output length – the reply stops if it hits it (stop_reason 'max_tokens')",
        "Read real usage from response.usage.input_tokens and response.usage.output_tokens; you can count tokens before sending with the token counting endpoint",
        "Choose the model per task: high-volume simple classification may suit claude-haiku-5-5; complex reasoning and coding suit claude-opus-5-5",
        "Try the tokenizer & cost estimator in the AI Concepts Lab (/tools/ai-concepts)"
      ]
    },
    {
      heading: "Controlling behaviour: system prompt, effort and thinking",
      content: "The system prompt sets Claude's role and rules for the whole request ('You are a friendly maths tutor for class 8...'). Many providers expose sampling knobs like temperature or top_p; on current Claude models you do NOT send temperature, top_p or top_k (the API rejects them). Instead you control how much work Claude does with effort: output_config = {effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'}. Low effort is faster and cheaper for simple tasks; high or above for difficult reasoning or coding. Claude can also think before answering: send thinking = {type: 'adaptive'} (or omit it) and Claude decides how much to think. Also, do not 'prefill' the start of Claude's answer with an assistant message – that is rejected; ask for the format in the prompt or use structured outputs (Day 31).",
      points: [
        "system: role, audience, rules, output format",
        "output_config.effort: low / medium / high / xhigh / max",
        "thinking: {type: 'adaptive'} or omit",
        "No temperature/top_p/top_k, no assistant prefill on current models"
      ]
    },
    {
      heading: "Reading responses safely and handling errors",
      content: "A response's content is a LIST of blocks (text, and in later lessons tool_use or thinking blocks), so loop through and pick the text blocks rather than assuming content[0] is text. Always check stop_reason first: 'end_turn' means Claude finished normally; 'max_tokens' means the answer was cut off; 'refusal' means Claude declined for safety reasons; 'tool_use' means Claude wants to call a tool (Day 31). Network calls can fail, so catch the SDK's typed errors from most specific to least specific.",
      points: [
        "401 AuthenticationError: key missing or invalid – check ANTHROPIC_API_KEY",
        "400 BadRequestError: bad parameters (e.g. wrong model ID, sending temperature)",
        "429 RateLimitError: too many requests or tokens per minute – slow down and retry later",
        "5xx / overloaded: temporary server problem – retry (the SDK already retries some errors automatically)",
        "APIConnectionError: network problem – check internet/proxy"
      ],
      tip: "Log response.id and usage for every call – it makes debugging and cost tracking much easier."
    }
  ],
  examples: [
    {
      title: "Set up your environment and API key",
      scenario: "Prepare your laptop to call the Claude API from Python and Node.js without ever writing the key into code.",
      steps: [
        "Go to platform.claude.com, sign in, open Settings -> API keys -> Create key, and copy it",
        "Open a terminal and set the environment variable (commands below)",
        "Create a project folder and install the SDK: pip install anthropic (Python) and/or npm install @anthropic-ai/sdk (Node.js 18+)",
        "Verify the variable is set (the check command prints only whether it exists, not the key)",
        "Add .env to .gitignore if you use a .env file"
      ],
      code: `# 1) Set the key (macOS / Linux)
export ANTHROPIC_API_KEY="sk-ant-...paste-your-key..."
#    Windows PowerShell:
#    $env:ANTHROPIC_API_KEY = "sk-ant-...paste-your-key..."

# 2) Python SDK
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install anthropic

# 3) JavaScript SDK (Node.js 18+)
npm init -y
npm install @anthropic-ai/sdk

# 4) Check the variable exists without printing it
python3 -c "import os; print('key set:', bool(os.environ.get('ANTHROPIC_API_KEY')))"

# 5) Protect secrets
echo ".env" >> .gitignore`,
      result: "key set: True",
      explanation: "Both SDKs read ANTHROPIC_API_KEY automatically when you create the client with no arguments, so the key never appears in your source code or Git history."
    },
    {
      title: "First Claude API call in Python",
      scenario: "Ask Claude to explain recursion to a beginner in 3 bullet points, check stop_reason, print the text and token usage.",
      steps: [
        "Save the code as first_call.py in your project folder",
        "Make sure ANTHROPIC_API_KEY is set in this terminal",
        "Run: python3 first_call.py",
        "Read the printed answer, stop_reason and token counts",
        "Change output_config effort to 'medium' and compare speed and length"
      ],
      code: `import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    system="You are a patient programming tutor for first-year students. Use simple English.",
    messages=[
        {"role": "user", "content": "Explain recursion in exactly 3 short bullet points with one tiny Python example."}
    ],
    output_config={"effort": "low"},   # low | medium | high | xhigh | max
)

# 1) Always check WHY the model stopped before using the content
if response.stop_reason == "refusal":
    print("Claude declined this request.")
elif response.stop_reason == "max_tokens":
    print("Warning: answer was cut off - increase max_tokens.")

# 2) content is a list of blocks - print only text blocks
for block in response.content:
    if block.type == "text":
        print(block.text)

# 3) Token usage (this is what you pay for)
print("stop_reason:", response.stop_reason)
print("input tokens:", response.usage.input_tokens, "| output tokens:", response.usage.output_tokens)`,
      prompt: {
        system: "You are a patient programming tutor for first-year students. Use simple English.",
        user: "Explain recursion in exactly 3 short bullet points with one tiny Python example."
      },
      result: "- Recursion is when a function calls itself to solve a smaller version of the same problem.\n- Every recursive function needs a base case that stops the calls.\n- Each call waits for the smaller call to finish, then combines the result.\nExample: def fact(n): return 1 if n <= 1 else n * fact(n - 1)\nstop_reason: end_turn\ninput tokens: 4X | output tokens: 9X   (exact numbers vary per run)",
      explanation: "The client reads the key from the environment. messages.create sends model, max_tokens, system and messages. We check stop_reason first (refusal / max_tokens), loop over content blocks to print text, and read usage for cost tracking. No temperature/top_p is sent; effort controls how much work Claude does."
    },
    {
      title: "First Claude API call in JavaScript (Node.js)",
      scenario: "Same task from Node.js using the official @anthropic-ai/sdk package.",
      steps: [
        "In your Node project run: npm install @anthropic-ai/sdk",
        "Add \"type\": \"module\" to package.json so you can use import",
        "Save the code as first_call.mjs (or index.js with type module)",
        "Run: node first_call.mjs",
        "Compare the output and usage with the Python version"
      ],
      code: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 1024,
  system: "You are a patient programming tutor for first-year students. Use simple English.",
  messages: [
    { role: "user", content: "Explain recursion in exactly 3 short bullet points with one tiny JavaScript example." },
  ],
  output_config: { effort: "low" },
});

if (response.stop_reason === "refusal") {
  console.log("Claude declined this request.");
} else if (response.stop_reason === "max_tokens") {
  console.log("Warning: answer was cut off - increase max_tokens.");
}

for (const block of response.content) {
  if (block.type === "text") console.log(block.text);
}

console.log("stop_reason:", response.stop_reason);
console.log("input tokens:", response.usage.input_tokens, "| output tokens:", response.usage.output_tokens);`,
      result: "Three bullets about recursion with a small JavaScript factorial example, followed by\nstop_reason: end_turn\ninput tokens: ... | output tokens: ...",
      explanation: "The JavaScript SDK mirrors the Python one: new Anthropic() reads the env var, client.messages.create takes the same fields (snake_case like max_tokens), and the response has the same content/stop_reason/usage shape. Top-level await works in ES modules."
    },
    {
      title: "Handle errors, count tokens and list models (Python)",
      scenario: "Make your script robust: count input tokens before sending, catch typed errors, and see which models your key can use.",
      steps: [
        "Save as robust_call.py",
        "Run once normally",
        "Temporarily set a wrong key (export ANTHROPIC_API_KEY=bad) and run again to see the AuthenticationError branch",
        "Restore the correct key",
        "Change the model to an invalid ID to see the error branch for a bad request / not found"
      ],
      code: `import anthropic

client = anthropic.Anthropic()
MODEL = "claude-opus-5-5"
messages = [{"role": "user", "content": "Give 3 tips to write clean Python code."}]

# 1) Which models can this key use?
for m in client.models.list():
    print("model:", m.id)

# 2) Count input tokens BEFORE paying for a call
count = client.messages.count_tokens(model=MODEL, messages=messages)
print("input tokens (estimated by API):", count.input_tokens)

# 3) Call with typed error handling - most specific first
try:
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=messages,
        output_config={"effort": "low"},
    )
    if response.stop_reason == "refusal":
        print("Refused:", response.stop_details)
    else:
        print("".join(b.text for b in response.content if b.type == "text"))
        print("usage:", response.usage.input_tokens, "in /", response.usage.output_tokens, "out")
except anthropic.AuthenticationError:
    print("401: check ANTHROPIC_API_KEY")
except anthropic.BadRequestError as e:
    print("400: invalid request ->", e.message)
except anthropic.NotFoundError as e:
    print("404: model or resource not found ->", e.message)
except anthropic.RateLimitError:
    print("429: rate limited - wait and retry later")
except anthropic.APIStatusError as e:
    print("API error", e.status_code, e.message)
except anthropic.APIConnectionError:
    print("Network problem - check your internet connection")`,
      result: "model: claude-opus-5-5\nmodel: claude-sonnet-5-5\n... (other models your key can access)\ninput tokens (estimated by API): 1X\n1. Use meaningful names...\n2. Keep functions small...\n3. Follow PEP 8...\nusage: 1X in / 1XX out\n\nWith a bad key: 401: check ANTHROPIC_API_KEY",
      explanation: "count_tokens lets you estimate cost before calling. Typed exceptions (AuthenticationError, BadRequestError, NotFoundError, RateLimitError, APIStatusError, APIConnectionError) let you react correctly: fix config for 400/401/404, back off for 429, retry for 5xx/network. The SDK already retries some transient errors automatically (2 retries by default)."
    },
    {
      title: "Estimate token cost before you build (runnable, no API key needed)",
      scenario: "Your manager asks: 'What would 10,000 review summaries a day cost?' Estimate with the ~4 characters per token rule and placeholder prices, then confirm with real usage numbers later.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide) or run python3 locally",
        "Paste the code and Run",
        "Replace the placeholder prices with the current ones from the official pricing page for your chosen model",
        "Later, replace the estimates with response.usage values from real calls"
      ],
      code: "Rough estimate: tokens ≈ characters / 4; cost = in_tokens × in_price/1M + out_tokens × out_price/1M",
      python: {
        files: {
          "main.py": `# Rough token + cost estimator (rule of thumb: ~4 characters per English token)
prompt = "Summarise this customer review in one line: The delivery was late by two days but the product quality is excellent and support was helpful."
est_in = round(len(prompt) / 4)
est_out = 40
# Prices are per 1 million tokens and change often
price_in, price_out = 3.00, 15.00   # PLACEHOLDER rates - check the official pricing page
cost = est_in / 1_000_000 * price_in + est_out / 1_000_000 * price_out
print("Characters:", len(prompt))
print("Estimated input tokens:", est_in)
print("Estimated output tokens:", est_out)
print(f"Cost per call: \${cost:.6f}")
print(f"Cost for 10,000 calls/day: \${cost*10000:.2f}")
`
        },
        stdin: ""
      },
      result: "Characters: 139\nEstimated input tokens: 35\nEstimated output tokens: 40\nCost per call: $0.000705\nCost for 10,000 calls/day: $7.05",
      explanation: "Output tokens usually cost more than input tokens, so limiting reply length (max_tokens and 'answer in one line') matters. The 4-characters rule is only an estimate – a system prompt adds tokens to every call, and real tokenizers differ, so verify with count_tokens or response.usage."
    }
  ],
  tools: [
    { name: "Claude Console", use: "Create API keys, add credits, set spend limits, view usage and logs, try prompts in the Workbench. How to use: 1) Sign in at platform.claude.com. 2) Settings -> API keys -> Create key. 3) Set limits under billing/limits. 4) Check Usage after testing.", url: "https://platform.claude.com" },
    { name: "Anthropic Python SDK (anthropic)", use: "Official Python client for the Claude API. How to use: 1) pip install anthropic. 2) export ANTHROPIC_API_KEY. 3) client = anthropic.Anthropic(). 4) client.messages.create(model=..., max_tokens=..., messages=[...]).", url: "https://github.com/anthropics/anthropic-sdk-python" },
    { name: "Anthropic TypeScript/JavaScript SDK (@anthropic-ai/sdk)", use: "Official Node.js/TypeScript client. How to use: 1) npm install @anthropic-ai/sdk. 2) Set ANTHROPIC_API_KEY. 3) const client = new Anthropic(). 4) await client.messages.create({...}).", url: "https://github.com/anthropics/anthropic-sdk-typescript" },
    { name: "Claude API documentation", use: "Reference for Messages API, models, pricing, errors and features. How to use: search the docs for the parameter or error you see; check the models and pricing pages before choosing a model.", url: "https://platform.claude.com/docs" },
    { name: "AI Concepts Lab (in-app)", use: "Tokenizer & cost estimator to see how text becomes tokens and what it costs. How to use: open /tools/ai-concepts, paste your prompt, read token count and estimated cost.", url: "/tools/ai-concepts" },
    { name: "AI Prompt Lab (in-app)", use: "Build a system + user prompt and 'Run with Claude' using your own key before writing code. How to use: open /tools/ai-lab, fill the builder, click Run.", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What are the required parameters of a Claude Messages API request?", a: "model (e.g. claude-opus-5-5), max_tokens (maximum output tokens) and messages (a list of {role, content} starting with a user message). system is optional and sets the role/instructions.", level: "Easy" },
    { q: "How should an API key be stored and used?", a: "In an environment variable (ANTHROPIC_API_KEY) or a secret manager, read by the SDK at runtime. Never hard-code it, commit it to Git, or expose it in browser code. Rotate/revoke keys if leaked and use separate keys per environment.", level: "Easy" },
    { q: "What is a token and how does it affect cost?", a: "A token is a unit of text (a word piece). Billing is per input token and per output token at model-specific rates per million tokens; output tokens usually cost more. Longer prompts, history and answers cost more.", level: "Easy" },
    { q: "What does stop_reason tell you and why check it first?", a: "Why generation stopped: end_turn (finished), max_tokens (cut off), stop_sequence, tool_use (wants a tool), pause_turn, or refusal (declined). Checking it prevents using truncated or empty answers and lets you handle refusals and tool calls correctly.", level: "Medium" },
    { q: "Why shouldn't you assume response.content[0].text exists?", a: "content is a list of typed blocks; the first block might be a thinking or tool_use block, or there may be no text if the model refused. Iterate and filter by block.type == 'text'.", level: "Medium" },
    { q: "How do you control creativity or depth on current Claude models if temperature isn't supported?", a: "Use output_config.effort (low to max) to control how much work and reasoning the model does, use adaptive thinking, and steer style and variety through the prompt (instructions and examples). Temperature/top_p/top_k are not sent to current Claude models.", level: "Medium" },
    { q: "How do you handle a 429 error?", a: "It means you exceeded a rate limit. Back off and retry later (exponential backoff, respect retry-after), reduce concurrency or tokens per request, queue work, or request higher limits. The SDK retries some errors automatically.", level: "Medium" },
    { q: "How would you choose between claude-opus-5-5, claude-sonnet-5-5 and claude-haiku-5-5?", a: "Start with the most capable model to establish quality, then measure whether cheaper/faster models (Sonnet, Haiku) or lower effort meet the bar for each task. Use Haiku for high-volume simple tasks, Sonnet for fast capable everyday work, Opus for complex reasoning and coding.", level: "Hard" },
    { q: "Why must browser apps not call the Claude API directly with your key?", a: "Anything in browser JavaScript is visible to users, so they could steal the key and spend your money. The browser should call your backend, which authenticates the user, applies limits and calls the API with the server-side key.", level: "Medium" },
    { q: "What is the difference between the claude.ai chat app and the Claude API?", a: "claude.ai is a ready-made chat product for people. The API is a programmatic interface for developers to build their own apps, billed per token, where you control system prompts, model, effort, tools and integration into products.", level: "Easy" }
  ],
  practice: [
    { task: "Make your first Python call that asks Claude for 5 interview questions on SQL joins, printing text and token usage.", hint: "Reuse the first_call.py pattern; change system and user content.", solution: "client.messages.create(model='claude-opus-5-5', max_tokens=1024, system='You are an SQL interviewer.', messages=[{'role':'user','content':'Give 5 interview questions on SQL joins, numbered.'}]); check stop_reason; print text blocks and response.usage." },
    { task: "Write the same call in JavaScript and print the response id and stop_reason.", hint: "response.id and response.stop_reason exist on the result.", solution: "const r = await client.messages.create({...}); console.log(r.id, r.stop_reason); then loop over r.content printing text blocks." },
    { task: "Experiment with effort: run the same reasoning question with effort 'low' and 'high' and compare output_tokens and quality.", hint: "Use a multi-step maths word problem.", solution: "Run twice changing output_config={'effort': ...}. Record usage.output_tokens and whether the answer is correct. Usually higher effort uses more tokens and is more careful on hard problems." },
    { task: "Trigger and handle errors on purpose: wrong key, wrong model ID, max_tokens=5.", hint: "max_tokens=5 should give stop_reason 'max_tokens', not an exception.", solution: "Bad key -> AuthenticationError branch; wrong model -> NotFoundError/BadRequestError branch; max_tokens=5 -> normal response with stop_reason 'max_tokens' and a cut-off answer." },
    { task: "Using the cost estimator, compare the daily cost of 10,000 calls with a 200-character prompt vs a 2,000-character prompt (same 40-token reply).", hint: "Change the prompt length; keep placeholder prices.", solution: "Input tokens rise ~10x (≈50 -> ≈500), so input cost rises ~10x while output cost stays the same; long system prompts repeated on every call add up quickly (prompt caching can help later)." }
  ],
  quiz: [
    { question: "Where should your Claude API key be stored?", options: ["In the source code", "In the ANTHROPIC_API_KEY environment variable or a secret manager", "In browser localStorage", "In a public GitHub README"], answer: 1, explanation: "The SDK reads ANTHROPIC_API_KEY; keys must never be in code or the browser." },
    { question: "Which parameter is NOT used with current Claude models?", options: ["max_tokens", "messages", "temperature", "system"], answer: 2, explanation: "temperature/top_p/top_k are rejected; use output_config.effort and prompting instead." },
    { question: "stop_reason is 'max_tokens'. What happened?", options: ["The key is invalid", "The answer was cut off at the output limit", "Claude refused", "Claude wants to call a tool"], answer: 1, explanation: "The reply hit max_tokens; raise the limit or ask for a shorter answer." },
    { question: "How do you safely get the text from a response?", options: ["response.text", "Loop over response.content and use blocks where type == 'text'", "response.content[5]", "response.usage"], answer: 1, explanation: "content is a list of typed blocks; filter text blocks." },
    { question: "Which error class means you are sending requests too fast?", options: ["RateLimitError (429)", "AuthenticationError (401)", "NotFoundError (404)", "BadRequestError (400)"], answer: 0, explanation: "429 rate limit errors mean slow down and retry later." }
  ]
};
