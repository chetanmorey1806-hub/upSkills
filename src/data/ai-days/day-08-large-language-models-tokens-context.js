const nextWordDemo = `# Next-word prediction by counting (the core idea behind LLMs, very simplified)
from collections import Counter

text = """i love tea . i love coffee . i love tea in the morning .
i drink tea daily . i love music . you love tea ."""
words = text.split()

def next_word_probs(prev):
    followers = Counter(nxt for cur, nxt in zip(words, words[1:]) if cur == prev)
    total = sum(followers.values())
    return {w: round(c / total, 2) for w, c in followers.most_common()}

print("P(next | 'love') =", next_word_probs("love"))
print("P(next | 'i')    =", next_word_probs("i"))

# Greedy generation: always pick the most likely next word
current, out = "you", ["you"]
for _ in range(4):
    probs = next_word_probs(current)
    current = max(probs, key=probs.get)
    out.append(current)
print("Greedy continuation:", " ".join(out))
`;

const samplingDemo = `# Temperature and top-p as sampling ideas (conceptual demo)
import math

scores = {"tea": 2.0, "coffee": 1.0, "music": 0.5, "rocks": -1.0}  # model "logits"

def softmax(scores, temperature):
    exps = {w: math.exp(s / temperature) for w, s in scores.items()}
    total = sum(exps.values())
    return {w: e / total for w, e in exps.items()}

for t in (0.5, 1.0, 2.0):
    probs = softmax(scores, t)
    print(f"temperature {t}:", {w: f"{p:.0%}" for w, p in probs.items()})

# top-p (nucleus): keep the smallest set of words whose probability adds to >= p
probs = softmax(scores, 1.0)
kept, running = [], 0.0
for w, p in sorted(probs.items(), key=lambda kv: -kv[1]):
    kept.append(w)
    running += p
    if running >= 0.9:
        break
print("top-p 0.9 keeps:", kept, f"(covers {running:.0%})")

# Rough token estimate: about 4 characters per token in English
sentence = "Large language models read text as tokens, not whole words."
print(len(sentence), "characters ~", round(len(sentence) / 4), "tokens (rule of thumb)")
`;

