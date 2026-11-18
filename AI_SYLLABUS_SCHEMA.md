# Artificial Intelligence (45 days) – topic file spec

Folder: `src/data/ai-days/day-NN-<slug>.js` (NN = 01..45). Plain ES module with a default export; NO imports; valid JS.
Put code/prompts in template literals (escape backticks as \` and `${` as \${).

```js
export default {
  id, title, module, day, level, duration, summary, objectives: [3-5],
  theory: [ { heading, content, syntax?, points?, tip? } ],   // 4-7 sections, simple English for students/freshers, real-world analogies, explain EVERY sub-topic
  examples: [                                                 // 3-6 SOLVED, practical examples
    {
      title, scenario,
      steps: ['Open claude.ai (or ChatGPT / Gemini)', 'Paste the prompt below', '...'],   // REQUIRED, exact clicks / steps
      code: `...`,                     // the prompt, code or workflow shown to the student
      prompt: { system: '...', user: '...' },   // OPTIONAL: for prompt-engineering / AI-tool examples – opens in the in-app "AI Prompt Lab" (students run it with their own API key or copy it into any chatbot)
      python: { files: { 'main.py': `...` }, stdin: '' },   // OPTIONAL: runnable in the in-app Python IDE (Pyodide: standard library + numpy, pandas, scikit-learn are available)
      playground: { html, css, js },    // OPTIONAL: runnable browser demo (same rules as WEB_SYLLABUS_SCHEMA.md)
      result: 'What the student should see / a realistic sample output',
      explanation: '...',
    },
  ],
  tools: [ { name, use, url } ],       // OPTIONAL: AI tools used in this lesson (name, what it is used for here, official URL)
  interview: [ { q, a, level: 'Easy'|'Medium'|'Hard' } ],    // 8-12 real AI interview questions (30+ on Day 45)
  practice: [ { task, hint, solution } ],                     // 4-6 hands-on tasks (prompts to write, tools to try, code to run)
  quiz: [ { question, options: [4], answer: 0-3, explanation } ],   // EXACTLY 5; vary the correct position
};
```

## Facts to keep current and correct (as of late 2026)
- Anthropic Claude models (API IDs): `claude-opus-5-5` (default, most capable Opus), `claude-sonnet-5-5` (fast + capable), `claude-haiku-5-5` (cheapest/fastest), `claude-fable-5-2` (most capable, premium). Never append date suffixes.
- Claude API (JavaScript `@anthropic-ai/sdk`, Python `anthropic`): `client.messages.create({ model, max_tokens, system, messages })`. Do NOT use `temperature`, `top_p` or `top_k` in Claude code (rejected by current API); do NOT use assistant-message prefill (rejected); use `thinking: {type: "adaptive"}` (or omit) and `output_config: { effort: "low"|"medium"|"high"|"xhigh"|"max" }`; structured outputs via `output_config: { format: {...} }` / `client.messages.parse()`; tools via `tools: [...]` with `tool_choice: {type: "auto"}` (forced tool choice is rejected on current models). Credentials from the ANTHROPIC_API_KEY env var – never hard-code keys. Check `stop_reason` (incl. `"refusal"`) before reading content.
- When teaching temperature/top-p conceptually, explain it as a sampling idea that some providers expose; note that current Claude models control behaviour with `effort` instead.
- Other providers/tools can be taught by name (OpenAI ChatGPT/GPT models, Google Gemini, Meta Llama, Mistral, Microsoft Copilot, GitHub Copilot, Cursor, Claude Code, Perplexity, NotebookLM, Midjourney, DALL·E, Adobe Firefly, Canva AI, Gamma, ElevenLabs, Runway, Synthesia, Descript, Otter.ai, Zapier, Make, n8n, Power Automate, Hugging Face, LangChain, LlamaIndex, vector DBs like Pinecone/Chroma/pgvector). Avoid exact prices (they change) – say "free tier available / paid plans".
- Never present invented statistics as facts; keep claims general where uncertain.

## Verification
- `python` examples: standard-library-only programs MUST be run with python3 on this machine and the real output pasted. numpy, pandas and scikit-learn are NOT installed locally (they do work in the browser IDE): for those examples use tiny datasets, fixed `random_state`, print simple rounded values and trace the output very carefully; where possible also show a pure-Python version that you actually run.
- Validation (run after writing; fix failures):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.day&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```
Keep scratch files in your own uniquely named scratchpad subfolder.

## In-app practice tools students will use (mention them in steps/practice where relevant)
- **AI Prompt Lab** (/tools/ai-lab): prompt builder (role, context, task, format, constraints, examples), prompt quality checker, template library, and "Run with Claude" using the student's own API key; or copy the prompt into any chatbot.
- **AI Concepts Lab** (/tools/ai-concepts): tokenizer & cost estimator, next-word probability / sampling simulator, embeddings & semantic-search (mini RAG) demo.
- **ML Playground** (/tools/ml-playground): click to add points; run KNN, logistic regression, k-means and linear regression visually.
- **AI App Builder** (/tools/ai-app-builder): the final project tool – choose a template, write the system prompt, add a knowledge base (mini RAG), test the chatbot, and export a standalone HTML app plus a project report.
- **Python IDE** (/tools/python-ide): numpy, pandas, scikit-learn in the browser.
- **AI Tools Directory** (/tools/ai-tools): what each AI tool is, where and how to use it.

## Syllabus – 45 days (module names exactly)
Module 1: AI Foundations (Day 1–6)
1 What is Artificial Intelligence? History, Types (Narrow / General / Super AI), AI vs ML vs Deep Learning vs Generative AI
2 How AI Works: Data, Features, Models, Training vs Inference, Parameters
3 Machine Learning Basics: Supervised, Unsupervised, Reinforcement Learning with real examples
4 Neural Networks and Deep Learning (intuitive): neurons, layers, weights, activation, backpropagation in plain words
5 NLP and Computer Vision Basics: text classification, sentiment, NER, image classification, object detection, OCR
6 Responsible AI: Bias, Fairness, Privacy, Hallucinations, Deepfakes, Copyright, AI Safety
Module 2: Generative AI & Large Language Models (Day 7–12)
7 Introduction to Generative AI: text, image, audio, video, code generation; how it changed work
8 Large Language Models: tokens, context window, next-token prediction, temperature/top-p concept, hallucinations
9 Transformers and Attention explained simply; pre-training, fine-tuning, RLHF
10 Major AI Models & Providers: Claude (Anthropic), GPT (OpenAI), Gemini (Google), Llama (Meta), Mistral; open vs closed models; choosing a model
11 Multimodal AI: vision, image generation, speech-to-text, text-to-speech, video
12 Embeddings, Vector Databases and Semantic Search
Module 3: Prompt Engineering (Day 13–19)
13 Prompt Engineering Basics: anatomy of a good prompt (role, context, task, format, constraints)
14 Zero-shot, Few-shot and Example-driven Prompting
15 Step-by-step Reasoning, Breaking Down Problems, Self-Check prompts
16 Structured Output: JSON, tables, bullet formats, templates
17 Prompt Patterns: persona, template, critique-and-refine, iterative refinement, prompt chaining
18 Prompting for Coding, Data Analysis and Learning
19 Evaluating Prompts, Prompt Injection, Jailbreak Risks and Safe Use
Module 4: AI Tools for Productivity (Day 20–27)
20 AI Chat Assistants: Claude, ChatGPT, Gemini, Microsoft Copilot – features, when to use which, projects/custom GPTs/Gems
21 AI for Writing & Communication: emails, resumes, cover letters, reports, social posts, translation
22 AI for Research & Learning: Perplexity, NotebookLM, deep research features, citations, fact-checking
23 AI for Data Analysis: Copilot in Excel, Copilot in Power BI, data analysis in ChatGPT/Claude, AI in Google Sheets
24 AI for Presentations & Design: Gamma, Canva AI, Microsoft Designer, Figma AI, image generators (Midjourney, DALL·E, Firefly)
25 AI for Audio & Video: ElevenLabs, Runway, Synthesia, Descript, CapCut AI; ethics of voice/face cloning
26 AI for Meetings, Notes & Productivity: Otter.ai, Fireflies, Copilot in Teams/Outlook, Notion AI
27 No-code AI Automation: Zapier, Make, n8n, Power Automate with AI steps
Module 5: AI for Developers (Day 28–35)
28 AI Coding Assistants: GitHub Copilot, Cursor, Claude Code, Windsurf – setup and best practices
29 Using AI APIs: first call to the Claude API (Python & JavaScript), API keys, tokens, cost, models, errors
30 System Prompts, Multi-turn Chat, Streaming and Building a Chatbot
31 Tool Use / Function Calling and Structured Outputs
32 RAG (Retrieval-Augmented Generation): chunking, embeddings, vector store, retrieval, grounding answers
33 AI Agents and Agentic Workflows: planning, tools, memory, MCP (Model Context Protocol) introduction
34 Evaluating, Testing and Monitoring AI Apps: test sets, rubrics, guardrails
35 Deploying AI Apps: Streamlit / Gradio / web apps, environment variables, cost control, privacy
Module 6: Machine Learning Hands-on (Day 36–41)
36 Python for AI: NumPy, Pandas and data preparation
37 Regression with scikit-learn (linear regression, train/test split, MAE/RMSE)
38 Classification (logistic regression, decision tree, KNN) and confusion matrix, precision, recall, F1
39 Clustering (k-means) and Dimensionality Reduction (PCA) concepts
40 Model Evaluation, Overfitting/Underfitting, Cross-validation, Feature Engineering
41 Pre-trained Models with Hugging Face: pipelines, transformers, using models without training
Module 7: Careers & Final Project (Day 42–45)
42 AI in Industries and AI Job Roles (AI engineer, ML engineer, data scientist, prompt engineer, AI product roles); building an AI portfolio
43 Responsible AI at Work: company policies, data privacy, copyright, disclosure, human review
44 Final Project Part 1: choose an AI project (Study Buddy, Resume Reviewer, Support Bot, Interview Coach…), plan it, design prompts and knowledge base, build it in the in-app AI App Builder step by step
45 Final Project Part 2: test, evaluate, improve, export the app and project report, present it; practical assessment + 30+ AI interview Q&A
