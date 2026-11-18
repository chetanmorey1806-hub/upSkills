export default {
  id: "day-01-what-is-ai-history-types",
  title: "What is Artificial Intelligence? History, Types (Narrow / General / Super AI), AI vs ML vs Deep Learning vs Generative AI",
  module: "Module 1: AI Foundations",
  day: 1,
  level: "Beginner",
  duration: "2 hours",
  summary: "Understand what Artificial Intelligence really is (and is not), the short story of how AI grew from 1950 to today's chat assistants, the three types of AI (Narrow, General, Super), and how AI, Machine Learning, Deep Learning and Generative AI fit inside each other like nested boxes.",
  objectives: [
    "Define Artificial Intelligence in simple words with everyday examples",
    "Tell the story of AI from the Turing Test (1950) to modern Generative AI",
    "Differentiate Narrow AI, General AI (AGI) and Super AI, and know which one exists today",
    "Explain how AI, Machine Learning, Deep Learning and Generative AI are related",
    "Compare a traditional rule-based program with a program that learns from data",
  ],
  theory: [
    {
      heading: "What is Artificial Intelligence?",
      content: "Artificial Intelligence (AI) is the field of building computer systems that can do tasks that normally need human intelligence: understanding language, recognising faces, making decisions, translating, writing, or playing games. A normal program follows exact steps that a programmer wrote. An AI system instead finds patterns, usually by learning from many examples. Analogy: a calculator is a very fast rule-follower, but it cannot tell whether a photo shows a cat. A child learns what a cat is by seeing many cats. Modern AI learns in a similar way, by seeing thousands or millions of examples.",
      points: [
        "Perception: seeing (images, video) and hearing (speech)",
        "Language: reading, writing, translating, summarising, chatting",
        "Reasoning and decision making: recommending a movie, routing a delivery van",
        "Learning: getting better at a task from data instead of being told every rule",
        "You already use AI daily: phone face unlock, Google Maps traffic, YouTube/Netflix recommendations, spam filters, voice assistants, chat assistants like Claude, ChatGPT and Gemini",
      ],
      tip: "A simple test: if the system improves by seeing more examples, or handles inputs it has never seen before, it is probably using AI. If it only follows fixed if-else rules, it is ordinary software.",
    },
    {
      heading: "A short history of AI (the story in 8 milestones)",
      content: "AI is not new. The idea is more than 70 years old; what changed recently is the amount of data, computing power (GPUs) and better algorithms. AI has gone through cycles of excitement and disappointment (called 'AI winters') when promises were bigger than results.",
      points: [
        "1950: Alan Turing asks 'Can machines think?' and proposes the Imitation Game, now called the Turing Test",
        "1956: The Dartmouth workshop (John McCarthy and others) coins the term 'Artificial Intelligence'",
        "1960s-1980s: Rule-based 'expert systems' (if-then rules written by experts); funding drops in the AI winters",
        "1997: IBM Deep Blue beats world chess champion Garry Kasparov",
        "2012: A deep neural network (AlexNet) wins the ImageNet image-recognition contest by a big margin, starting the deep learning boom",
        "2016: DeepMind's AlphaGo beats top Go player Lee Sedol",
        "2017: Google researchers publish 'Attention Is All You Need', introducing the Transformer, the design behind today's large language models",
        "2022 onwards: ChatGPT is released (Nov 2022) and Generative AI goes mainstream; Claude, Gemini, Llama, Mistral and many others follow, adding images, voice, video, coding and agents",
      ],
      tip: "Timeline in words: Rules (1950s-80s) -> Learning from data (1990s-2000s) -> Deep learning (2012+) -> Transformers (2017) -> Generative AI for everyone (2022+).",
    },
    {
      heading: "Types of AI by capability: Narrow, General, Super",
      content: "AI is often grouped by how broad its intelligence is. All AI that exists today is Narrow AI, even very impressive chat assistants. They can be excellent at many language tasks, but they still have clear limits, make mistakes, and do not have human-like general understanding of the world.",
      points: [
        "Narrow AI (Weak AI): good at specific tasks. Examples: spam filter, face unlock, chess engine, product recommendations, chat assistants. This is what we have today.",
        "General AI (AGI, Artificial General Intelligence): a hypothetical system that can learn and perform any intellectual task a human can, at human level, across domains. Researchers disagree on how close we are; it does not clearly exist yet.",
        "Super AI (ASI, Artificial Super Intelligence): a hypothetical future AI far smarter than the best humans in almost every field. It is a topic of research and AI safety discussions, not a product.",
      ],
      tip: "Interview trap: 'Is ChatGPT or Claude AGI?' A safe answer: they are very capable general-purpose assistants, but they are still classified as narrow AI by most experts because they have limits, can hallucinate and do not learn on their own after training.",
    },
    {
      heading: "AI vs Machine Learning vs Deep Learning vs Generative AI (nested boxes)",
      content: "These terms are not competitors; they are boxes inside boxes. Picture it in words:\n\n[ AI  - any technique that makes machines act smart\n   [ Machine Learning - AI that learns patterns from data\n      [ Deep Learning - ML using many-layered neural networks\n         [ Generative AI - deep learning that CREATES new text, images, audio, code ] ] ] ]\n\nSo every Generative AI system is deep learning, every deep learning system is machine learning, and every machine learning system is AI. But not every AI is ML: an old chess program with hand-written rules is AI without ML.",
      points: [
        "AI: the big goal (smart behaviour). Example: a rule-based chess program, a route planner",
        "Machine Learning (ML): learns from examples instead of hand-written rules. Example: house-price prediction, spam filter",
        "Deep Learning (DL): ML with neural networks that have many layers; great for images, speech and text. Example: face recognition",
        "Generative AI (GenAI): DL models that generate new content. Example: Claude writing an email, Midjourney/DALL-E creating an image, ElevenLabs creating a voice",
        "Discriminative vs Generative: a discriminative model chooses a label ('spam' or 'not spam'); a generative model produces new content ('write a reply to this email')",
      ],
    },
    {
      heading: "Traditional programming vs Machine Learning",
      content: "In traditional programming, a human writes the rules and the computer applies them: Rules + Data -> Answers. In machine learning, we give the computer data and the correct answers, and it figures out the rules itself: Data + Answers -> Rules (a model). Then we use that learned model on new data. Analogy: a recipe book (traditional) versus a cook who learns by tasting hundreds of dishes (ML).",
      syntax: "Traditional:  Rules + Data      --> Answers\nMachine Learning:  Data + Answers --> Rules (the model)\nUsing the model:   Model + New data --> Predictions",
      points: [
        "Use traditional code when rules are clear and fixed (tax slab calculation, GST)",
        "Use ML when rules are fuzzy or too many to write (is this photo a cat? is this review angry?)",
        "ML is never 100% correct; it gives the most likely answer based on what it learned",
      ],
    },
    {
      heading: "Where AI is used today (and what it cannot do)",
      content: "AI is used in almost every industry. At the same time, a beginner should know its limits, so they use it wisely and do not over-trust it.",
      points: [
        "Healthcare: reading X-rays and scans to assist doctors; Banking: fraud detection, credit scoring",
        "Retail and e-commerce: recommendations, demand forecasting, chat support",
        "Transport: maps and traffic prediction, driver-assistance features",
        "Office work: writing, summarising, coding help, data analysis with chat assistants and Copilot tools",
        "Limits: AI can be confidently wrong (hallucinate), can copy biases from data, does not truly 'understand' like a human, and needs human review for important decisions",
      ],
      tip: "Golden rule for this course: AI is a powerful assistant, not an authority. Always verify important facts.",
    },
  ],
  examples: [
    {
      title: "Ask a chat assistant to explain AI like you are 10",
      scenario: "You want a simple explanation of AI for your notes and to check how a chat assistant adapts its language to the audience.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) in your browser and sign in (free tier available)",
        "Click 'New chat'",
        "Paste the prompt below and press Enter",
        "Read the answer, then type a follow-up: 'Now explain the same thing to a final-year engineering student.'",
        "Compare the two answers: note how vocabulary and depth change",
        "Optional: open the in-app AI Prompt Lab (/tools/ai-lab) and click 'Run with Claude' with your own API key",
      ],
      code: `You are a friendly teacher.
Explain "Artificial Intelligence" to a 10-year-old in under 120 words.
Use one everyday analogy and give 3 examples of AI they use at home.
End with one thing AI cannot do well.`,
      prompt: {
        system: "You are a friendly teacher who explains technology to children using simple words and everyday analogies.",
        user: "Explain \"Artificial Intelligence\" to a 10-year-old in under 120 words. Use one everyday analogy and give 3 examples of AI they use at home. End with one thing AI cannot do well.",
      },
      result: "A short, friendly paragraph such as: 'AI is like teaching a computer to learn from examples, the way you learned to recognise dogs by seeing many dogs...' followed by examples (voice assistant, YouTube recommendations, phone face unlock) and a limit (for example: it can make things up and does not have feelings or common sense like you).",
      explanation: "The prompt sets a role (teacher), audience (10-year-old), length limit, required analogy and examples. Changing only the audience in the follow-up shows that the same AI adjusts depth and vocabulary. Exact wording will differ each time because chat assistants generate text fresh on every run.",
    },
    {
      title: "Rule-based program vs a tiny learning program (Python)",
      scenario: "See the difference between traditional programming (a human writes the rule) and machine learning (the program learns word counts from labelled emails).",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide) or any Python 3 installation",
        "Create main.py and paste the code below",
        "Click Run (or run: python3 main.py)",
        "Compare the 'rule' column with the 'learned' column for each test email",
        "Add two more labelled emails to the list and run again to see the learned answers change",
      ],
      code: `# Rule-based program vs a tiny "learning" program
emails = [
    ("win a free prize now", "spam"),
    ("free money click now", "spam"),
    ("claim your free gift", "spam"),
    ("meeting at 10 tomorrow", "ham"),
    ("please review the report", "ham"),
    ("lunch tomorrow with team", "ham"),
]

# 1) Traditional programming: a human writes the rule
def rule_based(text):
    return "spam" if "free" in text else "ham"

# 2) Machine learning: the program counts words from examples
counts = {"spam": {}, "ham": {}}
for text, label in emails:
    for word in text.split():
        counts[label][word] = counts[label].get(word, 0) + 1

def learned(text):
    score = {"spam": 0, "ham": 0}
    for word in text.split():
        for label in score:
            score[label] += counts[label].get(word, 0)
    return "spam" if score["spam"] > score["ham"] else "ham"

tests = ["click now to win", "report for the meeting", "free lunch tomorrow"]
for t in tests:
    print(f"{t!r:28} rule={rule_based(t):5} learned={learned(t)}")`,
      python: {
        files: {
          "main.py": `# Rule-based program vs a tiny "learning" program
emails = [
    ("win a free prize now", "spam"),
    ("free money click now", "spam"),
    ("claim your free gift", "spam"),
    ("meeting at 10 tomorrow", "ham"),
    ("please review the report", "ham"),
    ("lunch tomorrow with team", "ham"),
]

# 1) Traditional programming: a human writes the rule
def rule_based(text):
    return "spam" if "free" in text else "ham"

# 2) Machine learning: the program counts words from examples
counts = {"spam": {}, "ham": {}}
for text, label in emails:
    for word in text.split():
        counts[label][word] = counts[label].get(word, 0) + 1

def learned(text):
    score = {"spam": 0, "ham": 0}
    for word in text.split():
        for label in score:
            score[label] += counts[label].get(word, 0)
    return "spam" if score["spam"] > score["ham"] else "ham"

tests = ["click now to win", "report for the meeting", "free lunch tomorrow"]
for t in tests:
    print(f"{t!r:28} rule={rule_based(t):5} learned={learned(t)}")
`,
        },
        stdin: "",
      },
      result: `'click now to win'           rule=ham   learned=spam
'report for the meeting'     rule=ham   learned=ham
'free lunch tomorrow'        rule=spam  learned=ham`,
      explanation: "The hand-written rule only knows the word 'free', so it misses 'click now to win' and wrongly flags 'free lunch tomorrow'. The learning version builds its knowledge from examples: 'click' and 'now' appeared in spam, so it flags the first email. For 'free lunch tomorrow' the spam score (free = 3) ties with the ham score (lunch 1 + tomorrow 2), and ties go to 'ham'. More and better examples give better rules - that is the heart of machine learning.",
    },
    {
      title: "Classify real products as Narrow AI / AGI / Super AI and AI / ML / DL / GenAI",
      scenario: "Build a correct mental map by asking a chat assistant to classify tools, then checking its answers against today's theory.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and start a new chat",
        "Paste the prompt below",
        "Check each row against the 'nested boxes' section of today's theory",
        "If any row disagrees with the theory, reply: 'Explain why you classified X that way' and decide who is right",
        "Save the final table in your notes",
      ],
      code: `Create a table with columns: Product | What it does | Narrow AI / AGI / Super AI | Smallest box it fits (AI, ML, Deep Learning, Generative AI).
Products: Gmail spam filter, Google Maps traffic prediction, Phone face unlock, Old rule-based chess program, Netflix recommendations, Claude, Midjourney, A robot that can learn any human job.
Keep each cell short. After the table, add 2 lines explaining the difference between AI and Generative AI.`,
      prompt: {
        system: "You are an AI tutor. Be accurate and concise. If something is hypothetical, say so.",
        user: "Create a table with columns: Product | What it does | Narrow AI / AGI / Super AI | Smallest box it fits (AI, ML, Deep Learning, Generative AI).\nProducts: Gmail spam filter, Google Maps traffic prediction, Phone face unlock, Old rule-based chess program, Netflix recommendations, Claude, Midjourney, A robot that can learn any human job.\nKeep each cell short. After the table, add 2 lines explaining the difference between AI and Generative AI.",
      },
      result: "A table where everything real is Narrow AI; the rule-based chess program is 'AI' (not ML); spam filter, traffic prediction and recommendations are ML; face unlock is Deep Learning; Claude and Midjourney are Generative AI; 'a robot that can learn any human job' is marked as hypothetical AGI.",
      explanation: "This trains you to place any tool on the map. The key checks: all products that exist are Narrow AI, and rule-based systems are AI without ML.",
    },
    {
      title: "Build your own AI timeline with a self-check",
      scenario: "Use a chat assistant to create study notes, then verify dates yourself, practising the habit of fact-checking AI output.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Compare each date with the 'Short history' section above",
        "Search the web for any milestone you are unsure about (for example 'Dartmouth workshop 1956')",
        "Write down any mistake the AI made - this is your first hallucination check",
      ],
      code: `Make a timeline of 8 key milestones in AI history from 1950 to today.
Format: Year - Event - Why it mattered (one line each).
Include: Turing Test, Dartmouth workshop, expert systems, Deep Blue, AlexNet/ImageNet, AlphaGo, the Transformer paper, ChatGPT release.
At the end, list which dates I should double-check and why.`,
      prompt: {
        system: "You are a careful history-of-technology tutor. Mark anything you are not sure about.",
        user: "Make a timeline of 8 key milestones in AI history from 1950 to today.\nFormat: Year - Event - Why it mattered (one line each).\nInclude: Turing Test, Dartmouth workshop, expert systems, Deep Blue, AlexNet/ImageNet, AlphaGo, the Transformer paper, ChatGPT release.\nAt the end, list which dates I should double-check and why.",
      },
      result: "1950 Turing Test; 1956 Dartmouth workshop; 1970s-80s expert systems; 1997 Deep Blue beats Kasparov; 2012 AlexNet wins ImageNet; 2016 AlphaGo beats Lee Sedol; 2017 'Attention Is All You Need'; Nov 2022 ChatGPT released - plus a short list of items to verify.",
      explanation: "Asking the model to flag uncertain items and then checking them yourself builds the most important AI skill: trust, but verify.",
    },
  ],
  tools: [
    { name: "Claude", use: "Ask questions, get explanations and classify examples", url: "https://claude.ai" },
    { name: "ChatGPT", use: "Alternative chat assistant to compare answers", url: "https://chatgpt.com" },
    { name: "Google Gemini", use: "Alternative chat assistant to compare answers", url: "https://gemini.google.com" },
  ],
  interview: [
    { q: "What is Artificial Intelligence?", a: "AI is the field of building computer systems that perform tasks normally requiring human intelligence, such as understanding language, recognising images, making decisions and learning from experience. Most modern AI learns patterns from data instead of following only hand-written rules.", level: "Easy" },
    { q: "What is the difference between AI, Machine Learning and Deep Learning?", a: "They are nested: AI is the broad goal of smart machines; ML is a subset of AI where systems learn from data; Deep Learning is a subset of ML that uses multi-layer neural networks. Generative AI is a subset of deep learning that creates new content.", level: "Easy" },
    { q: "What are Narrow AI, General AI and Super AI?", a: "Narrow AI performs specific tasks (all AI today). AGI is hypothetical AI with human-level ability across any intellectual task. Super AI is hypothetical AI that surpasses humans in almost every domain.", level: "Easy" },
    { q: "What is the Turing Test?", a: "Proposed by Alan Turing in 1950, it checks whether a machine can hold a text conversation that a human judge cannot reliably distinguish from a human. It tests imitation of human conversation, not true understanding.", level: "Easy" },
    { q: "How is machine learning different from traditional programming?", a: "Traditional programming: rules + data produce answers. ML: data + answers are used to learn the rules (a model), which then makes predictions on new data. ML suits problems where rules are hard to write by hand.", level: "Medium" },
    { q: "Is a chat assistant like Claude or ChatGPT an example of AGI?", a: "Most experts classify them as narrow (though very general-purpose) AI. They are strong at language tasks but can hallucinate, do not learn continuously after training on their own, and lack reliable human-like understanding across all domains.", level: "Medium" },
    { q: "Give an example of AI that is not machine learning.", a: "A rule-based expert system or a classic chess engine using hand-coded search and evaluation rules. It behaves intelligently but does not learn its rules from data.", level: "Medium" },
    { q: "Why did deep learning take off around 2012?", a: "Three things came together: large labelled datasets (like ImageNet), powerful GPUs for parallel computation, and improved neural network techniques. AlexNet's 2012 ImageNet win showed the leap clearly.", level: "Medium" },
    { q: "What is the difference between discriminative and generative models?", a: "Discriminative models learn to separate or label data (spam vs not spam, cat vs dog). Generative models learn the data distribution well enough to produce new samples (write text, create images).", level: "Hard" },
    { q: "What were the 'AI winters'?", a: "Periods (notably in the 1970s and late 1980s) when AI funding and interest dropped because early promises, especially of rule-based systems, were not met. They remind us to keep expectations realistic.", level: "Medium" },
  ],
  practice: [
    { task: "List 10 AI-powered features you used this week (apps, phone, websites). Mark each as ML, Deep Learning or Generative AI.", hint: "Think: phone camera, maps, shopping, email, music, social media feeds.", solution: "Examples: face unlock (DL), camera night mode (DL), Google Maps ETA (ML), Gmail spam filter (ML), Smart Reply suggestions (GenAI), Spotify recommendations (ML), YouTube auto-captions (DL), Instagram filters (DL), chat assistant answers (GenAI), bank fraud alert (ML)." },
    { task: "Draw the nested-boxes diagram (AI > ML > DL > GenAI) on paper and write two examples inside each box that do not belong to the inner box.", hint: "Rule-based chess goes only in the AI box.", solution: "AI only: rule-based chess, route planner with fixed rules. ML (not DL): spam filter with word counts, house price linear regression. DL (not GenAI): face unlock, X-ray classifier. GenAI: Claude writing an email, Midjourney image." },
    { task: "In the Python example, add 3 new spam and 3 new ham emails, then test 'free meeting tomorrow' and 'win money now'.", hint: "Adding examples changes the word counts and therefore the learned decisions.", solution: "With more spam containing 'win' and 'money', 'win money now' becomes spam; 'free meeting tomorrow' depends on whether 'meeting' and 'tomorrow' counts outweigh 'free'. The point: the model's behaviour comes from data, not from a rule you typed." },
    { task: "Ask two different chat assistants (for example Claude and Gemini) 'Is AGI here yet? Answer in 5 bullet points.' Compare the answers.", hint: "Look for where they agree and where they hedge.", solution: "Both typically say there is no agreed AGI yet, that current models are capable but limited, and that experts disagree on timelines. Note any claims that need a source." },
    { task: "Write a 5-line explanation of 'Generative AI' for your parents, then ask a chat assistant to improve it while keeping it under 80 words.", hint: "Use the AI Prompt Lab (/tools/ai-lab) to add a role and a word limit.", solution: "Example: 'Generative AI is a computer program that has read huge amounts of text and pictures, so it can create new ones: write a letter, answer questions, draw an image. It predicts what comes next, like a very advanced auto-complete. It is helpful but can make mistakes, so check important facts.'" },
  ],
  quiz: [
    { question: "Which statement is correct?", options: ["All AI is machine learning", "Deep Learning is a subset of Machine Learning", "Generative AI is older than Machine Learning", "Machine Learning is a subset of Deep Learning"], answer: 1, explanation: "The nesting is AI > ML > Deep Learning > Generative AI." },
    { question: "Which type of AI exists today?", options: ["Super AI", "General AI", "Narrow AI", "All three"], answer: 2, explanation: "All AI systems in use today, including chat assistants, are considered Narrow AI." },
    { question: "In which year was the term 'Artificial Intelligence' coined at the Dartmouth workshop?", options: ["1943", "1950", "1997", "1956"], answer: 3, explanation: "John McCarthy and colleagues used the term at the 1956 Dartmouth workshop." },
    { question: "In machine learning, what do we give the computer to learn the rules?", options: ["Data and correct answers (examples)", "Only rules", "Only the final answers", "A faster processor"], answer: 0, explanation: "ML learns rules (a model) from data plus answers." },
    { question: "Which is an example of AI that is NOT machine learning?", options: ["A spam filter trained on emails", "A rule-based expert system", "Face unlock", "Claude"], answer: 1, explanation: "Expert systems use hand-written if-then rules; they do not learn from data." },
  ],
};
