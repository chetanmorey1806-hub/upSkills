const markovDemo = `# A tiny "generative" model: learn which word follows which, then generate
import random
random.seed(7)

corpus = ("the cat sat on the mat . the dog sat on the rug . "
          "the cat saw the dog . the dog saw the cat .").split()

# 1) LEARN: build a table of next-word options
next_words = {}
for current, nxt in zip(corpus, corpus[1:]):
    next_words.setdefault(current, []).append(nxt)
print("After 'the' we have seen:", next_words["the"])

# 2) GENERATE: start with a word and keep sampling the next one
for attempt in range(3):
    word, sentence = "the", ["the"]
    while word != "." and len(sentence) < 12:
        word = random.choice(next_words[word])
        sentence.append(word)
    print("Generated:", " ".join(sentence))
`;

export default {
  id: "day-07-introduction-to-generative-ai",
  title: "Introduction to Generative AI: text, image, audio, video, code generation; how it changed work",
  module: "Module 2: Generative AI & Large Language Models",
  day: 7,
  level: "Beginner",
  duration: "2 hours",
  summary: "Generative AI creates new content - text, images, audio, video and code - from a simple instruction called a prompt. Learn what makes it 'generative', the main types of generators and the tools behind each, how it is changing everyday work, and its limits. Build a tiny word-generator in pure Python to see the core idea of learning patterns and sampling new content.",
  objectives: [
    "Define Generative AI and contrast it with predictive (discriminative) AI",
    "Describe text, image, audio, video and code generation with example tools",
    "Explain the basic idea: learn patterns from data, then sample new content",
    "Use a chat assistant to generate text and code from prompts",
    "Discuss how GenAI changes jobs and where human skills still matter",
  ],
  theory: [
    {
      heading: "What is Generative AI?",
      content: "Generative AI (GenAI) is AI that creates new content that did not exist before, based on patterns it learned from huge amounts of examples. You give it a prompt (an instruction in plain language) and it generates an output.\n\n Prompt: 'Write a 2-line birthday wish for my teacher'  -->  [GenAI model]  -->  New text\n\nAnalogy: a musician who has listened to thousands of songs can compose a brand-new tune in a familiar style. They are not copy-pasting a song; they learned patterns of melody and rhythm. GenAI does the same with words, pixels, sounds and code.",
      points: [
        "Predictive AI answers 'which one?' or 'how much?' (spam or not, price prediction)",
        "Generative AI answers 'make something' (write, draw, speak, compose, code)",
        "Input is usually a prompt; output can be text, image, audio, video or code",
        "Modern GenAI is built on deep learning - mainly Transformers and diffusion models",
        "It became mainstream after ChatGPT's release in November 2022",
      ],
    },
    {
      heading: "Types of generation and popular tools",
      content: "GenAI is not one tool. Different models specialise in different media, and many modern assistants are multimodal (handle several types).",
      points: [
        "Text: chat assistants and writing tools - Claude, ChatGPT, Gemini, Microsoft Copilot. Uses: emails, summaries, reports, translation, brainstorming",
        "Code: GitHub Copilot, Cursor, Claude Code - write, explain, debug and test code",
        "Images: Midjourney, DALL-E (in ChatGPT), Adobe Firefly, Canva AI, Gemini image features - posters, product mock-ups, illustrations",
        "Audio and voice: ElevenLabs (text-to-speech and voice), music generators, AI dubbing",
        "Video: Runway, Synthesia (AI presenter videos), and other text-to-video models",
        "Presentations and documents: Gamma, Microsoft Copilot in PowerPoint/Word, Canva",
      ],
      tip: "Tool names and features change fast. Learn the categories and the skill of prompting - they will still apply when tools change. The in-app AI Tools Directory (/tools/ai-tools) explains each tool.",
    },
    {
      heading: "How does generation work? (the simple version)",
      content: "All generative models follow two stages:\n1. Learn: study millions of examples and learn the patterns (which word usually follows which, what a 'cat' looks like in pixels).\n2. Generate: start from your prompt and produce new content piece by piece, choosing likely next pieces with a bit of randomness.\n\nFor text, a language model predicts the next token (word piece) again and again - like an extremely advanced phone keyboard auto-complete (Day 8). For images, diffusion models start from random noise and remove noise step by step, guided by your text, until a picture appears - like a sculptor revealing a statue from a block of marble (Day 11).",
      points: [
        "Randomness (sampling) is why the same prompt gives different answers each time",
        "The model does not look up stored answers; it generates fresh output from learned patterns",
        "Because it generates likely-looking content, it can also generate wrong content confidently (hallucination)",
        "Quality depends on the model, the prompt and any context or documents you provide",
      ],
    },
    {
      heading: "How Generative AI is changing work",
      content: "GenAI is best seen as a co-pilot: it speeds up first drafts and routine tasks so people can focus on judgement, creativity and relationships. Many routine tasks are being partly automated, and new roles are appearing.",
      points: [
        "Software: faster coding, test writing, documentation; developers review and guide AI output",
        "Marketing and content: first drafts of posts, ads, images and video; humans set strategy and brand voice",
        "Customer support: AI answers common questions; humans handle complex and emotional cases",
        "Education: personal tutors, quiz generation, explanations at any level",
        "Data and office work: summarising reports, writing formulas, analysing spreadsheets (Copilot in Excel, Day 23)",
        "New roles: AI engineer, prompt engineer, AI product manager, AI trainer/evaluator (Day 42)",
        "Skills that matter more: problem framing, critical thinking, domain expertise, checking quality, ethics and communication",
      ],
      tip: "A useful saying: 'AI will not replace you, but a person using AI well may outperform you.' Learn to use it well and responsibly.",
    },
    {
      heading: "Limits and risks of Generative AI",
      content: "GenAI is impressive but not magic. Knowing the limits keeps you safe and professional.",
      points: [
        "Hallucinations: plausible but false facts, references or code that does not work",
        "Knowledge cutoff: the model may not know recent events unless it has search or you provide documents",
        "Bias and stereotypes from training data can appear in text and images",
        "Copyright and ownership questions for generated content; follow tool licences and company policies",
        "Privacy: do not paste confidential data into unapproved tools",
        "Over-reliance: always review, edit and take responsibility for what you publish or submit",
      ],
    },
  ],
  examples: [
    {
      title: "Build a tiny text generator (bigram Markov chain) in pure Python",
      scenario: "See the core idea of GenAI at toy scale: learn which word follows which from a small text, then generate new sentences by sampling.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read the 'After the' list - these are the patterns it learned",
        "Read the generated sentences: some are new combinations that never appeared in the corpus",
        "Change random.seed(7) to random.seed(1) and run again to get different sentences",
        "Add your own sentences to the corpus and generate again",
      ],
      code: markovDemo,
      python: { files: { "main.py": markovDemo }, stdin: "" },
      result: `After 'the' we have seen: ['cat', 'mat', 'dog', 'rug', 'cat', 'dog', 'dog', 'cat']
Generated: the dog sat on the mat .
Generated: the dog saw the rug .
Generated: the mat .`,
      explanation: "Step 1 (learn): the program records every word that followed each word. 'cat' and 'dog' appear 3 times after 'the', so they are more likely to be chosen. Step 2 (generate): starting from 'the', it repeatedly picks a random follower. 'the dog saw the rug .' never appeared in the training text - it is new content built from learned patterns. It also produced the odd 'the mat .' - a tiny model has no real understanding. LLMs follow the same 'predict the next piece' idea with billions of parameters and much longer context, which is why their output is far more fluent.",
    },
    {
      title: "Text generation: one prompt, three formats",
      scenario: "You need a college event announcement for email, WhatsApp and Instagram. Generate all three from one prompt.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check the facts (date, venue) were copied exactly",
        "Click regenerate (or ask again) and compare - notice the wording changes each time",
        "Optional: open the AI Prompt Lab (/tools/ai-lab) and run it with Claude using your API key",
      ],
      code: `You are a creative college event coordinator.
Event: "AI for Everyone" workshop. Date: 12 December, 10 AM. Venue: Seminar Hall B. Free for all students. Register at the department office.
Write:
1. A formal email (max 120 words) with a subject line
2. A WhatsApp message (max 50 words, 2 emojis allowed)
3. An Instagram caption (max 40 words + 5 hashtags)
Do not change any event details.`,
      prompt: {
        system: "You are a creative college event coordinator. Never change facts given by the user.",
        user: "Event: \"AI for Everyone\" workshop. Date: 12 December, 10 AM. Venue: Seminar Hall B. Free for all students. Register at the department office.\nWrite:\n1. A formal email (max 120 words) with a subject line\n2. A WhatsApp message (max 50 words, 2 emojis allowed)\n3. An Instagram caption (max 40 words + 5 hashtags)\nDo not change any event details.",
      },
      result: "Three pieces of text in different tones: a formal email with subject 'Invitation: AI for Everyone Workshop - 12 December', a short friendly WhatsApp message, and a catchy Instagram caption with hashtags like #AIForEveryone #CollegeEvents - all with the same date, time and venue.",
      explanation: "GenAI adapts tone and length to the audience. Giving facts explicitly and saying 'Do not change any event details' reduces the chance of invented details.",
    },
    {
      title: "Code generation: ask for a small program and test it",
      scenario: "Use a chat assistant to generate a Python function, then run it yourself - the professional habit is 'generate, then verify'.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Copy the generated code into the in-app Python IDE (/tools/python-ide) and click Run",
        "Check that the test outputs match the expected values in the prompt",
        "If anything fails, paste the error back and ask the assistant to fix it",
      ],
      code: `Write a Python function grade(marks) that returns:
"A" for 90-100, "B" for 75-89, "C" for 50-74, "F" for 0-49, and "Invalid" for anything outside 0-100.
Use only the standard library. Add 5 test prints at the end:
grade(95) -> A, grade(80) -> B, grade(50) -> C, grade(10) -> F, grade(120) -> Invalid.
Explain the code in 3 bullet points after the code block.`,
      prompt: {
        system: "You are a senior Python developer who writes clean, beginner-friendly code.",
        user: "Write a Python function grade(marks) that returns:\n\"A\" for 90-100, \"B\" for 75-89, \"C\" for 50-74, \"F\" for 0-49, and \"Invalid\" for anything outside 0-100.\nUse only the standard library. Add 5 test prints at the end:\ngrade(95) -> A, grade(80) -> B, grade(50) -> C, grade(10) -> F, grade(120) -> Invalid.\nExplain the code in 3 bullet points after the code block.",
      },
      result: "A short function using if/elif checks, followed by prints that output A, B, C, F, Invalid when you run it, plus a 3-bullet explanation.",
      explanation: "Code generation saves time, but you remain responsible for correctness. Including test cases in the prompt makes it easy to verify the output immediately.",
    },
    {
      title: "Image prompt design (works in any image generator)",
      scenario: "Create a poster image for the same workshop. Learn the parts of a good image prompt.",
      steps: [
        "Open an image generator: ChatGPT (image generation), Gemini, Adobe Firefly, Canva AI or Microsoft Designer (free tiers available)",
        "Paste the prompt below",
        "Generate 2-4 variations and pick the best",
        "Note: image models often misspell text - add the event text later in Canva or PowerPoint",
      ],
      code: `Subject: a diverse group of college students around a glowing friendly robot holding a book
Setting: modern college seminar hall
Style: flat vector illustration, bright blue and orange colours, clean
Composition: poster layout, empty space at the top for a title
Mood: optimistic, welcoming
Avoid: any text, logos, real people's faces`,
      prompt: {
        system: "You are an expert at writing prompts for image generators. Improve the user's prompt without changing its intent.",
        user: "Improve this image prompt for a college workshop poster and give 2 alternative versions:\nSubject: a diverse group of college students around a glowing friendly robot holding a book\nSetting: modern college seminar hall\nStyle: flat vector illustration, bright blue and orange colours, clean\nComposition: poster layout, empty space at the top for a title\nMood: optimistic, welcoming\nAvoid: any text, logos, real people's faces",
      },
      result: "Colourful illustration(s) of students around a friendly robot with empty space at the top for the title. (If you used the AI Prompt Lab version, you get an improved prompt plus 2 alternatives to paste into the image tool.)",
      explanation: "Good image prompts describe subject, setting, style, composition, mood and what to avoid. Leaving out text and adding it later in a design tool is a common professional trick. Check the image tool's licence before commercial use.",
    },
  ],
  tools: [
    { name: "Claude", use: "Text and code generation", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Text, code and image generation", url: "https://chatgpt.com" },
    { name: "Adobe Firefly", use: "Image generation designed for commercial-friendly use", url: "https://firefly.adobe.com" },
    { name: "Canva AI", use: "Generate images and designs inside Canva", url: "https://www.canva.com" },
    { name: "ElevenLabs", use: "Text-to-speech and voice generation", url: "https://elevenlabs.io" },
    { name: "AI Tools Directory (in-app)", use: "Learn what each GenAI tool does and when to use it", url: "/tools/ai-tools" },
  ],
  interview: [
    { q: "What is Generative AI?", a: "AI that creates new content - text, images, audio, video or code - by learning patterns from large datasets and generating new outputs in response to prompts.", level: "Easy" },
    { q: "How is generative AI different from traditional (predictive) AI?", a: "Predictive/discriminative AI classifies or predicts values from input (spam or not, price). Generative AI produces new content (writes an email, creates an image).", level: "Easy" },
    { q: "Name tools for text, image, audio, video and code generation.", a: "Text: Claude, ChatGPT, Gemini. Image: Midjourney, DALL-E, Adobe Firefly. Audio: ElevenLabs. Video: Runway, Synthesia. Code: GitHub Copilot, Cursor, Claude Code.", level: "Easy" },
    { q: "Why does the same prompt give different outputs?", a: "Generation involves sampling: at each step the model picks from probable options with some randomness, so different paths produce different outputs.", level: "Medium" },
    { q: "What is a prompt?", a: "The input instruction or question given to a generative model, often including context, examples, constraints and desired format.", level: "Easy" },
    { q: "Which model families power most text and image generation today?", a: "Transformers power most text (and many multimodal) models; diffusion models power many image and video generators, often guided by transformer text encoders.", level: "Medium" },
    { q: "What are the main risks of generative AI?", a: "Hallucinations, bias, privacy leaks, copyright and ownership issues, deepfakes and misinformation, security risks like prompt injection, and over-reliance without human review.", level: "Medium" },
    { q: "How is GenAI changing software development?", a: "Assistants generate code, tests and documentation and explain errors, increasing speed on routine work. Developers shift towards design, review, integration, testing and guiding AI tools.", level: "Medium" },
    { q: "Is GenAI output 'copied' from training data?", a: "Usually it is newly generated from learned patterns rather than retrieved, but models can sometimes reproduce memorised text or styles closely, which raises copyright concerns. Users should avoid requesting copyrighted material and check licences.", level: "Hard" },
    { q: "What is a Markov chain text generator and how is it related to LLMs?", a: "It predicts the next word using only the current word and observed frequencies. LLMs share the idea of next-token prediction, but use deep transformer networks that consider long context and learned meaning.", level: "Hard" },
  ],
  practice: [
    { task: "Add 4 new sentences about birds and trees to the Markov corpus and generate 5 sentences.", hint: "Keep the ' . ' separators so sentences end.", solution: "Example additions: 'the bird sat on the tree . the bird saw the cat .' The generator now mixes birds, trees, cats and dogs in new combinations." },
    { task: "Generate a professional LinkedIn post about finishing Module 1 of this course, in under 100 words.", hint: "Give the AI the facts: course name, topics learned, what is next.", solution: "A good prompt: 'Write a LinkedIn post (max 100 words, 3 hashtags) about completing Module 1: AI Foundations - topics: AI types, ML, neural networks, NLP/CV, Responsible AI. Next: Generative AI. Tone: humble and excited.'" },
    { task: "Use one image generator to create a logo idea for a 'Study Buddy' app. Try 3 different styles.", hint: "Change only the style line: flat, 3D, hand-drawn.", solution: "Compare results; note which style worked and how the prompt change affected the output. Remember to avoid text in the image." },
    { task: "List 5 tasks in your current or dream job and mark each as 'AI can draft', 'AI can assist' or 'human only'.", hint: "Think about judgement, relationships and accountability.", solution: "Example (marketing): social post drafts - AI can draft; campaign analytics summary - AI can assist; client negotiation - human only; brand strategy - human with AI assist; final approval - human only." },
    { task: "Ask a chat assistant the same creative question 3 times ('Suggest a name for a chai cafe') and compare the answers.", hint: "Use the regenerate button or new chats.", solution: "The answers differ each time because of sampling. Open the AI Concepts Lab (/tools/ai-concepts) sampling simulator to see why - this leads into Day 8." },
  ],
  quiz: [
    { question: "Which is a generative AI task?", options: ["Classifying an email as spam", "Writing a new email reply", "Predicting a house price", "Detecting fraud"], answer: 1, explanation: "Generating new text is generative; the others are predictive." },
    { question: "Image generators like many popular text-to-image tools are mainly built on:", options: ["Diffusion models", "k-means", "Decision trees", "Spreadsheets"], answer: 0, explanation: "Diffusion models create images by removing noise step by step." },
    { question: "Why does the same prompt produce different answers?", options: ["The internet changes", "The model is retrained every second", "Sampling adds randomness when choosing the next piece", "It is a bug"], answer: 2, explanation: "Generation samples from probabilities." },
    { question: "Which tool is mainly for AI code assistance?", options: ["ElevenLabs", "Midjourney", "Synthesia", "GitHub Copilot"], answer: 3, explanation: "GitHub Copilot assists with writing code." },
    { question: "The best professional habit with GenAI output is:", options: ["Publish it immediately", "Review, verify and edit it before use", "Never use it", "Hide that AI was used everywhere"], answer: 1, explanation: "You remain responsible; always review and verify." },
  ],
};
