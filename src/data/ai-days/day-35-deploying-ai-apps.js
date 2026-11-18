export default {
  id: "day-35-deploying-ai-apps",
  title: "Deploying AI Apps: Streamlit, Gradio and Web Apps, Environment Variables, Cost Control and Privacy",
  module: "Module 5: AI for Developers",
  day: 35,
  level: "Advanced",
  duration: "3 hours",
  summary: "Take your Claude-powered app from your laptop to a public URL. Build a streaming chat UI with Streamlit and with Gradio, a secure web backend that keeps the API key on the server, store secrets as environment variables on hosting platforms, add rate limits and budgets, handle refusals and errors, and follow privacy and launch checklists. Includes a runnable cost-guard simulation.",
  objectives: [
    "Build and run a Claude chatbot UI with Streamlit and with Gradio",
    "Explain why API keys must stay on the server and design a backend proxy for browser apps",
    "Deploy to Streamlit Community Cloud / Hugging Face Spaces / a web host using secrets and environment variables",
    "Control cost with per-user rate limits, token budgets, model/effort choice, max_tokens and caching",
    "Apply privacy, security and reliability practices: data minimisation, logging, retries, refusal fallbacks and a launch checklist"
  ],
  theory: [
    {
      heading: "Deployment options at a glance",
      content: "You have three common paths. 1) Python UI frameworks: Streamlit and Gradio turn a Python script into a web app with chat components in a few lines – perfect for demos, internal tools and portfolios. Deploy free on Streamlit Community Cloud or Hugging Face Spaces. 2) Full web app: a frontend (React/HTML) plus your own backend (Node/Express, Python FastAPI/Flask/Django) that calls the Claude API; host on Render, Railway, Vercel (serverless functions), Azure, AWS or Google Cloud. 3) No-code: the in-app AI App Builder exports a standalone HTML app – good for prototypes, but any app used by the public must call the API through a backend you control so your key isn't exposed.",
      points: [
        "Streamlit: st.chat_input, st.chat_message, st.write_stream – fastest Python chat UI",
        "Gradio: gr.ChatInterface – one function becomes a chat app; popular on Hugging Face Spaces",
        "Web backend: full control over auth, rate limits, logging and UI",
        "Pick by audience: demo/portfolio -> Streamlit/Gradio; real product -> backend + frontend"
      ]
    },
    {
      heading: "Secrets and environment variables",
      content: "Your code reads ANTHROPIC_API_KEY from the environment; each platform has a place to set it securely. Streamlit Community Cloud: App settings -> Secrets (root-level TOML keys are also exposed as environment variables). Hugging Face Spaces: Settings -> Variables and secrets -> New secret. Render/Railway/Vercel: Environment Variables in the project settings. Locally use a .env file that is in .gitignore. Never commit keys, never print them in logs, use a separate key per app/environment, set spend limits in the Claude Console, and rotate keys if exposed.",
      syntax: "# .streamlit/secrets.toml (LOCAL only – add to .gitignore)\nANTHROPIC_API_KEY = \"sk-ant-...\"\n\n# .gitignore\n.env\n.streamlit/secrets.toml",
      points: [
        "Browser JavaScript can be read by anyone – keys must never be in frontend code",
        "Backend proxy: browser -> your server (auth + limits) -> Claude API",
        "Different keys for dev/staging/production make leaks easier to contain"
      ]
    },
    {
      heading: "Cost control",
      content: "AI apps cost money per token, and a public URL can be hit by anyone (or a bot). Protect yourself in layers: require login or a simple access code for demos; per-user rate limits (e.g. 10 requests/minute) and daily token budgets; cap max_tokens and input length; trim chat history; choose the model and effort per task (claude-haiku-5-5 or low effort for simple classification, claude-opus-5-5 for hard reasoning); use prompt caching for long, unchanging system prompts or documents; use the Batch API for non-urgent bulk jobs; and set spend limits/alerts in the Console. Monitor usage daily after launch.",
      points: [
        "Rate limit + budget per user/IP",
        "Short outputs: max_tokens + 'answer in under 100 words'",
        "Right-size model and effort",
        "Cache stable prefixes; batch offline jobs",
        "Console spend limits as the final safety net"
      ]
    },
    {
      heading: "Reliability: errors, retries, timeouts and refusals",
      content: "Production apps must expect failures. The SDKs automatically retry some transient errors (connection errors, 429, 5xx) a couple of times; you should still catch typed errors and show a friendly message. Use streaming for long answers to avoid timeouts. Always check stop_reason: show a polite message for 'refusal', and offer 'continue' for 'max_tokens'. For refusals on current models you can also opt into server-side fallbacks, where the API automatically re-runs a declined request on a fallback model. Add health checks, structured logs and alerts.",
      syntax: "# Optional: server-side refusal fallback (beta) on the Claude API\nresponse = client.beta.messages.create(\n    model=\"claude-opus-5-5\",\n    max_tokens=1024,\n    betas=[\"server-side-fallback-2026-07-01\"],\n    fallbacks=\"default\",\n    messages=[{\"role\": \"user\", \"content\": question}],\n)\nif response.stop_reason == \"refusal\":\n    answer = \"Sorry, I can't help with that request.\"",
      points: [
        "Catch RateLimitError, APIConnectionError, APIStatusError separately",
        "Timeouts: stream long responses; set reasonable client timeouts",
        "Graceful degradation: friendly error text, retry button, human contact",
        "Health endpoint and uptime monitoring"
      ]
    },
    {
      heading: "Privacy, security and launch checklist",
      content: "Users may type personal or confidential information. Collect only what you need (data minimisation), tell users what happens to their data (a short privacy note), avoid logging full conversations unless necessary and mask personal data, set log retention, and check your organisation's policies and API data-usage terms. Protect against abuse: authentication, input length limits, prompt-injection-aware design (tools gated, context treated as data), and output checks. Add a visible disclaimer that answers are AI-generated and may contain mistakes, and a way to report problems.",
      points: [
        "Before launch: evals pass (Day 34), keys in secrets, rate limits on, spend limit set",
        "Privacy note + AI disclaimer visible in the UI",
        "Logs: no keys, masked personal data, retention set",
        "Feedback button and monitoring dashboard ready",
        "Rollback plan: keep the previous prompt/version deployable"
      ],
      tip: "Put your deployed app link and a short write-up (problem, architecture, prompt, evals, cost controls) in your portfolio – recruiters love working demos."
    }
  ],
  examples: [
    {
      title: "Streaming chat app with Streamlit",
      scenario: "Build a 'Study Buddy' chat UI in ~40 lines of Python and deploy it free on Streamlit Community Cloud.",
      steps: [
        "pip install streamlit anthropic",
        "Save the code as app.py; set ANTHROPIC_API_KEY in your terminal (or .streamlit/secrets.toml locally)",
        "Run locally: streamlit run app.py – your browser opens at localhost:8501",
        "Push app.py and requirements.txt (streamlit, anthropic) to a GitHub repo – NOT your secrets file",
        "On share.streamlit.io: Create app -> pick repo/branch/app.py -> Advanced settings -> Secrets: ANTHROPIC_API_KEY = \"sk-ant-...\" -> Deploy",
        "Open the public URL and test; check usage in the Claude Console"
      ],
      code: `import anthropic
import streamlit as st

st.set_page_config(page_title="Study Buddy", page_icon="📘")
st.title("📘 Study Buddy")
st.caption("AI-generated answers may contain mistakes. Don't share personal data.")

client = anthropic.Anthropic()     # reads ANTHROPIC_API_KEY (env var / Streamlit secret)
SYSTEM = "You are Study Buddy, a friendly tutor for college students. Explain simply, max 150 words."
MAX_INPUT_CHARS = 1500

if "display" not in st.session_state:
    st.session_state.display = []      # what the UI shows (text only)
    st.session_state.api_messages = [] # what we send to the API (full content blocks)

for m in st.session_state.display:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

if prompt := st.chat_input("Ask a study question..."):
    if len(prompt) > MAX_INPUT_CHARS:
        st.warning("Please keep questions under 1500 characters.")
        st.stop()
    st.session_state.display.append({"role": "user", "content": prompt})
    st.session_state.api_messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        try:
            with client.messages.stream(
                model="claude-opus-5-5",
                max_tokens=1024,
                system=SYSTEM,
                messages=st.session_state.api_messages[-20:],
                output_config={"effort": "low"},
            ) as stream:
                reply = st.write_stream(stream.text_stream)
                final = stream.get_final_message()
            if final.stop_reason == "refusal":
                reply = "Sorry, I can't help with that."
                st.markdown(reply)
                st.session_state.api_messages.pop()
            else:
                st.session_state.api_messages.append({"role": "assistant", "content": final.content})
            st.session_state.display.append({"role": "assistant", "content": reply})
        except anthropic.RateLimitError:
            st.session_state.api_messages.pop()
            st.error("Too many requests right now - please try again in a minute.")
        except anthropic.APIError:
            st.session_state.api_messages.pop()
            st.error("The AI service had a problem. Please try again.")`,
      result: "A web page titled 'Study Buddy' with a chat box. Questions appear as user bubbles; answers stream into assistant bubbles word by word. After deployment you get a public URL like https://<your-app>.streamlit.app.",
      explanation: "st.session_state keeps history across Streamlit reruns; we keep a text list for display and a full-content list for the API. st.write_stream renders the streaming text and returns it. The key never appears in code – locally it's an env var/secrets file, in the cloud it's an app secret. Input length checks and the 20-message window control cost."
    },
    {
      title: "Chat app with Gradio and deployment to Hugging Face Spaces",
      scenario: "Make the same bot with Gradio's ChatInterface and publish it as a Hugging Face Space.",
      steps: [
        "pip install gradio anthropic",
        "Save as app.py and run: python app.py – open the local URL shown",
        "On huggingface.co: New Space -> SDK: Gradio -> create",
        "Upload app.py and requirements.txt (gradio, anthropic) via the web UI or git",
        "Space Settings -> Variables and secrets -> New secret: ANTHROPIC_API_KEY",
        "The Space rebuilds and shows your app; set the Space to private if it's only for testing"
      ],
      code: `import anthropic
import gradio as gr

client = anthropic.Anthropic()   # ANTHROPIC_API_KEY comes from the Space secret
SYSTEM = "You are Interview Coach for Python fresher roles. Ask one question at a time and give short feedback."

def respond(message, history):
    # history arrives as a list of {"role": ..., "content": ...} dicts (type="messages")
    messages = [{"role": h["role"], "content": h["content"]} for h in history[-20:]
                if isinstance(h.get("content"), str)]
    messages.append({"role": "user", "content": message[:1500]})
    partial = ""
    try:
        with client.messages.stream(
            model="claude-opus-5-5", max_tokens=1024, system=SYSTEM,
            messages=messages, output_config={"effort": "low"},
        ) as stream:
            for text in stream.text_stream:
                partial += text
                yield partial                     # Gradio updates the bubble as text grows
            final = stream.get_final_message()
        if final.stop_reason == "refusal":
            yield "Sorry, I can't help with that."
    except anthropic.APIError:
        yield "The AI service is busy. Please try again."

demo = gr.ChatInterface(respond, type="messages", title="Interview Coach",
                        description="AI-generated feedback - may contain mistakes.")

if __name__ == "__main__":
    demo.launch()`,
      result: "A Gradio chat page titled 'Interview Coach'. On Hugging Face it's available at https://huggingface.co/spaces/<user>/<space-name>.",
      explanation: "gr.ChatInterface calls respond(message, history) for each user message; yielding growing strings creates a streaming effect. The key lives in the Space's secrets, which are exposed to the app as environment variables. History is rebuilt from Gradio's text messages, trimmed to control cost."
    },
    {
      title: "Secure web backend proxy with rate limiting (Node.js + Express)",
      scenario: "Your React/HTML frontend needs AI answers. The browser must never see the key, so it calls your Express server, which applies limits and calls Claude.",
      steps: [
        "npm install express @anthropic-ai/sdk",
        "Save as server.mjs; set ANTHROPIC_API_KEY on the server (or in Render/Railway environment variables)",
        "Run: node server.mjs",
        "From the frontend: fetch('/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question})})",
        "Deploy to Render/Railway: connect the repo, set start command 'node server.mjs', add ANTHROPIC_API_KEY under Environment",
        "Test the limit by sending 6 quick requests – the 6th returns 429"
      ],
      code: `import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(express.json({ limit: "20kb" }));
const client = new Anthropic();                 // key from server environment only

const WINDOW_MS = 60_000, MAX_PER_WINDOW = 5;
const hits = new Map();                         // ip -> timestamps (use Redis in production)

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

app.post("/api/chat", async (req, res) => {
  const question = String(req.body?.question || "").slice(0, 1500);
  if (!question) return res.status(400).json({ error: "question required" });
  if (rateLimited(req.ip)) return res.status(429).json({ error: "Too many requests - wait a minute." });

  try {
    const msg = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 800,
      system: "You are a helpful assistant for a college website. Be concise.",
      messages: [{ role: "user", content: question }],
      output_config: { effort: "low" },
    });
    if (msg.stop_reason === "refusal") return res.json({ answer: "Sorry, I can't help with that." });
    const answer = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    console.log(JSON.stringify({ id: msg.id, in: msg.usage.input_tokens, out: msg.usage.output_tokens }));
    res.json({ answer });
  } catch (err) {
    const status = err instanceof Anthropic.RateLimitError ? 503 : 500;
    res.status(status).json({ error: "AI service unavailable, please retry." });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.listen(process.env.PORT || 3000, () => console.log("Server running"));`,
      result: "POST /api/chat {\"question\": \"What is DBMS?\"} -> {\"answer\": \"A DBMS is software that stores, organises and lets you query data...\"}\n6th request within a minute -> 429 {\"error\": \"Too many requests - wait a minute.\"}",
      explanation: "The browser only knows /api/chat. The server limits body size and question length, rate-limits per IP, calls Claude with a capped max_tokens, checks stop_reason, logs usage (not the key or full text) and hides internal errors. In production you'd add user authentication and a shared store like Redis for rate limits across server instances."
    },
    {
      title: "Per-user rate limit + daily token budget (runnable simulation)",
      scenario: "Before launch, test the cost-guard logic you'll put in front of the API – no API key needed.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or run python3 locally",
        "Paste into main.py and Run",
        "Explain each BLOCK: riya hit 3 requests/minute; aman's second request would exceed the 2000-token daily budget",
        "Change daily_token_budget to 5000 and re-run to see aman allowed"
      ],
      code: "allow(user, est_tokens, now): requests in last 60 s >= max_rpm -> 429; used + est_tokens > budget -> block; else record and allow",
      python: {
        files: {
          "main.py": `class CostGuard:
    """Per-user rate limit + daily token budget, like you'd add before calling an AI API."""
    def __init__(self, max_requests_per_min=3, daily_token_budget=2000):
        self.max_rpm = max_requests_per_min
        self.budget = daily_token_budget
        self.calls = {}      # user -> list of timestamps
        self.used = 0

    def allow(self, user, est_tokens, now):
        recent = [t for t in self.calls.get(user, []) if now - t < 60]
        if len(recent) >= self.max_rpm:
            return False, "429: too many requests, wait a minute"
        if self.used + est_tokens > self.budget:
            return False, "daily budget reached - try tomorrow"
        recent.append(now)
        self.calls[user] = recent
        self.used += est_tokens
        return True, f"ok (tokens used today: {self.used})"

g = CostGuard()
t0 = 1000.0
requests = [("riya", 400, 0), ("riya", 400, 5), ("riya", 400, 10), ("riya", 400, 15),
            ("aman", 600, 20), ("aman", 600, 80)]
for user, tok, dt in requests:
    ok, msg = g.allow(user, tok, t0 + dt)
    print(f"t+{dt:>2}s {user:<5} {tok} tokens -> {'ALLOW' if ok else 'BLOCK'}: {msg}")
`
        },
        stdin: ""
      },
      result: "t+ 0s riya  400 tokens -> ALLOW: ok (tokens used today: 400)\nt+ 5s riya  400 tokens -> ALLOW: ok (tokens used today: 800)\nt+10s riya  400 tokens -> ALLOW: ok (tokens used today: 1200)\nt+15s riya  400 tokens -> BLOCK: 429: too many requests, wait a minute\nt+20s aman  600 tokens -> ALLOW: ok (tokens used today: 1800)\nt+80s aman  600 tokens -> BLOCK: daily budget reached - try tomorrow",
      explanation: "The guard runs BEFORE any API call, so blocked requests cost nothing. Riya's 4th request in 15 seconds exceeds 3 per minute. At t+80s aman's earlier request is outside his 60-second window, so the rate limit passes, but 1800 + 600 > 2000 exceeds the (app-wide) daily budget. Real apps keep these counters in Redis or a database and estimate tokens with count_tokens or the 4-characters rule."
    }
  ],
  tools: [
    { name: "Streamlit + Streamlit Community Cloud", use: "Python chat UIs and free hosting for demos. How to use: 1) pip install streamlit. 2) Build app.py with st.chat_input/st.chat_message/st.write_stream. 3) streamlit run app.py. 4) Push to GitHub. 5) share.streamlit.io -> Create app -> add Secrets -> Deploy.", url: "https://streamlit.io" },
    { name: "Gradio + Hugging Face Spaces", use: "One-function chat apps and free hosting. How to use: 1) pip install gradio. 2) gr.ChatInterface(fn, type='messages'). 3) Create a Gradio Space. 4) Upload app.py + requirements.txt. 5) Add ANTHROPIC_API_KEY as a secret.", url: "https://www.gradio.app" },
    { name: "Render / Railway", use: "Host Node/Python backends with environment variables. How to use: 1) Connect GitHub repo. 2) Set build/start commands. 3) Add ANTHROPIC_API_KEY under Environment. 4) Deploy and check logs and /health.", url: "https://render.com" },
    { name: "Vercel", use: "Host frontends and serverless API routes that call Claude server-side. How to use: 1) Import repo. 2) Put API calls in server routes/functions. 3) Add ANTHROPIC_API_KEY in Project Settings -> Environment Variables. 4) Deploy.", url: "https://vercel.com" },
    { name: "Claude Console", use: "Spend limits, usage monitoring, separate keys per app. How to use: create one key per app/environment, set limits, review usage daily after launch.", url: "https://platform.claude.com" },
    { name: "AI App Builder (in-app)", use: "No-code prototype: template, system prompt, knowledge base, test, export HTML + project report. How to use: open /tools/ai-app-builder, build, test, export; for public use, route API calls through a backend.", url: "/tools/ai-app-builder" },
    { name: "Python IDE (in-app)", use: "Run the cost-guard simulation. How to use: open /tools/python-ide, paste, Run.", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "Why must an AI API key never be placed in frontend code?", a: "Frontend code is delivered to and readable by every user; anyone could extract the key and run up charges or abuse your account. Calls must go through a backend that holds the key in environment variables/secrets and enforces authentication and limits.", level: "Easy" },
    { q: "How do you deploy a Streamlit Claude app securely?", a: "Keep the key out of the repo, add it as a secret in Streamlit Community Cloud (exposed as st.secrets/env var), include requirements.txt, add input length checks and rate limiting/access control, set Console spend limits, and monitor usage.", level: "Easy" },
    { q: "What techniques control the cost of a public AI app?", a: "Authentication or access codes, per-user rate limits and token budgets, input and output length caps, history trimming, appropriate model/effort selection, prompt caching for stable prefixes, Batch API for offline work, and spend limits/alerts.", level: "Medium" },
    { q: "How should a production app handle API errors?", a: "Catch typed errors: back off on 429 and overload errors, retry transient network/5xx errors (the SDK retries some automatically), surface friendly messages, log error types with request ids, and alert on spikes. Check stop_reason for refusals and truncation.", level: "Medium" },
    { q: "What is a backend proxy pattern for AI apps?", a: "The browser sends requests to your server endpoint; the server authenticates the user, validates input, applies rate limits and budgets, calls the AI API with its secret key, post-processes/validates the output, logs usage, and returns the answer.", level: "Medium" },
    { q: "What privacy practices apply when deploying an AI chatbot?", a: "Data minimisation, clear privacy notice and AI disclaimer, masking personal data in logs, limited retention, access controls, compliance with company policy and data-protection law, and reviewing provider data-usage terms.", level: "Medium" },
    { q: "Why use streaming in deployed chat apps?", a: "Better perceived speed (text appears immediately) and fewer timeout problems for long answers; the final message still provides usage and stop_reason for logging.", level: "Easy" },
    { q: "How would you rate-limit across multiple server instances?", a: "Store counters in a shared fast store like Redis (e.g. sliding-window or token-bucket per user/IP) or use an API gateway/edge rate limiter, rather than in-memory maps that are per-instance.", level: "Hard" },
    { q: "What would you include in an AI app launch checklist?", a: "Passing eval suite, secrets configured, rate limits and budgets, spend limits, error handling, refusal handling, privacy note and disclaimer, logging/monitoring dashboards and alerts, feedback mechanism, and a rollback plan.", level: "Medium" },
    { q: "Streamlit vs Gradio vs custom web app – when to use which?", a: "Streamlit for quick data/AI dashboards and chat demos in Python; Gradio for model demos and Hugging Face Spaces with minimal code; a custom backend + frontend when you need authentication, custom UX, scalability, integrations and fine-grained control.", level: "Hard" }
  ],
  practice: [
    { task: "Run the Streamlit Study Buddy locally and add a sidebar 'Clear chat' button.", hint: "Use st.sidebar.button and reset both session lists.", solution: "if st.sidebar.button('Clear chat'): st.session_state.display = []; st.session_state.api_messages = []; st.rerun()" },
    { task: "Deploy either the Streamlit or Gradio app publicly using platform secrets, and share the link with a friend for testing.", hint: "requirements.txt must list anthropic and streamlit/gradio.", solution: "Push code (no secrets) to GitHub -> create app on Streamlit Cloud or a Gradio Space -> add ANTHROPIC_API_KEY secret -> deploy -> test -> check usage in the Console." },
    { task: "Add a simple access code to the Streamlit app so only your class can use it.", hint: "Store ACCESS_CODE as a secret; ask for it with st.text_input(type='password').", solution: "code = st.text_input('Access code', type='password'); if code != st.secrets['ACCESS_CODE']: st.stop(). Add ACCESS_CODE to the app's Secrets." },
    { task: "Modify CostGuard so the daily budget is per user instead of app-wide, and re-run the simulation.", hint: "Use a dict self.used = {} keyed by user.", solution: "self.used = {}; check self.used.get(user, 0) + est_tokens > self.budget; then self.used[user] = self.used.get(user, 0) + est_tokens. Now aman's second request (600+600=1200) is allowed." },
    { task: "Write a 10-point launch checklist for your final project app.", hint: "Cover evals, secrets, cost, errors, privacy, monitoring, rollback.", solution: "1) Evals >= target. 2) Key in secrets only. 3) .gitignore covers secrets. 4) Rate limit + budget. 5) Console spend limit. 6) Errors + refusal handled. 7) Privacy note + disclaimer. 8) Logs without personal data. 9) Feedback + dashboard. 10) Previous version ready for rollback." }
  ],
  quiz: [
    { question: "Where should the API key live for a Streamlit Community Cloud app?", options: ["In app.py", "In the app's Secrets settings", "In the README", "In the browser"], answer: 1, explanation: "Platform secrets are exposed to the app at runtime without committing the key." },
    { question: "A React app needs Claude answers. What is the safe architecture?", options: ["Call the Claude API from the browser with the key", "Browser -> your backend (key in env vars) -> Claude API", "Email the key to users", "Hard-code the key and minify JS"], answer: 1, explanation: "Only the backend holds the key and enforces limits." },
    { question: "Which measure does NOT reduce AI cost?", options: ["Capping max_tokens", "Per-user rate limits", "Sending the full chat history forever", "Choosing a cheaper model/effort for simple tasks"], answer: 2, explanation: "Untrimmed history grows input tokens every turn." },
    { question: "In Gradio's ChatInterface, how do you show a streaming reply?", options: ["Return once at the end only", "Yield progressively longer strings from the function", "Use print()", "Reload the page"], answer: 1, explanation: "Yielding partial text updates the chat bubble live." },
    { question: "What should the app do when stop_reason is 'refusal'?", options: ["Crash", "Show a polite message instead of treating it as a normal answer", "Retry forever", "Log the API key"], answer: 1, explanation: "Handle refusals gracefully (optionally with server-side fallbacks)." }
  ]
};
