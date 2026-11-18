const attentionDemo = `# Self-attention in miniature: which words should "it" pay attention to?
import math

# Toy 3-number vectors (real models learn thousands of numbers per token)
vectors = {
    "the":    [0.1, 0.0, 0.1],
    "animal": [0.9, 0.8, 0.1],
    "didn't": [0.0, 0.1, 0.6],
    "cross":  [0.1, 0.2, 0.7],
    "street": [0.2, 0.9, 0.1],
    "it":     [0.8, 0.7, 0.2],
}
sentence = ["the", "animal", "didn't", "cross", "the", "street"]
query = vectors["it"]

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

scores = [dot(query, vectors[w]) / math.sqrt(3) for w in sentence]   # scaled dot product
exps = [math.exp(s) for s in scores]
weights = [e / sum(exps) for e in exps]                               # softmax

for word, w in zip(sentence, weights):
    print(f"{word:7} attention = {w:.2f} " + "#" * round(w * 50))

# The new meaning of "it" = weighted mix of the word vectors
mixed = [sum(w * vectors[word][i] for word, w in zip(sentence, weights)) for i in range(3)]
print("New vector for 'it':", [round(v, 2) for v in mixed])
`;

export default {
  id: "day-09-transformers-attention-pretraining-finetuning-rlhf",
  title: "Transformers and Attention explained simply; pre-training, fine-tuning, RLHF",
  module: "Module 2: Generative AI & Large Language Models",
  day: 9,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Understand the engine inside every modern LLM: the Transformer. Learn how attention lets each word 'look at' the other words to understand context, what embeddings and positional information are, and how a raw model becomes a helpful chat assistant through three stages - pre-training, fine-tuning and RLHF (reinforcement learning from human feedback). Compute attention weights yourself in pure Python.",
  objectives: [
    "Explain why Transformers replaced older sequence models like RNNs",
    "Describe self-attention using the query-key-value idea in plain words",
    "Outline the building blocks of a Transformer (embeddings, positions, attention, feed-forward, layers)",
    "Differentiate pre-training, fine-tuning (instruction tuning) and RLHF",
    "Know when fine-tuning is useful versus prompting or RAG",
  ],
  theory: [
    {
      heading: "The problem Transformers solved",
      content: "Before 2017, language models mostly used RNNs/LSTMs, which read text one word at a time, left to right, carrying a small 'memory' forward. Two problems: they were slow (you cannot process word 10 before word 9) and they forgot things from far back in long sentences. In 2017, Google researchers published 'Attention Is All You Need', introducing the Transformer. It reads all words at once and lets every word directly look at every other word through attention.\n\n RNN:          w1 -> w2 -> w3 -> w4 -> ... (one by one, memory fades)\n Transformer:  w1  w2  w3  w4   (all at once; every word can attend to every word)",
      points: [
        "Parallel processing: whole sentences are processed together, so training on GPUs is much faster",
        "Long-range understanding: a word can connect to a word far away in the text",
        "Scales well: more data + more parameters + more compute kept giving better models - leading to GPT, Claude, Gemini, Llama",
        "Transformers now also power vision, speech and multimodal models",
      ],
    },
    {
      heading: "Attention in plain words",
      content: "Read: 'The animal didn't cross the street because it was too tired.' What does 'it' mean? You instantly know 'it' = the animal (tired animals, not tired streets). Change one word: '...because it was too wide.' Now 'it' = the street. Attention is the mechanism that lets the model figure this out: when processing 'it', the model pays more attention to the most relevant words and blends their meaning in.\n\nAnalogy: in a noisy classroom, when the teacher says your name, you focus on the teacher and tune out the rest. Each word 'focuses' on the words that matter most for understanding it.",
      points: [
        "Self-attention: words in the same text attend to each other",
        "Each word gets attention weights over all words; the weights add up to 100%",
        "The word's new representation = a weighted mix of the other words' information",
        "Multi-head attention: several attention 'heads' run in parallel - one may track grammar, another meaning, another who-did-what",
      ],
    },
    {
      heading: "Query, Key, Value (the library analogy)",
      content: "Attention uses three vectors (lists of numbers) for every token, all learned during training:\n- Query (Q): 'What am I looking for?'\n- Key (K): 'What do I contain?' (like a book's label)\n- Value (V): 'The information I will give if chosen' (the book's content)\n\nLibrary analogy: you walk in with a question (query). You compare it with every book's label (keys). Books whose labels match your question best get more of your attention, and you read more from them (values).\n\nSteps: score = Q . K (dot product, how well they match) -> divide by the square root of the vector size -> softmax to get weights -> weighted sum of Values.",
      syntax: "Attention(Q, K, V) = softmax( Q x K^T / sqrt(d) ) x V",
      tip: "You do not need to memorise the formula. Remember: compare (Q with K), normalise (softmax), mix (V).",
    },
    {
      heading: "Inside a Transformer (building blocks)",
      content: "A decoder-style Transformer (the type used by most chat LLMs) processes text like this:\n\n text -> tokens -> token embeddings + position info -> [Block 1: attention + feed-forward] -> [Block 2] -> ... -> [Block N] -> probabilities for the next token\n\nEach block refines the understanding of every token. Large models stack many blocks (dozens or more).",
      points: [
        "Token embeddings: each token ID becomes a vector of numbers representing its meaning (Day 12)",
        "Positional information: since all words are read at once, position is added so the model knows word order ('dog bites man' vs 'man bites dog')",
        "Attention layer: tokens exchange information",
        "Feed-forward layer: each token's vector is processed further on its own - often described as where much factual and pattern knowledge is stored",
        "Residual connections and normalisation: engineering tricks that keep deep stacks trainable",
        "Masked (causal) attention in LLMs: while generating, a token can only look at earlier tokens, not future ones",
        "Variants: encoder-only (BERT - good for understanding/classification), decoder-only (GPT, Claude, Llama - generation), encoder-decoder (T5 - translation/summarisation)",
      ],
    },
    {
      heading: "From raw model to helpful assistant: pre-training, fine-tuning, RLHF",
      content: "Building a chat assistant happens in stages:\n\n 1. Pre-training   -> 2. Supervised fine-tuning (instruction tuning)  -> 3. RLHF / preference training -> Assistant\n   (read the internet)   (learn to follow instructions)                (learn what people prefer, be safe)\n\nAnalogy: 1) a student reads the entire library (knows a lot, but just rambles); 2) a teacher shows thousands of good question-and-answer examples (learns to answer properly); 3) mentors compare the student's answers and say which is better (learns to be helpful, honest and polite).",
      points: [
        "Pre-training: self-supervised next-token prediction on massive text and code; the most expensive stage; produces a 'base model' that continues text but does not reliably follow instructions",
        "Supervised fine-tuning (SFT): train on curated examples of instructions and ideal responses",
        "RLHF: humans rank multiple model answers; a reward model learns those preferences; the LLM is then optimised (reinforcement learning) to produce preferred answers",
        "Related methods: Anthropic's Constitutional AI uses a written set of principles and AI feedback (RLAIF) to guide behaviour; DPO is another popular preference-training method",
        "These stages improve helpfulness and safety but do not make the model perfect - it can still hallucinate",
      ],
    },
    {
      heading: "Fine-tuning vs prompting vs RAG (what should YOU use?)",
      content: "As a user or developer you rarely pre-train a model. You choose between three ways to adapt a model to your needs:",
      points: [
        "Prompting (Days 13-19): give instructions and examples in the prompt. Cheapest and fastest - always try this first",
        "RAG (Day 32): fetch relevant documents and put them in the context. Best for company knowledge and up-to-date facts",
        "Fine-tuning: further train a model on your examples to change its style or behaviour on a narrow task. Useful for consistent formats or specialised tasks with lots of examples; costs more and needs good data; not ideal for frequently changing facts",
        "Many open-weight models (Llama, Mistral) can be fine-tuned with tools like Hugging Face; some providers offer fine-tuning for certain models",
      ],
      tip: "Rule of thumb: Prompt first -> add RAG for knowledge -> fine-tune only if behaviour still is not right.",
    },
  ],
  examples: [
    {
      title: "Compute attention weights for the word 'it' (pure Python)",
      scenario: "Use tiny hand-made 3-number vectors to see how self-attention decides which words 'it' should focus on in 'the animal didn't cross the street'.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read the attention bar chart: 'animal' gets the highest weight",
        "Check that all weights add up to about 1.00",
        "Change the vector for 'it' to [-0.5, 1.0, 0.0] (strongly street-like) and run again - now 'street' should win",
      ],
      code: attentionDemo,
      python: { files: { "main.py": attentionDemo }, stdin: "" },
      result: `the     attention = 0.13 ######
animal  attention = 0.26 #############
didn't  attention = 0.14 #######
cross   attention = 0.15 ########
the     attention = 0.13 ######
street  attention = 0.20 ##########
New vector for 'it': [0.31, 0.43, 0.26]`,
      explanation: "For simplicity the word vectors themselves act as query, key and value (real models compute separate Q, K and V with learned weights). The dot product measures how similar 'it' is to each word, dividing by sqrt(3) scales it, and softmax turns scores into weights summing to 1. 'animal' wins (0.26), so the new vector for 'it' is pulled toward 'animal'. Real models do this in many heads and layers with vectors of thousands of numbers.",
    },
    {
      title: "Let a chat assistant explain attention with your own sentence",
      scenario: "Build intuition by asking an LLM to show which words matter for resolving a pronoun.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check whether the 'it' explanations make sense to you",
        "Write your own ambiguous sentence and ask again",
      ],
      code: `Take these two sentences:
A) "The trophy didn't fit in the suitcase because it was too big."
B) "The trophy didn't fit in the suitcase because it was too small."
For each, tell me what "it" refers to, and list the 3 words a Transformer's attention would likely focus on most when interpreting "it", with an estimated weight (must sum to 100%).
Explain in 4 lines why one word change flips the meaning.
Note: these weights are illustrative, not from a real model.`,
      prompt: {
        system: "You are an NLP teacher who explains Transformers intuitively. Clearly label illustrative numbers as illustrative.",
        user: "Take these two sentences:\nA) \"The trophy didn't fit in the suitcase because it was too big.\"\nB) \"The trophy didn't fit in the suitcase because it was too small.\"\nFor each, tell me what \"it\" refers to, and list the 3 words a Transformer's attention would likely focus on most when interpreting \"it\", with an estimated weight (must sum to 100%).\nExplain in 4 lines why one word change flips the meaning.\nNote: these weights are illustrative, not from a real model.",
      },
      result: "A) it = the trophy (focus on trophy, big, fit). B) it = the suitcase (focus on suitcase, small, fit) - with illustrative percentages and a short explanation that 'big' links to what does not fit, 'small' to the container.",
      explanation: "These are classic 'Winograd schema' sentences used to test understanding. Attention lets the model combine 'big/small' with 'trophy/suitcase' to resolve 'it'. The percentages are illustrative; real attention is spread across many heads and layers.",
    },
    {
      title: "Base model vs instruction-tuned model (thought experiment with a chat assistant)",
      scenario: "Understand why pre-training alone does not create a helpful assistant.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Compare the 'base model' and 'assistant' columns",
        "Relate each difference to SFT or RLHF from the theory",
      ],
      code: `Show how a raw pre-trained BASE language model might continue each input, versus a chat ASSISTANT after instruction tuning and RLHF.
Inputs:
1. "What is the capital of France?"
2. "Write a poem about rain"
3. "How do I pick a lock to break into my neighbour's house?"
Format: table with columns Input | Plausible base-model continuation | Assistant response | Which training stage caused the difference.
Keep each cell under 25 words.`,
      prompt: {
        system: "You are an LLM researcher explaining training stages to beginners. Keep examples safe and short.",
        user: "Show how a raw pre-trained BASE language model might continue each input, versus a chat ASSISTANT after instruction tuning and RLHF.\nInputs:\n1. \"What is the capital of France?\"\n2. \"Write a poem about rain\"\n3. \"How do I pick a lock to break into my neighbour's house?\"\nFormat: table with columns Input | Plausible base-model continuation | Assistant response | Which training stage caused the difference.\nKeep each cell under 25 words.",
      },
      result: "Row 1: base model may continue with more quiz questions ('What is the capital of Germany?...'); assistant answers 'Paris'. Row 2: base may continue like a forum post; assistant writes the poem. Row 3: assistant declines the break-in and may suggest contacting a locksmith for your own property. Differences credited to SFT (following instructions) and RLHF/safety training (preferences and refusals).",
      explanation: "Pre-training gives knowledge and fluency; instruction tuning teaches the question-answer format; preference training (RLHF or similar) shapes helpfulness, tone and safety.",
    },
    {
      title: "Decide: prompt, RAG or fine-tune?",
      scenario: "Practise the most common architecture decision in AI projects.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Write your own answer for each case first, then compare",
        "Keep the decision rule in your notes for Days 32 and 44",
      ],
      code: `For each need, choose Prompting, RAG, or Fine-tuning (or a combination) and give a one-line reason:
1. A college chatbot that answers from the 200-page student handbook (updated every semester)
2. Always reply in the company's exact JSON ticket format
3. Summarise meeting notes in a friendly tone
4. A legal assistant that must use the latest court circulars
5. Classify 1 million support tickets into 40 company-specific categories cheaply, with 50,000 labelled examples available`,
      prompt: {
        system: "You are an AI solutions architect. Prefer the simplest approach that works.",
        user: "For each need, choose Prompting, RAG, or Fine-tuning (or a combination) and give a one-line reason:\n1. A college chatbot that answers from the 200-page student handbook (updated every semester)\n2. Always reply in the company's exact JSON ticket format\n3. Summarise meeting notes in a friendly tone\n4. A legal assistant that must use the latest court circulars\n5. Classify 1 million support tickets into 40 company-specific categories cheaply, with 50,000 labelled examples available",
      },
      result: "1 RAG (knowledge changes each semester). 2 Prompting with structured outputs (fine-tuning only if still inconsistent). 3 Prompting. 4 RAG with fresh documents. 5 Fine-tuning a smaller model (or a classic classifier) since there is lots of labelled data and high volume.",
      explanation: "Knowledge problems -> RAG. Behaviour/format problems -> prompting first, fine-tuning if needed. High-volume narrow tasks with many labelled examples -> fine-tuning a smaller model can be cheaper.",
    },
  ],
  tools: [
    { name: "Python IDE (in-app)", use: "Run the attention demo", url: "/tools/python-ide" },
    { name: "Claude", use: "Explore attention examples and training-stage comparisons", url: "https://claude.ai" },
    { name: "Hugging Face", use: "Browse base and instruction-tuned open models; fine-tuning tools", url: "https://huggingface.co" },
  ],
  interview: [
    { q: "What is a Transformer?", a: "A neural network architecture introduced in 2017 ('Attention Is All You Need') that processes all tokens in parallel and uses self-attention to model relationships between tokens. It is the foundation of modern LLMs.", level: "Easy" },
    { q: "What is self-attention?", a: "A mechanism where each token computes weights over all tokens in the sequence (via query-key similarity and softmax) and builds a new representation as a weighted sum of their values, capturing context.", level: "Medium" },
    { q: "Explain Query, Key and Value.", a: "Each token is projected into a query (what it looks for), a key (what it offers for matching) and a value (the information passed on). Attention scores come from query-key dot products; outputs are weighted sums of values.", level: "Medium" },
    { q: "Why divide by the square root of d in attention?", a: "Dot products grow with vector dimension; scaling by sqrt(d) keeps scores in a range where softmax does not become too peaked, which stabilises training.", level: "Hard" },
    { q: "What is multi-head attention?", a: "Running several attention operations in parallel with different learned projections, letting the model capture different types of relationships at once, then combining them.", level: "Medium" },
    { q: "Why do Transformers need positional encoding?", a: "Attention itself is order-agnostic because tokens are processed in parallel. Positional information tells the model the order of tokens.", level: "Medium" },
    { q: "What is pre-training?", a: "The initial large-scale self-supervised training of an LLM on huge text corpora to predict the next token, producing a base model with broad knowledge and language skills.", level: "Easy" },
    { q: "What is RLHF?", a: "Reinforcement Learning from Human Feedback: humans rank model responses, a reward model is trained on these preferences, and the LLM is optimised to produce responses with higher reward - improving helpfulness and safety.", level: "Medium" },
    { q: "Fine-tuning vs RAG - when to use which?", a: "Use RAG to give the model up-to-date or private knowledge at query time. Use fine-tuning to change behaviour, style or performance on a narrow task with many examples. They can be combined.", level: "Hard" },
    { q: "Encoder-only vs decoder-only Transformers?", a: "Encoder-only (BERT) see the full text bidirectionally and are good for understanding tasks like classification and embeddings. Decoder-only (GPT, Claude, Llama) use causal attention and are designed for text generation.", level: "Hard" },
    { q: "Why did Transformers replace RNNs for language?", a: "Parallel training on GPUs, better handling of long-range dependencies, and excellent scaling with data and parameters.", level: "Medium" },
  ],
  practice: [
    { task: "In the attention demo, change the vector for 'it' to [-0.5, 1.0, 0.0]. Which word gets the highest attention now? Then try [0.2, 0.9, 0.1].", hint: "Compute the dot product of the new vector with 'animal' and with 'street'.", solution: "With [-0.5, 1.0, 0.0]: street = 0.23 (highest), animal = 0.18, and the new vector is [0.25, 0.4, 0.27]. With [0.2, 0.9, 0.1] it is a tie: animal = 0.22 and street = 0.22, because both dot products are close (0.91 vs 0.86 before scaling). Small vector changes shift attention - real models learn these vectors from data." },
    { task: "Write a 5-line explanation of attention using a WhatsApp group chat analogy.", hint: "When someone asks a question, which messages do you scroll back to?", solution: "Example: 'In a busy group chat, when someone asks \"what time is the party?\", you don't reread every message. You focus on the few messages that mention time and party. Attention does the same: each word looks back at all words but gives more weight to the relevant ones, then combines their information.'" },
    { task: "Draw (on paper) the 3 stages of building a chat assistant with one example of training data for each.", hint: "Raw text; instruction-answer pairs; ranked answers.", solution: "Pre-training: Wikipedia article text. SFT: 'Q: Summarise this paragraph... A: [good summary]'. RLHF: two answers to the same question with a human marking answer B as better." },
    { task: "List 3 problems at your college or workplace and decide prompt / RAG / fine-tune for each.", hint: "Does the problem need private knowledge, a fixed behaviour, or just good instructions?", solution: "Example: timetable Q&A bot - RAG; formal email drafting - prompting; classifying thousands of feedback forms into fixed categories with lots of past labels - fine-tune a small model or use prompting with examples first." },
    { task: "Ask a chat assistant to explain 'Attention Is All You Need' in 150 words for a 12th-grade student, then verify 2 facts (year and authors' organisation).", hint: "The paper is from 2017 by researchers at Google.", solution: "Expected: 2017, Google Brain / Google Research authors (Vaswani et al.), introduced the Transformer for translation. Verify via Google Scholar or the arXiv page." },
  ],
  quiz: [
    { question: "The Transformer architecture was introduced in:", options: ["2012", "2017", "2020", "1997"], answer: 1, explanation: "'Attention Is All You Need' was published in 2017." },
    { question: "In attention, softmax is used to:", options: ["Turn match scores into weights that sum to 1", "Split text into tokens", "Store facts", "Add position information"], answer: 0, explanation: "Softmax normalises scores into attention weights." },
    { question: "Which stage teaches a model from human preference rankings?", options: ["Tokenization", "Pre-training", "RLHF", "Positional encoding"], answer: 2, explanation: "RLHF uses human rankings to train a reward model and optimise the LLM." },
    { question: "A company's chatbot must answer from policies that change monthly. Best approach:", options: ["Pre-train a new model monthly", "Fine-tune once and never update", "Increase temperature", "RAG with the latest policy documents"], answer: 3, explanation: "RAG brings fresh knowledge into the context at query time." },
    { question: "Why do Transformers add positional information?", options: ["To reduce cost", "Because attention alone does not know word order", "To translate languages", "To remove bias"], answer: 1, explanation: "Parallel attention is order-agnostic, so position must be added." },
  ],
};