export default {
  id: "day-08-large-language-models-tokens-context",
  title: "Large Language Models: tokens, context window, next-token prediction, temperature/top-p concept, hallucinations",
  module: "Module 2: Generative AI & Large Language Models",
  day: 8,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Look inside a Large Language Model (LLM) like Claude, GPT or Gemini. Learn that LLMs read text as tokens, have a limited context window (their working memory), generate one token at a time by predicting the most likely next token, use sampling ideas like temperature and top-p to add variety, and why this process sometimes produces hallucinations. Use the in-app AI Concepts Lab and two pure-Python demos.",
  objectives: [
    "Explain what an LLM is and what 'large' refers to",
    "Describe tokens and estimate token counts and cost",
    "Explain the context window and what happens when it is full",
    "Describe next-token prediction and how sampling (temperature, top-p) changes output",
    "Explain why LLMs hallucinate and how to reduce it",
  ],
  theory: [
    {
      heading: "What is a Large Language Model?",
      content: "A Large Language Model (LLM) is a deep neural network (a Transformer, Day 9) trained on a huge amount of text to predict the next piece of text. By learning to predict the next word well across books, websites, code and conversations, it also learns grammar, facts, reasoning patterns and styles. Examples: Claude (Anthropic), GPT models (OpenAI), Gemini (Google), Llama (Meta), Mistral models.",
      points: [
        "'Large' = billions of parameters and training data measured in trillions of tokens",
        "'Language' = trained mainly on text (many are now multimodal - images, audio too)",
        "'Model' = a mathematical function with learned parameters (Day 2)",
        "Chat assistants are LLMs further trained to follow instructions and be helpful and safe (Day 9)",
        "Analogy: the world's most widely-read auto-complete - it has 'read' a library and can continue any text in a sensible way",
      ],
    },
    {
      heading: "Tokens: how LLMs read text",
      content: "LLMs do not read whole words or letters; they read tokens - chunks of text that can be a word, part of a word, a space or punctuation. Common words are often one token; rare or long words are split into pieces.\n\n 'unbelievable!'  ->  [un] [believ] [able] [!]    (example split; exact splits differ by model)\n 'Hello world'    ->  [Hello] [ world]\n\nEach token is turned into an ID number, and the model works with these numbers.",
      points: [
        "Rule of thumb for English: 1 token is roughly 4 characters or about three-quarters of a word (varies by model and language)",
        "Other languages (Hindi, Marathi, Tamil) and code often use more tokens for the same meaning",
        "Pricing for AI APIs is per token - input tokens (your prompt) and output tokens (the answer) are counted, usually at different rates",
        "Limits are also in tokens: maximum output length (max_tokens) and context window size",
        "Try it: open the AI Concepts Lab (/tools/ai-concepts) tokenizer & cost estimator and paste any text",
      ],
      tip: "Why tokens and not words? A fixed vocabulary of sub-word pieces can spell any word - even new names or typos - without needing an infinite dictionary.",
    },
    {
      heading: "Context window: the model's working memory",
      content: "The context window is the maximum number of tokens the model can consider at once: system instructions + the whole conversation so far + any documents you pasted + the answer it is writing. Modern models support very large windows (often hundreds of thousands of tokens, some even more), but it is still a limit.\n\n [ system prompt | earlier messages | your document | latest question | answer... ]  <= context window\n\nAnalogy: a desk. Everything on the desk can be used right now. If the desk is full, old papers must be removed or summarised. The model does not remember anything that is not on the desk.",
      points: [
        "The model has no memory between separate chats unless the app adds a memory feature (it re-sends saved notes into the context)",
        "In a long chat, apps may drop or summarise the oldest messages to fit the window",
        "Bigger context = more tokens = more cost and sometimes slower responses",
        "Even within the window, very long inputs can make the model miss details - put important instructions clearly and ask specific questions",
      ],
    },
    {
      heading: "Next-token prediction: how text is generated",
      content: "An LLM generates text one token at a time in a loop:\n1. Read all tokens so far (the context).\n2. Compute a probability for every possible next token in its vocabulary (often tens of thousands of options).\n3. Pick one token (sampling).\n4. Append it and repeat until it decides to stop or hits max_tokens.\n\n 'I love'  ->  tea 60% | coffee 20% | music 20%  ->  pick 'tea'  ->  'I love tea'  ->  next...\n\nThis is why answers appear word by word (streaming). The model never 'looks up' a stored answer; it predicts the continuation.",
      points: [
        "Logits: raw scores the model gives each candidate token; softmax turns them into probabilities that sum to 1",
        "Greedy decoding: always pick the most likely token - consistent but can be repetitive",
        "Sampling: pick randomly according to the probabilities - more varied and creative",
        "Try the next-word probability / sampling simulator in the AI Concepts Lab (/tools/ai-concepts)",
      ],
    },
    {
      heading: "Temperature and top-p (sampling ideas)",
      content: "Temperature and top-p are sampling settings that some providers expose to control randomness.\n- Temperature reshapes the probabilities. Low temperature (for example 0.2) makes the top choice dominate - focused, predictable output. High temperature (for example 1.5) flattens probabilities - more surprising and creative, but also more likely to go off-track.\n- Top-p (nucleus sampling) keeps only the smallest set of most-likely tokens whose probabilities add up to p (for example 0.9), and samples from those, cutting off the weird long tail.\n\nAnalogy: choosing a dish at a restaurant. Low temperature: always order your favourite. High temperature: willing to try anything on the menu. Top-p: only choose among the dishes that make up 90% of what people usually order.",
      points: [
        "Low randomness suits facts, code, data extraction; higher randomness suits brainstorming, stories, slogans",
        "Important for Claude: current Claude models do not accept temperature, top_p or top_k in the API; behaviour is guided by your prompt and an effort setting (output_config: { effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max' }) that trades speed and cost for more thorough thinking",
        "Even without these settings, you can steer style with instructions like 'be concise and factual' or 'give 10 wild, creative ideas'",
      ],
    },
    {
      heading: "Why LLMs hallucinate",
      content: "Because an LLM is trained to produce likely-sounding text, it can produce a fluent answer even when it lacks the right information. If the true fact was rare in training data, came after the training cutoff, or the question pushes it to give a specific number or citation, it may 'fill the gap' with a plausible guess. It does not intend to lie; it is continuing text in the most probable way.",
      points: [
        "Triggers: niche facts, exact numbers, citations/links, recent events, long multi-step calculations, leading questions with false premises",
        "Reduce it: supply the source text and say 'answer only from this text'; allow 'I don't know'; ask for quotes from the source; use web search or RAG (Day 32); use a calculator or code for maths",
        "Verify important claims - LLMs are assistants, not authorities",
      ],
    },
  ],
  examples: [
    {
      title: "Next-word prediction by counting (pure Python)",
      scenario: "Build the simplest possible 'language model': count which word follows each word, turn counts into probabilities, and generate greedily.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read P(next | 'love'): tea is 60% because 'love tea' appears 3 times out of 5",
        "See how greedy generation always picks the top word",
        "Add 'i love coffee .' three more times to the text and run again - watch the probabilities change",
        "Then open the AI Concepts Lab (/tools/ai-concepts) next-word simulator to see the same idea interactively",
      ],
      code: nextWordDemo,
      python: { files: { "main.py": nextWordDemo }, stdin: "" },
      result: `P(next | 'love') = {'tea': 0.6, 'coffee': 0.2, 'music': 0.2}
P(next | 'i')    = {'love': 0.8, 'drink': 0.2}
Greedy continuation: you love tea . i`,
      explanation: "The probabilities come straight from counts in the training text - change the data and the 'model' changes. Greedy decoding picks 'tea' after 'love', then '.', then 'i'. A real LLM does the same next-token loop, but its probabilities come from a huge neural network that looks at the entire context (not just the previous word), which is why it can write meaningful paragraphs.",
    },
    {
      title: "Temperature and top-p demo (pure Python, conceptual)",
      scenario: "See exactly how temperature reshapes probabilities and how top-p trims unlikely tokens, using four candidate next words.",
      steps: [
        "Paste the code into the Python IDE and click Run",
        "Compare the three temperature lines: 0.5 is sharp, 2.0 is flat",
        "See which words top-p 0.9 keeps",
        "Check the token estimate for the sentence",
        "Change the sentence and compare with the tokenizer in the AI Concepts Lab (/tools/ai-concepts)",
      ],
      code: samplingDemo,
      python: { files: { "main.py": samplingDemo }, stdin: "" },
      result: `temperature 0.5: {'tea': '84%', 'coffee': '11%', 'music': '4%', 'rocks': '0%'}
temperature 1.0: {'tea': '61%', 'coffee': '22%', 'music': '14%', 'rocks': '3%'}
temperature 2.0: {'tea': '43%', 'coffee': '26%', 'music': '21%', 'rocks': '10%'}
top-p 0.9 keeps: ['tea', 'coffee', 'music'] (covers 97%)
59 characters ~ 15 tokens (rule of thumb)`,
      explanation: "Scores are divided by the temperature before softmax. Low temperature exaggerates differences (tea 84%), high temperature flattens them so even 'rocks' gets 10%. Top-p 0.9 keeps tea + coffee + music (97% together) and drops 'rocks'. The token count is only a rule-of-thumb estimate (characters / 4); real tokenizers give exact counts. Remember: this is a concept demo - current Claude models are steered with prompts and the effort setting instead of temperature.",
    },
    {
      title: "Experience the context window and memory in a chat assistant",
      scenario: "Discover what an LLM can and cannot remember within one chat and across chats.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and start a new chat",
        "Paste the prompt below",
        "Send two unrelated messages (for example ask for a joke, then a recipe)",
        "Ask: 'What is my code word and my city?' - it should remember (same context)",
        "Open a brand-new chat and ask the same question - it should not know (unless a memory feature is enabled)",
      ],
      code: `For this conversation, remember: my code word is "MANGO-42" and my city is Nashik.
Reply only with "Noted" for now.
Later I will ask you about them.`,
      prompt: {
        system: "You are a helpful assistant. Be brief.",
        user: "For this conversation, remember: my code word is \"MANGO-42\" and my city is Nashik.\nReply only with \"Noted\" for now.\nLater I will ask you about them.",
      },
      result: "First reply: 'Noted'. Later in the same chat it correctly answers MANGO-42 and Nashik. In a new chat it says it does not have that information (unless the app's memory feature saved it).",
      explanation: "Within a chat, the whole conversation is re-sent as context each turn, so the model 'remembers'. A new chat has an empty context. Product memory features work by storing notes and inserting them into the context - the model's parameters do not change.",
    },
    {
      title: "Trigger and fix a hallucination",
      scenario: "Ask a question with a false premise, then use a grounded prompt to get an honest answer.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Ask the trap question: 'In which year did Alan Turing win the Nobel Prize in Computer Science?'",
        "Read the answer: a careful model points out there is no Nobel Prize in Computer Science; a weaker one may invent a year",
        "Now paste the grounded prompt below",
        "Notice how source text plus permission to say 'not stated' produces a safe answer",
      ],
      code: `Answer ONLY using the text below. If the answer is not in the text, reply exactly: "Not stated in the text."
Text: "Alan Turing (1912-1954) was a British mathematician. In 1950 he proposed the Imitation Game, later called the Turing Test. The ACM Turing Award, often called the 'Nobel Prize of computing', is named after him."
Questions:
1. When did Turing propose the Imitation Game?
2. Which Nobel Prize did Turing win?
3. What is the ACM Turing Award often called?`,
      prompt: {
        system: "You answer strictly from the provided text. Never use outside knowledge.",
        user: "Answer ONLY using the text below. If the answer is not in the text, reply exactly: \"Not stated in the text.\"\nText: \"Alan Turing (1912-1954) was a British mathematician. In 1950 he proposed the Imitation Game, later called the Turing Test. The ACM Turing Award, often called the 'Nobel Prize of computing', is named after him.\"\nQuestions:\n1. When did Turing propose the Imitation Game?\n2. Which Nobel Prize did Turing win?\n3. What is the ACM Turing Award often called?",
      },
      result: "1. In 1950. 2. Not stated in the text. 3. The 'Nobel Prize of computing'.",
      explanation: "Grounding the model in source text and giving it an explicit 'way out' are two of the most effective anti-hallucination techniques. This is the core idea behind RAG (Day 32).",
    },
  ],
  tools: [
    { name: "AI Concepts Lab (in-app)", use: "Tokenizer & cost estimator and next-word sampling simulator", url: "/tools/ai-concepts" },
    { name: "OpenAI Tokenizer", use: "See how text is split into tokens for OpenAI models", url: "https://platform.openai.com/tokenizer" },
    { name: "Claude", use: "Experiment with context, memory and grounded prompts", url: "https://claude.ai" },
    { name: "Python IDE (in-app)", use: "Run the next-word and sampling demos", url: "/tools/python-ide" },
  ],
  interview: [
    { q: "What is a Large Language Model?", a: "A large transformer-based neural network trained on massive text data to predict the next token. This lets it generate and understand language, answer questions, summarise, translate and write code.", level: "Easy" },
    { q: "What is a token?", a: "A unit of text the model processes - a word, sub-word, character or punctuation. In English, one token is roughly 4 characters on average. Costs and limits are measured in tokens.", level: "Easy" },
    { q: "What is a context window?", a: "The maximum number of tokens the model can process in one request, including system prompt, conversation history, documents and the generated output.", level: "Easy" },
    { q: "How does an LLM generate text?", a: "Autoregressively: it computes a probability distribution over the vocabulary for the next token, selects one (greedy or sampling), appends it, and repeats until a stop condition.", level: "Medium" },
    { q: "What does temperature do?", a: "It scales the logits before softmax. Lower temperature makes the distribution sharper (more deterministic); higher temperature flattens it (more random/creative). Some providers expose it; current Claude models use prompts and an effort setting instead.", level: "Medium" },
    { q: "What is top-p (nucleus) sampling?", a: "Sampling only from the smallest set of tokens whose cumulative probability reaches p (for example 0.9), which removes unlikely tail tokens while keeping variety.", level: "Medium" },
    { q: "Why do LLMs hallucinate?", a: "They are optimised to produce plausible continuations, not verified facts. When knowledge is missing, rare, outdated or the prompt pressures for specifics, they may generate fluent but false content.", level: "Medium" },
    { q: "Does an LLM remember previous conversations?", a: "Not by itself. It only sees the current context window. Applications can add memory by storing information and inserting it into future prompts.", level: "Easy" },
    { q: "Why might Hindi text cost more tokens than English for the same meaning?", a: "Tokenizers are often trained mostly on English, so other scripts and languages are split into more, smaller tokens, increasing token counts.", level: "Hard" },
    { q: "What is the difference between greedy decoding and sampling?", a: "Greedy always picks the highest-probability token, giving consistent but sometimes repetitive output. Sampling picks according to probabilities, giving more varied output.", level: "Medium" },
    { q: "What is a knowledge cutoff?", a: "The date after which the model's training data ends. It will not know later events unless given information via search, tools or documents.", level: "Easy" },
  ],
  practice: [
    { task: "Paste a 100-word paragraph into the AI Concepts Lab tokenizer (/tools/ai-concepts). Compare the token count with characters / 4.", hint: "Note the cost estimate too.", solution: "The rule of thumb is usually close for plain English; numbers, code, names and non-English text typically produce more tokens than the estimate." },
    { task: "In the next-word demo, add 'i love coffee .' three times. What is the new P(next | 'love')?", hint: "Count followers of 'love': tea was 3, coffee 1, music 1.", solution: "Now tea 3, coffee 4, music 1 out of 8: {'coffee': 0.5, 'tea': 0.38, 'music': 0.12}. Greedy generation now chooses coffee after love." },
    { task: "In the sampling demo, add temperature 0.1 to the loop. What happens?", hint: "Very low temperature makes one option dominate.", solution: "Change the loop to for t in (0.1, 0.5, 1.0, 2.0). The new first line is: temperature 0.1: {'tea': '100%', 'coffee': '0%', 'music': '0%', 'rocks': '0%'} (rounded) - nearly greedy behaviour." },
    { task: "Write two prompts for the same task - one for factual output and one for creative output - without using any temperature setting.", hint: "Use instructions to control style.", solution: "Factual: 'List the 5 stages of the AI pipeline. Be concise, no opinions, one line each.' Creative: 'Invent 10 playful names for an AI study app - surprise me, mix languages, rhymes allowed.'" },
    { task: "Ask a chat assistant 3 false-premise questions (for example 'Why did India win the 1990 football World Cup?'). Record which ones it corrected.", hint: "A good model challenges the premise.", solution: "Strong models usually correct the false premise. Any invented answer is a hallucination - note the pattern and remember to verify." },
  ],
  quiz: [
    { question: "Roughly how many characters is one English token on average?", options: ["1", "4", "20", "100"], answer: 1, explanation: "A common rule of thumb is about 4 characters per token in English." },
    { question: "The context window includes:", options: ["Only the latest message", "Only the model's parameters", "System prompt, conversation, documents and the output being generated", "The model's training data"], answer: 2, explanation: "Everything the model sees in one request counts toward the window." },
    { question: "Lower temperature generally makes output:", options: ["More focused and predictable", "More random", "Longer", "Multilingual"], answer: 0, explanation: "Low temperature sharpens the probability distribution." },
    { question: "LLMs generate text by:", options: ["Searching a database of stored answers", "Copying web pages", "Running SQL queries", "Predicting the next token repeatedly"], answer: 3, explanation: "Generation is autoregressive next-token prediction." },
    { question: "Which is the best way to reduce hallucinations for a question about a policy document?", options: ["Increase randomness", "Ask for a longer answer", "Provide the document and ask it to answer only from it, allowing 'not stated'", "Ask the same question 10 times"], answer: 2, explanation: "Grounding plus an explicit way out reduces invented answers." },
  ],
};
