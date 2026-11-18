export default {
  id: "day-33-ai-agents-agentic-workflows-mcp",
  title: "AI Agents and Agentic Workflows: Planning, Tools, Memory and MCP (Model Context Protocol)",
  module: "Module 5: AI for Developers",
  day: 33,
  level: "Advanced",
  duration: "3 hours",
  summary: "Understand what makes an AI system an 'agent': a model that plans, calls tools, observes results, remembers, and loops until a goal is done. Compare workflows (code-controlled steps) with agents (model-controlled steps), run a pure-Python agent loop and an MCP protocol simulation, build a Claude agent loop with the official SDK, and create your own MCP server that Claude Desktop or Claude Code can use.",
  objectives: [
    "Define an AI agent and its parts: goal, model (brain), tools (hands), memory, loop and guardrails",
    "Distinguish single calls, workflows (chaining, routing, parallel) and autonomous agents – and choose the simplest that works",
    "Run and explain a think -> act -> observe agent loop with a step limit",
    "Explain MCP: hosts, clients, servers, tools/resources/prompts, and the JSON-RPC messages behind them",
    "Build an MCP server in Python and connect it to Claude Code / Claude Desktop; design agents with safety controls"
  ],
  theory: [
    {
      heading: "What is an AI agent?",
      content: "A chatbot answers. An agent gets things done. An agent is an LLM placed in a loop where it can decide its own next step: it looks at the goal, plans, calls a tool (search, database, code, email), observes the result, updates its memory, and repeats until the goal is achieved or a limit is hit. Analogy: a chatbot is like asking a friend for directions; an agent is like a travel assistant who checks trains, compares prices, books the ticket, and messages you the PNR – asking your permission before paying.",
      points: [
        "Goal: what to achieve ('find and summarise the 3 cheapest flights')",
        "Brain: the LLM that reasons and chooses actions",
        "Tools: functions/APIs the agent can call (Day 31)",
        "Memory: short-term (conversation + tool results) and long-term (notes, databases, vector stores)",
        "Loop: think -> act -> observe -> repeat (often called ReAct: reason + act)",
        "Guardrails: step limits, budgets, permissions, human approval"
      ]
    },
    {
      heading: "Workflows vs agents – start simple",
      content: "Not every problem needs an agent. A workflow is a fixed path you code: prompt chaining (step 1 output feeds step 2), routing (classify then send to the right prompt), parallelisation (run several prompts at once and combine), or orchestrator-workers (one call splits the work, others do the parts). An agent lets the model decide the path at run time – more flexible but less predictable, slower and costlier. Use the simplest option that meets the need: single call -> workflow -> agent. Choose an agent when the steps can't be known in advance (research, debugging, multi-step support issues), the value justifies the cost, and errors can be caught (tests, reviews, rollbacks).",
      points: [
        "Prompt chaining: outline -> draft -> edit",
        "Routing: classify ticket -> billing prompt / tech prompt",
        "Parallelisation: grade an essay on 3 rubrics at once",
        "Evaluator-optimiser: generate -> critique -> improve loop",
        "Agent: open-ended, tool-using, model-directed loop"
      ],
      tip: "If you can draw the flowchart in advance, build a workflow. If you can't, consider an agent – with limits."
    },
    {
      heading: "Planning, memory and guardrails",
      content: "Planning: ask the agent to write a short plan first (and show it to the user for big tasks). Memory: the message history holds short-term memory; for long tasks store notes/progress in files or a database and reload them, because context windows and budgets are finite. Guardrails: a maximum number of steps, a token/cost budget, allow-lists of tools, read-only by default, confirmation for risky actions (payments, deletions, emails), sandboxing for code execution, logging every action, and stopping on refusal or repeated errors. Treat all tool outputs (web pages, emails, files) as untrusted data that may contain prompt-injection attempts.",
      points: [
        "Max steps + budget stop runaway loops",
        "Human-in-the-loop for irreversible actions",
        "Least-privilege credentials for every tool",
        "Observability: log thoughts/plan summaries, tool calls, results, costs",
        "Evaluate agents on full tasks (success rate, steps, cost), not just single replies"
      ]
    },
    {
      heading: "MCP – the Model Context Protocol",
      content: "Every AI app used to need custom code for every tool (Slack, GitHub, Google Drive, databases...). MCP is an open protocol, introduced by Anthropic and now widely adopted, that standardises how AI applications connect to tools and data – often described as 'USB-C for AI'. An MCP server wraps a system (e.g. your notes, a database, GitHub) and exposes: tools (actions the model can call), resources (data it can read, like files) and prompts (reusable templates). An MCP host (Claude Desktop, Claude Code, IDEs and other AI apps) runs MCP clients that connect to servers locally (stdio) or remotely (HTTP). Under the hood messages are JSON-RPC: initialize, tools/list, tools/call, resources/read, and so on. Write a server once and any MCP-compatible app can use it.",
      points: [
        "Host: the AI application (Claude Desktop, Claude Code, an IDE)",
        "Client: the connector inside the host, one per server",
        "Server: exposes tools, resources and prompts for one system",
        "Transports: stdio (local process) or streamable HTTP (remote)",
        "Official SDKs exist for Python, TypeScript and other languages",
        "Security: only install servers you trust; servers run with the permissions you give them"
      ],
      syntax: "Claude Code:   claude mcp add notes -- python notes_server.py\nClaude Desktop (claude_desktop_config.json):\n{\n  \"mcpServers\": {\n    \"notes\": { \"command\": \"python\", \"args\": [\"/full/path/notes_server.py\"] }\n  }\n}"
    },
    {
      heading: "Ways to build agents with Claude",
      content: "1) Messages API + your own loop: you define tools and write the while stop_reason == 'tool_use' loop (full control – shown in this lesson). 2) The SDK's beta tool runner: you write tool functions and the SDK runs the loop. 3) Claude Managed Agents (beta): Anthropic hosts the agent loop and a sandboxed workspace; you create an agent config and start sessions. 4) Claude Agent SDK: the Claude Code agent harness as a library with built-in file, shell and web tools. The Messages API can also connect directly to remote MCP servers via the MCP connector (beta: mcp_servers plus an mcp_toolset entry in tools). Frameworks like LangGraph, LlamaIndex agents, CrewAI and n8n agent nodes offer other ways to orchestrate.",
      points: [
        "Own loop: maximum control, you host everything",
        "Tool runner: less boilerplate, same hosting",
        "Managed Agents: hosted loop + sandbox, persisted agent configs",
        "Agent SDK: batteries-included coding/file agent you host",
        "MCP: plug in standard tool servers instead of writing custom integrations"
      ]
    }
  ],
  examples: [
    {
      title: "The agent loop in pure Python (runnable, no API key)",
      scenario: "A shopping-support agent must check an order and compute the price of 3 more units with a 10% discount. A rule-based 'fake model' plays the LLM so you can see the think -> act -> observe loop clearly.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or run python3 locally",
        "Paste into main.py and Run",
        "Follow each Step: the model chooses a tool, the code runs it, the result is stored in memory",
        "Change max_steps to 2 and run again – the guardrail stops the agent before it finishes",
        "Change the order id to A999 and see how a tool error appears in the observation"
      ],
      code: "while steps < max_steps: decision = model(goal, memory) -> if final: answer -> else run tool -> memory.append(result)",
      python: {
        files: {
          "main.py": `import json

# ---- Tools (in a real app these call APIs / databases / MCP servers) ----
ORDERS = {"A101": {"item": "Wireless Mouse", "status": "delivered", "price": 799},
          "A102": {"item": "USB-C Cable", "status": "in transit", "price": 299}}
def get_order(order_id):
    o = ORDERS.get(order_id)
    return o if o else {"error": f"order {order_id} not found"}
def calculate(expression):
    allowed = set("0123456789+-*/(). ")
    if not set(expression) <= allowed:
        return {"error": "invalid characters"}
    return {"result": round(eval(expression), 2)}
TOOLS = {"get_order": get_order, "calculate": calculate}

# ---- Fake "model": decides the next step from the goal + memory ----
def fake_model(goal, memory):
    seen = {m["tool"]: m["result"] for m in memory}
    if "get_order" not in seen:
        return {"type": "tool_use", "tool": "get_order", "input": {"order_id": "A102"}}
    if "calculate" not in seen:
        price = seen["get_order"]["price"]
        return {"type": "tool_use", "tool": "calculate", "input": {"expression": f"{price} * 3 * 0.9"}}
    o, c = seen["get_order"], seen["calculate"]
    return {"type": "final", "text": f"Order A102 ({o['item']}) is {o['status']}. 3 more units with 10% off cost Rs {c['result']}."}

def run_agent(goal, max_steps=5):
    memory = []
    print("GOAL:", goal)
    for step in range(1, max_steps + 1):
        decision = fake_model(goal, memory)
        if decision["type"] == "final":
            print(f"Step {step}: FINAL ANSWER -> {decision['text']}")
            return decision["text"]
        name, args = decision["tool"], decision["input"]
        print(f"Step {step}: THINK -> call {name}({json.dumps(args)})")
        result = TOOLS[name](**args)
        print(f"         OBSERVE -> {json.dumps(result)}")
        memory.append({"tool": name, "input": args, "result": result})
    print("Stopped: step limit reached (guardrail)")

run_agent("Check order A102 and tell me the price of 3 more units with 10% discount")
`
        },
        stdin: ""
      },
      result: "GOAL: Check order A102 and tell me the price of 3 more units with 10% discount\nStep 1: THINK -> call get_order({\"order_id\": \"A102\"})\n         OBSERVE -> {\"item\": \"USB-C Cable\", \"status\": \"in transit\", \"price\": 299}\nStep 2: THINK -> call calculate({\"expression\": \"299 * 3 * 0.9\"})\n         OBSERVE -> {\"result\": 807.3}\nStep 3: FINAL ANSWER -> Order A102 (USB-C Cable) is in transit. 3 more units with 10% off cost Rs 807.3.",
      explanation: "This is the core of every agent: the model looks at the goal and memory, picks an action, the program executes it and records the observation, and the loop continues until a final answer. The calculate tool only allows digits and operators before eval – a small example of a tool guardrail. With max_steps = 2 the agent stops after two tool calls and prints the guardrail message instead of an answer. In a real agent, fake_model is replaced by a Claude API call with tools (next example)."
    },
    {
      title: "A real Claude agent loop with memory and limits (Python)",
      scenario: "Same support agent, now powered by Claude: it decides which tools to call and when it is done. Guardrails: max steps, read-only tools, refusal handling.",
      steps: [
        "pip install anthropic and set ANTHROPIC_API_KEY",
        "Save as agent.py and run: python3 agent.py",
        "Watch the printed tool calls – Claude decides the order itself",
        "Try a goal that needs no tools, and one asking to 'cancel the order' (no such tool – it should explain it can't)"
      ],
      code: `import json
import anthropic

client = anthropic.Anthropic()

ORDERS = {"A101": {"item": "Wireless Mouse", "status": "delivered", "price": 799},
          "A102": {"item": "USB-C Cable", "status": "in transit", "price": 299}}

def get_order(order_id):
    return ORDERS.get(order_id, {"error": "order " + order_id + " not found"})

def calculate(expression):
    if not set(expression) <= set("0123456789+-*/(). "):
        return {"error": "only numbers and + - * / ( ) allowed"}
    return {"result": round(eval(expression), 2)}

TOOLS = {"get_order": get_order, "calculate": calculate}
tool_specs = [
    {"name": "get_order", "description": "Read-only lookup of an order's item, status and unit price by order ID.",
     "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}},
                      "required": ["order_id"], "additionalProperties": False}, "strict": True},
    {"name": "calculate", "description": "Evaluate an arithmetic expression. Use for ALL maths.",
     "input_schema": {"type": "object", "properties": {"expression": {"type": "string"}},
                      "required": ["expression"], "additionalProperties": False}, "strict": True},
]

SYSTEM = ("You are a shopping support agent. Plan briefly, use tools to get facts, and use the calculate tool "
          "for any arithmetic. You cannot cancel, refund or modify orders - say so if asked. Be concise.")

def run_agent(goal, max_steps=6):
    messages = [{"role": "user", "content": goal}]          # short-term memory
    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model="claude-opus-5-5", max_tokens=4096, system=SYSTEM,
            tools=tool_specs, tool_choice={"type": "auto"}, messages=messages,
            output_config={"effort": "medium"},
        )
        if response.stop_reason == "refusal":
            return "Agent stopped: request declined."
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            return "".join(b.text for b in response.content if b.type == "text")

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = TOOLS[block.name](**block.input) if block.name in TOOLS else {"error": "unknown tool"}
                print(f"step {step}: {block.name}({json.dumps(block.input)}) -> {json.dumps(output)}")
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": json.dumps(output), "is_error": "error" in output})
        messages.append({"role": "user", "content": results})
    return "Agent stopped: step limit reached."

print(run_agent("Check order A102 and tell me the price of 3 more units with a 10% discount."))`,
      result: "step 1: get_order({\"order_id\": \"A102\"}) -> {\"item\": \"USB-C Cable\", \"status\": \"in transit\", \"price\": 299}\nstep 2: calculate({\"expression\": \"299 * 3 * 0.9\"}) -> {\"result\": 807.3}\nYour order A102 (USB-C Cable) is in transit. Three more cables with a 10% discount would cost Rs 807.30.",
      explanation: "The structure is identical to the simulation, but Claude makes the decisions. Memory is the growing messages list. Guardrails: max_steps, read-only tools, an expression whitelist, unknown-tool handling, refusal handling, and a system prompt that states what the agent cannot do. (Claude may sometimes call both tools in fewer steps or in a different order – that's the flexibility of an agent.)"
    },
    {
      title: "What MCP messages look like (runnable simulation)",
      scenario: "See the JSON-RPC conversation between an MCP client (inside Claude Desktop/Claude Code) and an MCP server, simulated in one Python file.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or run python3 locally",
        "Paste into main.py and Run",
        "Match each request to its purpose: initialize (handshake), tools/list (discover), tools/call (use)",
        "Add a 'delete_note' tool to SERVER_TOOLS and handle it – notice the client discovers it automatically via tools/list"
      ],
      code: "client -> initialize -> tools/list -> tools/call(add_note) -> tools/call(list_notes); server replies with JSON-RPC results",
      python: {
        files: {
          "main.py": `import json

# A tiny in-process "MCP server": it advertises tools and executes them on request.
NOTES = []
SERVER_TOOLS = {
    "add_note": {"description": "Save a short note", "inputSchema": {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]}},
    "list_notes": {"description": "List all saved notes", "inputSchema": {"type": "object", "properties": {}}},
}
def server_handle(request):
    method, params = request["method"], request.get("params", {})
    if method == "initialize":
        result = {"serverInfo": {"name": "notes-server", "version": "1.0"}, "capabilities": {"tools": {}}}
    elif method == "tools/list":
        result = {"tools": [{"name": n, **spec} for n, spec in SERVER_TOOLS.items()]}
    elif method == "tools/call":
        name, args = params["name"], params.get("arguments", {})
        if name == "add_note":
            NOTES.append(args["text"])
            text = f"Saved note #{len(NOTES)}"
        else:
            text = "; ".join(NOTES) or "No notes"
        result = {"content": [{"type": "text", "text": text}]}
    else:
        return {"jsonrpc": "2.0", "id": request["id"], "error": {"code": -32601, "message": "Method not found"}}
    return {"jsonrpc": "2.0", "id": request["id"], "result": result}

# The "MCP client" (inside an AI app like Claude Desktop / Claude Code) talks JSON-RPC to the server.
requests = [
    {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"clientInfo": {"name": "demo-client"}}},
    {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
    {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "add_note", "arguments": {"text": "Submit DBMS assignment Friday"}}},
    {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "list_notes", "arguments": {}}},
]
for req in requests:
    resp = server_handle(req)
    print("->", req["method"])
    print("<-", json.dumps(resp["result"])[:110])
`
        },
        stdin: ""
      },
      result: "-> initialize\n<- {\"serverInfo\": {\"name\": \"notes-server\", \"version\": \"1.0\"}, \"capabilities\": {\"tools\": {}}}\n-> tools/list\n<- {\"tools\": [{\"name\": \"add_note\", \"description\": \"Save a short note\", \"inputSchema\": {\"type\": \"object\", \"propert\n-> tools/call\n<- {\"content\": [{\"type\": \"text\", \"text\": \"Saved note #1\"}]}\n-> tools/call\n<- {\"content\": [{\"type\": \"text\", \"text\": \"Submit DBMS assignment Friday\"}]}",
      explanation: "This is a simplified version of the real protocol (the real one also negotiates protocol versions and capabilities, and runs over stdio or HTTP). The key idea: the host discovers tools at run time with tools/list, then the model's tool calls are forwarded as tools/call. (The tools/list line is cut at 110 characters by the print statement.)"
    },
    {
      title: "Build a real MCP server in Python and use it from Claude Code / Claude Desktop",
      scenario: "Expose your study notes as MCP tools so Claude can add and search notes for you.",
      steps: [
        "pip install mcp (the official MCP Python SDK)",
        "Save the code as notes_server.py",
        "Claude Code: run  claude mcp add notes -- python /full/path/notes_server.py  then start claude and type /mcp to check it's connected",
        "Claude Desktop: Settings -> Developer -> Edit Config, add the server under mcpServers (see Theory), restart the app",
        "Ask: 'Add a note: revise normalization before Friday' then 'Search my notes for Friday' – approve the tool calls when asked"
      ],
      code: `# notes_server.py - a minimal MCP server using the official Python SDK
import json
from pathlib import Path
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("study-notes")
DB = Path(__file__).with_name("notes.json")

def _load():
    return json.loads(DB.read_text()) if DB.exists() else []

@mcp.tool()
def add_note(text: str) -> str:
    """Save a short study note."""
    notes = _load()
    notes.append(text)
    DB.write_text(json.dumps(notes, indent=2))
    return "Saved note #" + str(len(notes))

@mcp.tool()
def search_notes(keyword: str) -> list[str]:
    """Return notes containing the keyword (case-insensitive)."""
    return [n for n in _load() if keyword.lower() in n.lower()]

@mcp.resource("notes://all")
def all_notes() -> str:
    """All notes as a readable list."""
    return "\\n".join("- " + n for n in _load()) or "No notes yet"

if __name__ == "__main__":
    mcp.run()          # stdio transport: the host starts this process and talks over stdin/stdout`,
      result: "In Claude Code, /mcp lists 'notes' as connected with tools add_note and search_notes.\nYou: Add a note: revise normalization before Friday\nClaude: (calls add_note after your approval) Saved note #1.\nYou: Search my notes for Friday\nClaude: (calls search_notes) You have one note: 'revise normalization before Friday'.",
      explanation: "FastMCP turns type-hinted Python functions into MCP tools (the docstring becomes the description, type hints become the input schema). Any MCP host can now use your notes – no host-specific code. The host asks permission before running tools, which is an important safety control."
    }
  ],
  tools: [
    { name: "Model Context Protocol (MCP)", use: "Open standard for connecting AI apps to tools and data. How to use: 1) Read the docs/spec. 2) Pick an SDK (Python/TypeScript). 3) Write a server exposing tools/resources. 4) Register it in a host (Claude Code, Claude Desktop). 5) Test with the MCP Inspector.", url: "https://modelcontextprotocol.io" },
    { name: "MCP Python SDK (mcp)", use: "Build MCP servers/clients in Python with FastMCP decorators. How to use: pip install mcp; create FastMCP('name'); decorate functions with @mcp.tool(); mcp.run().", url: "https://github.com/modelcontextprotocol/python-sdk" },
    { name: "Claude Code", use: "MCP host and agentic coding tool. How to use: claude mcp add <name> -- <command>; start 'claude'; type /mcp to see servers; approve tool calls.", url: "https://www.anthropic.com/claude-code" },
    { name: "Claude Desktop", use: "Desktop app that can load local MCP servers. How to use: Settings -> Developer -> Edit Config; add mcpServers entry; restart; look for the tools indicator in chat.", url: "https://claude.ai/download" },
    { name: "Anthropic Python SDK", use: "Build your own agent loop with tools on the Messages API. How to use: define tools, loop while stop_reason == 'tool_use', return tool_result blocks, add step limits.", url: "https://github.com/anthropics/anthropic-sdk-python" },
    { name: "Claude Agent SDK / Managed Agents", use: "Higher-level options: Agent SDK gives the Claude Code harness as a library; Managed Agents (beta) hosts the loop and sandbox for you. How to use: follow the official docs quickstart for each.", url: "https://platform.claude.com/docs" },
    { name: "n8n AI Agent node / LangGraph", use: "Alternative agent orchestration (no-code n8n agent node; code-first LangGraph graphs). How to use: add an AI Agent node with a chat model and tools in n8n, or define nodes/edges in LangGraph.", url: "https://n8n.io" },
    { name: "Python IDE (in-app)", use: "Run the agent-loop and MCP simulations. How to use: open /tools/python-ide, paste, Run.", url: "/tools/python-ide" }
  ],
  interview: [
    { q: "What is an AI agent and how does it differ from a chatbot?", a: "An agent is an LLM-driven system that pursues a goal by planning, calling tools, observing results and iterating in a loop with memory, often taking actions in external systems. A chatbot mainly produces conversational replies without autonomously taking multi-step actions.", level: "Easy" },
    { q: "Explain the ReAct pattern.", a: "Reason + Act: the model alternates between reasoning about what to do next, taking an action (tool call), and observing the result, repeating until it can answer. It grounds reasoning in real observations.", level: "Medium" },
    { q: "When should you use a workflow instead of an agent?", a: "When the steps are known in advance and can be coded as a fixed sequence/branches. Workflows are cheaper, faster, more predictable and easier to test. Use agents for open-ended tasks where the path can't be predetermined and errors are recoverable.", level: "Medium" },
    { q: "What is MCP and what problem does it solve?", a: "The Model Context Protocol is an open standard for connecting AI applications to tools, data and prompts through servers. It replaces one-off integrations with a common interface: write a server once and any MCP-compatible host can use it.", level: "Easy" },
    { q: "Explain MCP's host, client and server roles.", a: "The host is the AI application (e.g. Claude Desktop, Claude Code, an IDE). It creates a client per server connection. Servers expose tools (actions), resources (readable data) and prompts (templates) for a particular system, communicating over JSON-RPC via stdio or HTTP.", level: "Medium" },
    { q: "What types of memory do agents use?", a: "Short-term memory in the context window (messages, tool results), and long-term memory stored externally (files, databases, vector stores, a memory tool) that can be written and retrieved across sessions; plus summaries/compaction to keep context manageable.", level: "Medium" },
    { q: "What guardrails would you add to a production agent?", a: "Step and budget limits, least-privilege tools and credentials, allow-lists, human approval for irreversible actions, sandboxed code execution, input/output validation, prompt-injection defences (treat tool output as data), logging/tracing, and automatic stop on repeated errors or refusals.", level: "Hard" },
    { q: "How do you evaluate an agent?", a: "Run it end-to-end on a set of realistic tasks and measure task success rate, number of steps, cost, latency, safety violations and recovery from tool errors; inspect traces of failures and add regression tests.", level: "Hard" },
    { q: "What is prompt injection in agents and why is it more dangerous than in chatbots?", a: "Malicious instructions hidden in content the agent reads (web pages, emails, files) try to hijack its behaviour. Because agents can take actions (send emails, change data), a successful injection can cause real harm, so outputs from tools must be treated as untrusted and sensitive actions gated.", level: "Hard" },
    { q: "What are the options for building agents with Claude?", a: "Your own Messages API loop with tools; the SDK's beta tool runner; Claude Managed Agents (hosted loop and sandbox); the Claude Agent SDK (Claude Code harness as a library); and MCP servers to plug in tools, including the API's MCP connector for remote servers.", level: "Medium" }
  ],
  practice: [
    { task: "Modify the pure-Python agent so the fake model first checks if the order status is 'delivered' and, if so, answers without calculating.", hint: "Inspect seen['get_order']['status'] before deciding to call calculate.", solution: "After get_order: if seen['get_order'].get('status') == 'delivered': return {'type': 'final', 'text': 'Order already delivered.'}. Run with order A101 to test." },
    { task: "Add a third tool 'check_stock(item)' to the real Claude agent and ask whether 3 more cables are in stock and their discounted price.", hint: "Add to TOOLS and tool_specs with a clear description.", solution: "def check_stock(item): return {'item': item, 'in_stock': 12}. Spec: read-only stock lookup by item name. Claude should call get_order, check_stock and calculate, then answer." },
    { task: "Extend the MCP simulation with a 'delete_note' tool and an error when the index is invalid.", hint: "Return a JSON-RPC error object or a text result marking isError.", solution: "Add 'delete_note' with inputSchema {index: integer}. In tools/call: if 0 <= idx < len(NOTES): NOTES.pop(idx); text='Deleted' else return {'content': [{'type':'text','text':'Invalid index'}], 'isError': True}." },
    { task: "Build and register the notes MCP server in Claude Code (or Claude Desktop) and use it in a real conversation.", hint: "Use an absolute path in the config/command.", solution: "pip install mcp; claude mcp add notes -- python /abs/path/notes_server.py; run claude; /mcp to verify; ask it to add and search notes; check notes.json was updated." },
    { task: "Design an agent for 'plan my exam revision week'. List tools, memory, guardrails and which actions need approval.", hint: "Think calendar, notes search, task creation.", solution: "Tools: read_calendar (read), search_notes (read), create_study_block (write, needs approval). Memory: progress file of topics done. Guardrails: max 15 steps, no deleting events, show plan before creating blocks." }
  ],
  quiz: [
    { question: "Which loop best describes an agent?", options: ["Input -> output once", "Think -> act (tool) -> observe -> repeat", "Train -> deploy -> forget", "Upload -> download"], answer: 1, explanation: "Agents iterate reasoning, actions and observations until done." },
    { question: "If you can draw the full flowchart of steps in advance, you should usually build...", options: ["An autonomous agent", "A workflow", "A new model", "Nothing"], answer: 1, explanation: "Known steps -> a predictable, cheaper workflow." },
    { question: "In MCP, which component exposes tools and resources for a system like GitHub?", options: ["Host", "Server", "Tokenizer", "Embedding"], answer: 1, explanation: "MCP servers expose tools, resources and prompts." },
    { question: "Which MCP request lets a client discover available tools?", options: ["tools/list", "tools/delete", "initialize/tools", "resources/write"], answer: 0, explanation: "tools/list returns the server's tools and schemas." },
    { question: "Which is an essential agent guardrail?", options: ["Unlimited steps", "Auto-approve payments", "A maximum step/budget limit", "Hiding all logs"], answer: 2, explanation: "Step and budget limits stop runaway loops and cost." }
  ]
};
