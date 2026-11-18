export default {
  id: "day-30-system-prompts-chat-streaming-chatbot",
  title: "System Prompts, Multi-turn Chat, Streaming and Building a Chatbot",
  module: "Module 5: AI for Developers",
  day: 30,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Build a real chatbot with the Claude API. Design a strong system prompt, keep conversation history because the API is stateless, stream responses word-by-word for a fast user experience, manage context length and cost, and wire it all into a command-line chatbot in Python and JavaScript.",
  objectives: [
    "Write a production-style system prompt with role, scope, tone, format and refusal rules",
    "Implement multi-turn conversations by storing and resending message history",
    "Stream responses with the Python and JavaScript SDKs and get the final message",
    "Manage context growth: trimming, summarising, and cost awareness",
    "Build and test a complete CLI chatbot with error handling and stop_reason checks"
  ],
  theory: [
    {
      heading: "The system prompt – your chatbot's job description",
      content: "The system prompt is the instruction set that applies to the whole conversation. Think of it as the job description and rulebook you hand to a new employee before their first customer arrives. A good one states: who the bot is, who it serves, what it should and should not help with, tone, output format, and what to do when it doesn't know. Users can't see it, but it shapes every answer. Keep stable rules in the system prompt and put the changing user question in messages.",
      syntax: "You are 'CampusBot', the help assistant for XYZ College students.\nScope: admissions, fees, timetable, library, hostel. For anything else, politely say you can only help with college topics.\nTone: friendly, simple English, short paragraphs.\nFormat: answer in max 5 sentences; use bullet points for steps.\nIf you are not sure or the information isn't provided, say so and suggest contacting the office at help@xyz.edu – never invent fees, dates or rules.",
      points: [
        "Role and audience: who the bot is and who it is talking to",
        "Scope: allowed topics and what to do with out-of-scope requests",
        "Style and format: tone, length, bullets, language",
        "Honesty rule: admit uncertainty instead of guessing",
        "Safety: don't reveal internal instructions; don't collect sensitive data unnecessarily"
      ]
    },
    {
      heading: "Multi-turn chat: the API has no memory",
      content: "The Messages API is stateless: each request is independent. Claude 'remembers' earlier turns only because you send the whole conversation every time as a list of messages that alternate user and assistant. Your app stores this history (in memory, a database or session). After each reply, append the assistant's content to history, then append the next user message, and send the full list again. It's like a new support agent reading the whole ticket thread before replying each time.",
      syntax: "messages = [\n  {\"role\": \"user\", \"content\": \"Hi, my name is Riya\"},\n  {\"role\": \"assistant\", \"content\": \"Nice to meet you, Riya!\"},\n  {\"role\": \"user\", \"content\": \"What is my name?\"}\n]",
      points: [
        "The first message must be from the user",
        "Append the assistant reply's full content (all blocks), not just the text, so features like thinking work correctly across turns",
        "Every turn resends history, so input tokens (and cost) grow as the chat gets longer",
        "Don't 'prefill' a final assistant message to force the start of a reply – current models reject it"
      ]
    },
    {
      heading: "Streaming – show the answer as it is written",
      content: "Without streaming, the user stares at a spinner until the whole answer is ready. With streaming, text appears piece by piece as Claude generates it (like ChatGPT/Claude.ai typing), which feels much faster. Technically the API sends server-sent events (SSE); the SDKs give you easy helpers. Python: client.messages.stream(...) as a context manager, iterate stream.text_stream, then call stream.get_final_message() to get the complete message with usage and stop_reason. JavaScript: client.messages.stream({...}), listen with .on('text', ...), then await stream.finalMessage(). Streaming is also recommended for long outputs because it avoids request timeouts.",
      points: [
        "Python: with client.messages.stream(...) as stream: for text in stream.text_stream: print(text, end='', flush=True)",
        "Python: final = stream.get_final_message() -> final.content, final.stop_reason, final.usage",
        "JavaScript: const stream = client.messages.stream({...}); stream.on('text', t => process.stdout.write(t)); const final = await stream.finalMessage();",
        "In web apps, forward chunks from your backend to the browser using SSE or WebSockets"
      ]
    },
    {
      heading: "Managing context length and cost",
      content: "Long chats send more and more tokens each turn. Models have large context windows, but cost and latency still grow. Strategies: keep only the last N turns (sliding window); summarise older turns into a short 'conversation summary' you keep in the system prompt or first message; store long reference material separately and fetch only what's relevant (RAG, Day 32); cap max_tokens and ask for concise answers; and cache a large, unchanging system prompt (prompt caching) to reduce repeated cost. When trimming, keep the list starting with a user message and keep user/assistant pairs together.",
      points: [
        "Sliding window: history[-N:] – simple, but forgets older facts",
        "Summarisation: replace old turns with a summary – keeps key facts cheaply",
        "RAG for knowledge, not a giant system prompt",
        "Track response.usage per turn and set per-user limits (Day 35)"
      ],
      tip: "Store important user facts (name, course, preferences) separately and inject them into the system prompt, so trimming history doesn't lose them."
    },
    {
      heading: "Chatbot architecture and quality checklist",
      content: "A chatbot is a loop: read user input -> append to history -> call the API (streaming) -> display the reply -> append the reply to history -> repeat. Around this loop add: input validation (length limits), error handling (retry on network/overload, friendly messages), stop_reason checks (refusal, max_tokens), logging (ids, token usage – without storing sensitive data unnecessarily), and a way to reset the conversation. Test with normal questions, out-of-scope questions, attempts to override the system prompt ('ignore your instructions'), and very long inputs.",
      points: [
        "Loop: input -> history -> API -> stream -> history",
        "Handle stop_reason: refusal -> show a polite message; max_tokens -> offer 'continue'",
        "Commands like /reset and /exit improve usability",
        "Test scope, honesty, prompt-injection resistance and long inputs"
      ]
    }
  ],
  examples: [
    {
      title: "Design and test a system prompt for a college help bot",
      scenario: "You are building CampusBot. Before writing code, test the system prompt with an in-scope and an out-of-scope question.",
      steps: [
        "Open the in-app AI Prompt Lab (/tools/ai-lab) or claude.ai",
        "Paste the system prompt below into the System box (in claude.ai, put it at the top of your message or in a Project's instructions)",
        "Ask the user question below and check the answer follows scope, tone and the honesty rule",
        "Then ask 'Write my history essay' and confirm it politely declines",
        "Then ask 'What is the hostel fee?' and confirm it does NOT invent a number"
      ],
      code: "SYSTEM:\nYou are CampusBot, the help assistant for XYZ College students.\nScope: admissions, fees, timetable, library, hostel. For other topics, politely say you only help with college topics.\nTone: friendly, simple English. Format: max 5 sentences, bullets for steps.\nKnown facts: Library hours 8 AM–8 PM Mon–Sat. Fee payment portal: fees.xyz.edu.\nIf information is not in Known facts, say you don't have it and suggest help@xyz.edu. Never invent fees, dates or rules.\n\nUSER:\nHow do I pay my fees and when is the library open?",
      prompt: {
        system: "You are CampusBot, the help assistant for XYZ College students. Scope: admissions, fees, timetable, library, hostel. For other topics, politely say you only help with college topics. Tone: friendly, simple English. Format: max 5 sentences, bullets for steps. Known facts: Library hours 8 AM–8 PM Mon–Sat. Fee payment portal: fees.xyz.edu. If information is not in Known facts, say you don't have it and suggest help@xyz.edu. Never invent fees, dates or rules.",
        user: "How do I pay my fees and when is the library open?"
      },
      result: "- Pay fees online at fees.xyz.edu.\n- The library is open 8 AM–8 PM, Monday to Saturday.\nFor any fee amount questions, please email help@xyz.edu.",
      explanation: "The prompt gives role, scope, tone, format, known facts and an explicit 'don't invent' rule. Testing in-scope, out-of-scope and unknown questions before coding saves time later."
    },
    {
      title: "Streaming multi-turn chatbot in Python (CLI)",
      scenario: "Build a terminal chatbot that remembers the conversation and streams replies.",
      steps: [
        "pip install anthropic and set ANTHROPIC_API_KEY",
        "Save the code as chatbot.py",
        "Run: python3 chatbot.py",
        "Type 'Hi, my name is Riya', then 'What is my name?' – it should remember",
        "Type /reset to clear history and /exit to quit"
      ],
      code: `import anthropic

client = anthropic.Anthropic()          # uses ANTHROPIC_API_KEY
MODEL = "claude-opus-5-5"
SYSTEM = ("You are StudyBot, a friendly study helper for college students. "
          "Answer in simple English, max 6 sentences unless asked for more. "
          "If you are unsure, say so.")
MAX_MESSAGES = 20                       # sliding window to control cost
history = []

print("StudyBot ready. Commands: /reset, /exit")
while True:
    user_text = input("\\nYou: ").strip()
    if not user_text:
        continue
    if user_text == "/exit":
        break
    if user_text == "/reset":
        history.clear()
        print("(conversation cleared)")
        continue

    history.append({"role": "user", "content": user_text})
    window = history[-MAX_MESSAGES:]
    if window[0]["role"] != "user":     # window must start with a user turn
        window = window[1:]

    try:
        print("Bot: ", end="", flush=True)
        with client.messages.stream(
            model=MODEL,
            max_tokens=2048,
            system=SYSTEM,
            messages=window,
            output_config={"effort": "low"},
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
            final = stream.get_final_message()
        print()

        if final.stop_reason == "refusal":
            print("(Sorry, I can't help with that.)")
            history.pop()               # drop the refused user turn
            continue
        if final.stop_reason == "max_tokens":
            print("(Answer was cut off - ask me to continue.)")

        # store the FULL assistant content (all blocks), not just the text
        history.append({"role": "assistant", "content": final.content})
        print(f"[tokens in/out: {final.usage.input_tokens}/{final.usage.output_tokens}]")
    except anthropic.RateLimitError:
        history.pop()
        print("\\n(Too many requests - please wait a moment and try again.)")
    except anthropic.APIConnectionError:
        history.pop()
        print("\\n(Network problem - check your connection.)")
    except anthropic.APIStatusError as e:
        history.pop()
        print(f"\\n(API error {e.status_code}. Please try again.)")`,
      result: "StudyBot ready. Commands: /reset, /exit\n\nYou: Hi, my name is Riya\nBot: Hi Riya! Nice to meet you. What are you studying today?\n[tokens in/out: 6X/2X]\n\nYou: What is my name?\nBot: Your name is Riya.\n[tokens in/out: 9X/1X]",
      explanation: "History is a list we own; each turn we append the user message, send a window of recent messages, stream text as it arrives, then append final.content. Input tokens grow each turn because history is resent. Errors remove the unanswered user turn so history stays valid (user/assistant alternating)."
    },
    {
      title: "Streaming chatbot in JavaScript (Node.js)",
      scenario: "Same chatbot in Node.js using readline and the SDK's stream helper.",
      steps: [
        "npm install @anthropic-ai/sdk and set ANTHROPIC_API_KEY",
        "Save as chatbot.mjs",
        "Run: node chatbot.mjs",
        "Chat for a few turns and watch the streamed text and token counts"
      ],
      code: `import Anthropic from "@anthropic-ai/sdk";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY
const SYSTEM = "You are StudyBot, a friendly study helper. Simple English, max 6 sentences.";
const history = [];
const rl = readline.createInterface({ input, output });

while (true) {
  const userText = (await rl.question("\\nYou: ")).trim();
  if (userText === "/exit") break;
  if (!userText) continue;

  history.push({ role: "user", content: userText });
  output.write("Bot: ");
  try {
    const stream = client.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 2048,
      system: SYSTEM,
      messages: history,
      output_config: { effort: "low" },
    });
    stream.on("text", (delta) => output.write(delta));
    const final = await stream.finalMessage();
    output.write("\\n");

    if (final.stop_reason === "refusal") {
      console.log("(Sorry, I can't help with that.)");
      history.pop();
      continue;
    }
    history.push({ role: "assistant", content: final.content });
    console.log("[tokens in/out: " + final.usage.input_tokens + "/" + final.usage.output_tokens + "]");
  } catch (err) {
    history.pop();
    if (err instanceof Anthropic.RateLimitError) console.log("\\n(Too many requests - wait and retry.)");
    else if (err instanceof Anthropic.APIError) console.log("\\n(API error " + err.status + ")");
    else throw err;
  }
}
rl.close();`,
      result: "You: Explain an API in one line\nBot: An API is a set of rules that lets one program ask another program for data or actions.\n[tokens in/out: 4X/2X]",
      explanation: "client.messages.stream returns a MessageStream; the 'text' event gives each new piece of text and finalMessage() resolves with the complete message (content, stop_reason, usage). History is appended with the full content array."
    },
    {
      title: "Understand history and streaming without an API key (runnable simulation)",
      scenario: "See exactly why the bot 'remembers' – the app stores and resends history. A fake model stands in for Claude so you can run it anywhere.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or run python3 locally",
        "Paste into main.py and Run",
        "Change MAX_TURNS to 2 and run again – the bot forgets the name because the first message falls out of the window",
        "Relate each part to the real chatbot: history list, window, streaming print"
      ],
      code: "history.append(user) -> reply = model(system, history[-MAX_TURNS:]) -> history.append(assistant) -> print word by word",
      python: {
        files: {
          "main.py": `import sys

SYSTEM = "You are StudyBot. Answer in 2 short sentences."
history = []          # the API is stateless: WE keep the conversation

def fake_claude(system, messages):
    last = messages[-1]["content"].lower()
    if "my name is" in last:
        name = last.split("my name is")[1].strip().split()[0].title()
        return f"Nice to meet you, {name}! What do you want to study today?"
    if "my name" in last:
        for m in messages:
            if m["role"] == "user" and "my name is" in m["content"].lower():
                return "Your name is " + m["content"].lower().split("my name is")[1].strip().split()[0].title() + "."
        return "You have not told me your name yet."
    return "Good question! Let's break it into small steps."

def stream_print(text):
    for word in text.split(" "):          # streaming = show pieces as they arrive
        sys.stdout.write(word + " ")
        sys.stdout.flush()
    print()

MAX_TURNS = 6         # keep only the last 6 messages to control cost
for user_text in ["Hi, my name is Riya", "Explain recursion", "What is my name?"]:
    history.append({"role": "user", "content": user_text})
    reply = fake_claude(SYSTEM, history[-MAX_TURNS:])
    history.append({"role": "assistant", "content": reply})
    print("You :", user_text)
    sys.stdout.write("Bot : ")
    stream_print(reply)
print("Messages stored in history:", len(history))
`
        },
        stdin: ""
      },
      result: "You : Hi, my name is Riya\nBot : Nice to meet you, Riya! What do you want to study today? \nYou : Explain recursion\nBot : Good question! Let's break it into small steps. \nYou : What is my name?\nBot : Your name is Riya. \nMessages stored in history: 6",
      explanation: "The fake model can only 'remember' Riya because the earlier user message is inside the window we pass in. With MAX_TURNS = 2 the window is just the last assistant reply and the new question, so it answers 'You have not told me your name yet.' – exactly what happens with a real API when you trim history too aggressively."
    }
  ],
  tools: [
    { name: "Anthropic Python SDK", use: "messages.create for single replies and messages.stream for streaming chat. How to use: 1) pip install anthropic. 2) Set ANTHROPIC_API_KEY. 3) with client.messages.stream(...) as stream: iterate stream.text_stream. 4) stream.get_final_message() for usage/stop_reason.", url: "https://github.com/anthropics/anthropic-sdk-python" },
    { name: "Anthropic TypeScript SDK", use: "client.messages.stream with 'text' events and finalMessage(). How to use: 1) npm install @anthropic-ai/sdk. 2) const stream = client.messages.stream({...}). 3) stream.on('text', ...). 4) await stream.finalMessage().", url: "https://github.com/anthropics/anthropic-sdk-typescript" },
    { name: "AI Prompt Lab (in-app)", use: "Design and test system prompts before coding. How to use: open /tools/ai-lab, fill role/context/constraints, Run with Claude, test in-scope and out-of-scope questions.", url: "/tools/ai-lab" },
    { name: "AI App Builder (in-app)", use: "Build a chatbot without code: choose a template, write the system prompt, test chat, export HTML. How to use: open /tools/ai-app-builder, pick a template, edit system prompt, test, export.", url: "/tools/ai-app-builder" },
    { name: "Claude Console Workbench", use: "Try system prompts and multi-turn conversations, then get generated code. How to use: sign in at platform.claude.com, open Workbench, set system prompt, add messages, run.", url: "https://platform.claude.com" }
  ],
  interview: [
    { q: "What is a system prompt and how is it different from a user message?", a: "The system prompt sets persistent instructions (role, scope, tone, format, rules) for the whole conversation and is written by the developer. User messages are the per-turn inputs from the end user. The system prompt is passed in the separate 'system' parameter.", level: "Easy" },
    { q: "How does a chatbot remember previous messages if the API is stateless?", a: "The application stores the conversation and resends the full (or trimmed) history in the messages list on every request. The model sees the earlier turns as part of its input each time.", level: "Easy" },
    { q: "Why use streaming in a chatbot?", a: "It shows tokens as they're generated, reducing perceived latency and improving UX, and it avoids HTTP timeouts on long outputs. You still get the final message (usage, stop_reason) at the end.", level: "Easy" },
    { q: "How do you stream with the Python SDK?", a: "Use 'with client.messages.stream(model=..., max_tokens=..., messages=...) as stream:' then 'for text in stream.text_stream: print(text, end=\"\")' and call stream.get_final_message() to get the complete message.", level: "Medium" },
    { q: "Why does the cost of a chat increase with each turn?", a: "Because the whole history is sent as input tokens each time, so input tokens grow with conversation length. Trimming, summarising and caching help control this.", level: "Medium" },
    { q: "What strategies manage long conversation context?", a: "Sliding window of recent turns, summarising older turns, storing key facts separately and injecting them, retrieving relevant knowledge via RAG instead of large prompts, capping output length, and prompt caching for stable prefixes.", level: "Medium" },
    { q: "Why append the full assistant content rather than just its text to history?", a: "The response may contain multiple block types (e.g. thinking or tool_use). Sending them back unchanged keeps the conversation valid and lets features like thinking and tool use continue correctly across turns.", level: "Hard" },
    { q: "How would you stream a Claude response to a browser?", a: "The browser calls your backend endpoint; the backend calls the Claude API with streaming and forwards each text chunk to the browser via Server-Sent Events or WebSockets; the frontend appends chunks to the chat bubble. The API key stays on the server.", level: "Hard" },
    { q: "How do you test a chatbot's system prompt?", a: "Create test cases: typical in-scope questions, out-of-scope requests, unknown-information questions (should admit not knowing), prompt-injection attempts, long inputs, and different languages; check answers against expected behaviour and iterate.", level: "Medium" },
    { q: "What should the bot do when stop_reason is 'refusal' or 'max_tokens'?", a: "For refusal, show a polite message and don't treat the reply as a normal answer. For max_tokens, tell the user the answer was cut off and offer to continue, or raise max_tokens / request a shorter answer.", level: "Medium" }
  ],
  practice: [
    { task: "Write a system prompt for an 'Interview Coach' bot that asks one question at a time and gives feedback after each answer. Test it in the AI Prompt Lab.", hint: "Include role, flow (ask -> wait -> feedback -> next question), tone and length limits.", solution: "'You are an interview coach for freshers applying to Python developer roles. Ask ONE question at a time. After the user answers, give feedback in 3 bullets (strength, gap, better answer) then ask the next question. Keep it encouraging. Stop after 5 questions and give a summary score out of 10.'" },
    { task: "Run the Python CLI chatbot and add a /history command that prints how many messages are stored and the last 2 user questions.", hint: "Filter history for role == 'user'.", solution: "if user_text == '/history': users = [m['content'] for m in history if m['role'] == 'user']; print(len(history), 'messages; last questions:', users[-2:]); continue" },
    { task: "Change the simulation's MAX_TURNS to 2 and explain the output.", hint: "Which messages are inside history[-2:] at the third turn?", solution: "At turn 3 the window is [assistant reply to 'Explain recursion', user 'What is my name?'], so the fake model can't see 'my name is Riya' and replies 'You have not told me your name yet.' Real models forget trimmed facts the same way." },
    { task: "Add a 'summary memory' to the Python chatbot: every 10 messages, ask Claude to summarise the conversation in 5 bullets and replace old history with that summary.", hint: "Make a separate non-streaming messages.create call for the summary; start the new history with a user message containing the summary.", solution: "When len(history) >= 10: call messages.create with the history plus a user request 'Summarise our conversation so far in 5 bullets'; then history = [{'role':'user','content':'Summary of earlier conversation: ' + summary_text}, {'role':'assistant','content':'Thanks, I have the context.'}]. Keep the window starting with a user turn." },
    { task: "Build the same bot without code in the AI App Builder and compare behaviour with your coded version.", hint: "Use the same system prompt.", solution: "Open /tools/ai-app-builder, choose a chatbot template, paste the system prompt, test the same 5 questions, and note differences in tone/format; export the HTML app." }
  ],
  quiz: [
    { question: "Where do you put the chatbot's persistent rules and role?", options: ["In max_tokens", "In the system parameter", "In the API key", "In stop_reason"], answer: 1, explanation: "The system prompt sets persistent instructions." },
    { question: "Why does the bot remember the user's name from earlier turns?", options: ["The API stores chats automatically", "The app resends the conversation history each request", "The model is retrained live", "Cookies"], answer: 1, explanation: "The Messages API is stateless; history must be sent each time." },
    { question: "In Python, which call gives you the complete message after streaming?", options: ["stream.text_stream", "stream.get_final_message()", "client.models.list()", "stream.close()"], answer: 1, explanation: "get_final_message() returns the full message with usage and stop_reason." },
    { question: "What happens to input tokens as a chat grows (without trimming)?", options: ["They decrease", "They stay the same", "They increase every turn", "They become free"], answer: 2, explanation: "The full history is resent, so input grows." },
    { question: "Which is NOT allowed on current Claude models?", options: ["A system prompt", "Streaming", "Prefilling the start of the assistant's reply with a final assistant message", "Multi-turn history"], answer: 2, explanation: "Assistant prefill is rejected; specify format in the prompt or use structured outputs." }
  ]
};
