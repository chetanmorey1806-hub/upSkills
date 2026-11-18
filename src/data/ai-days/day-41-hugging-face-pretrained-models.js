export default {
  id: "day-41-hugging-face-pretrained-models",
  title: "Pre-trained Models with Hugging Face: Pipelines, Transformers and Using Models Without Training",
  module: "Module 6: Machine Learning Hands-on",
  day: 41,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "You do not have to train every model from scratch. Hugging Face hosts hundreds of thousands of pre-trained models and datasets. Learn what the Hugging Face Hub, model cards, the transformers library and pipeline() are; run sentiment analysis, zero-shot classification, named-entity recognition, summarisation and embeddings in a few lines (in Google Colab); understand the tokenizer -> model -> post-processing flow; call models through the Inference API with a token kept in an environment variable; and decide when to use a small open model, a large API model like Claude, or fine-tuning.",
  objectives: [
    "Explain transfer learning and why pre-trained models save time, data and money",
    "Navigate the Hugging Face Hub and read a model card (task, licence, limitations)",
    "Use transformers pipeline() for sentiment, zero-shot classification, NER and summarisation",
    "Describe the tokenizer -> model -> post-processing stages and use sentence-transformers embeddings",
    "Choose between a pre-trained open model, an LLM API and fine-tuning"
  ],
  theory: [
    {
      heading: "Transfer Learning: Standing on the Shoulders of Giants",
      content: "Training a modern language or vision model from zero needs huge datasets and expensive GPUs. Transfer learning reuses a model already trained on massive general data and applies it (directly or with a little extra training) to your task. Analogy: hiring an experienced chef and teaching them your restaurant's 10 special dishes, instead of raising a child to become a chef.",
      points: [
        "Pre-trained model: learned general knowledge (language, images, audio) from very large datasets.",
        "Use as-is (inference only): many tasks work immediately - sentiment, translation, summarisation, object detection.",
        "Fine-tuning: continue training on your small labelled dataset (hundreds to thousands of examples) to specialise it (Day 9).",
        "Benefits: far less data, compute, time and cost; often better accuracy than training from scratch.",
        "Days 36-40 trained classic ML on tables; for text, images and audio, pre-trained deep models are usually the starting point."
      ]
    },
    {
      heading: "The Hugging Face Ecosystem",
      content: "Hugging Face (huggingface.co) is often called the 'GitHub of machine learning'. It is a platform and a set of open-source libraries.",
      points: [
        "Hub - Models: a huge number of open models (BERT, DistilBERT, RoBERTa, T5, BART, Whisper, Llama, Mistral, Stable Diffusion, CLIP...). Filter by task, language, licence.",
        "Hub - Datasets: ready-to-use datasets loaded with the datasets library (load_dataset('imdb')).",
        "Spaces: free hosted demos built with Gradio or Streamlit - try a model in the browser before writing code.",
        "Libraries: transformers (models + pipelines), datasets, tokenizers, sentence-transformers (embeddings), diffusers (image generation), PEFT (efficient fine-tuning), and Transformers.js (run models in the browser with JavaScript).",
        "Inference options: run locally/Colab, call hosted Inference Providers with a free-tier token, or deploy dedicated Inference Endpoints (paid)."
      ],
      tip: "Before using a model, read its model card: intended use, training data, languages, licence (some forbid commercial use), known biases and limitations."
    },
    {
      heading: "pipeline(): One Line to Use a Model",
      content: "The pipeline() function hides all the complexity. You give it a task name (and ideally a specific model); it downloads the model and tokenizer, and returns a function you can call on your inputs.",
      syntax: `pip install transformers torch        # in Colab: !pip install -q transformers

from transformers import pipeline
clf = pipeline("sentiment-analysis", model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
clf(["I love this course!", "The video kept buffering."])

# Common tasks
pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
pipeline("translation", model="Helsinki-NLP/opus-mt-en-hi")
pipeline("question-answering", model="distilbert/distilbert-base-cased-distilled-squad")
pipeline("automatic-speech-recognition", model="openai/whisper-small")
pipeline("image-classification", model="google/vit-base-patch16-224")`,
      points: [
        "Always pass model=... explicitly. The default model for a task can change between library versions, making results irreproducible.",
        "The first call downloads the model (tens of MB to many GB) and caches it.",
        "Use device=0 for a GPU (Colab: Runtime -> Change runtime type -> T4 GPU). CPU works for small models.",
        "Batch inputs as a list for speed.",
        "transformers needs PyTorch and does not run in the in-app browser Python IDE - use Google Colab (free) or your own machine. The in-app IDE example below simulates the pipeline idea in pure Python."
      ]
    },
    {
      heading: "Under the Hood: Tokenizer -> Model -> Post-processing",
      content: "Every pipeline performs three stages. 1) The tokenizer splits text into tokens (sub-words) and maps them to ID numbers (Day 8). 2) The model turns IDs into numbers called logits (raw scores for each label). 3) Post-processing converts logits into probabilities (softmax) and readable labels.",
      syntax: `from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
name = "distilbert/distilbert-base-uncased-finetuned-sst-2-english"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name)

inputs = tok("Great service!", return_tensors="pt")      # token IDs + attention mask
with torch.no_grad():
    logits = model(**inputs).logits                         # raw scores
probs = logits.softmax(dim=-1)                              # probabilities
print(model.config.id2label[int(probs.argmax())], float(probs.max()))`,
      points: [
        "Auto classes (AutoTokenizer, AutoModel...) pick the right architecture from the model name.",
        "Model and tokenizer must come from the same checkpoint - a mismatch gives nonsense.",
        "Maximum input length is limited (often 512 tokens for BERT-style models) - long documents must be chunked, just like in RAG (Day 32).",
        "The 'score' is model confidence, not guaranteed correctness. Models can be confidently wrong, especially on sarcasm, slang or other languages."
      ]
    },
    {
      heading: "Embeddings with sentence-transformers",
      content: "Embedding models turn sentences into vectors so that similar meanings are close together - the foundation of semantic search and RAG (Days 12 and 32). Small open embedding models run fast even on CPU.",
      syntax: `pip install sentence-transformers
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
docs = ["How do I reset my password?", "Refund policy for damaged items", "Office opening hours"]
q = model.encode("I forgot my login password", convert_to_tensor=True)
d = model.encode(docs, convert_to_tensor=True)
print(util.cos_sim(q, d))     # highest similarity -> password document`,
      points: [
        "all-MiniLM-L6-v2 produces 384-dimensional vectors - small and fast.",
        "Store vectors in a vector DB (Chroma, Pinecone, pgvector) for large collections.",
        "Try the idea without code in the AI Concepts Lab (/tools/ai-concepts) embeddings & semantic search demo."
      ]
    },
    {
      heading: "Choosing: Small Open Model, LLM API or Fine-tuning?",
      content: "There is no single best option; choose by task, data privacy, cost, latency and quality needs.",
      points: [
        "Small task-specific open model (e.g. DistilBERT sentiment): very cheap and fast, can run on your own server (data never leaves), good for one narrow high-volume task.",
        "Large LLM API (Claude, GPT, Gemini): best for complex reasoning, writing, multi-step and many tasks with one model; no training needed - just prompting; pay per token; check data-privacy terms.",
        "Open LLMs (Llama, Mistral, Qwen) self-hosted: control and privacy, but you manage GPUs and updates.",
        "Fine-tuning: when prompting is not enough and you have quality labelled data; start with prompting + RAG first, it is cheaper and easier to update.",
        "Licences matter: check whether a model allows commercial use before shipping a product."
      ]
    }
  ],
  examples: [
    {
      title: "Sentiment Analysis in 3 Lines (Google Colab)",
      scenario: "A shop wants to auto-tag customer reviews as positive or negative. Use a pre-trained sentiment model - no training required.",
      steps: [
        "Open Google Colab (colab.research.google.com) and create a new notebook",
        "In the first cell run: !pip install -q transformers",
        "Paste the code below into the next cell and press Shift + Enter",
        "Wait for the model to download the first time (about 250 MB)",
        "Add your own sentences, including sarcasm, and see where the model fails"
      ],
      code: `from transformers import pipeline

clf = pipeline("sentiment-analysis",
               model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
reviews = [
    "I love this phone, the camera is great!",
    "Delivery was slow and the box was broken.",
    "Oh great, another update that deleted my photos.",
]
for review, out in zip(reviews, clf(reviews)):
    print(out["label"], round(out["score"], 3), "<-", review)`,
      result: `POSITIVE 0.999 <- I love this phone, the camera is great!
NEGATIVE 0.999 <- Delivery was slow and the box was broken.
NEGATIVE 0.99 <- Oh great, another update that deleted my photos.
(sample output - exact scores vary slightly with library versions)`,
      explanation: "The model was fine-tuned on movie-review sentences (SST-2), so it generalises well to clear product reviews. Scores near 1.0 mean high confidence. The sarcastic third sentence starts with 'great' but the model usually catches the negative meaning from 'deleted my photos' - still, always test sarcasm, mixed reviews and other languages before trusting a model in production. This model only knows POSITIVE/NEGATIVE - there is no NEUTRAL label."
    },
    {
      title: "Zero-shot Classification: Route Support Tickets Without Training Data",
      scenario: "A company has no labelled tickets yet but wants to route them to Billing, Technical or Delivery. A zero-shot model can classify into labels you invent on the spot.",
      steps: [
        "Open Google Colab and run !pip install -q transformers",
        "Paste the code below and run it (the model is large - about 1.6 GB - so a GPU runtime is faster)",
        "Read the top label and its score for each ticket",
        "Add a new label such as 'Account access' without retraining and run again"
      ],
      code: `from transformers import pipeline

zsc = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
labels = ["Billing", "Technical problem", "Delivery"]
tickets = [
    "I was charged twice for my subscription this month.",
    "The app crashes every time I open the settings page.",
    "My parcel shows delivered but I never received it.",
]
for t in tickets:
    out = zsc(t, candidate_labels=labels)
    print(out["labels"][0], round(out["scores"][0], 2), "<-", t)`,
      result: `Billing 0.9 <- I was charged twice for my subscription this month.
Technical problem 0.95 <- The app crashes every time I open the settings page.
Delivery 0.9 <- My parcel shows delivered but I never received it.
(sample output - the top labels are expected; exact scores vary)`,
      explanation: "Zero-shot models were trained on natural-language inference ('does sentence A imply sentence B?'). The pipeline checks how strongly each ticket implies 'This example is about Billing', etc., and ranks the labels. You get a working router on day one; later you can collect real labelled tickets and fine-tune a smaller, faster model - or use an LLM like Claude with a prompt for more nuanced routing."
    },
    {
      title: "Named-Entity Recognition and Summarisation",
      scenario: "Extract people, organisations and places from a news paragraph, then produce a short summary - two common NLP tasks from Day 5, now with real models.",
      steps: [
        "Open Google Colab and run !pip install -q transformers",
        "Paste the code below and run it",
        "Check each entity group: PER (person), ORG (organisation), LOC (location), MISC",
        "Paste a longer news article into text and compare the summary with your own"
      ],
      code: `from transformers import pipeline

text = ("Sundar Pichai announced on Tuesday that Google will open a new AI research "
        "centre in Bengaluru. The centre will work with the Indian Institute of Science "
        "on language models for Indian languages, and is expected to hire 200 researchers.")

ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")
for ent in ner(text):
    print(ent["entity_group"], "-", ent["word"])

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
print(summarizer(text, max_length=40, min_length=10)[0]["summary_text"])`,
      result: `PER - Sundar Pichai
ORG - Google
LOC - Bengaluru
ORG - Indian Institute of Science
MISC - Indian
Google will open a new AI research centre in Bengaluru, working with the Indian Institute of Science on language models for Indian languages.
(sample output - the summary wording will differ)`,
      explanation: "aggregation_strategy='simple' joins sub-word tokens back into whole entities ('Sundar Pichai' instead of 'Sun', '##dar'...). The summariser is an abstractive model: it writes new sentences rather than copying, so it can occasionally add or drop facts - always verify summaries of important documents (the same hallucination risk as LLMs). Note: this paragraph is an illustrative example, not a real news report."
    },
    {
      title: "Simulate a Pipeline in Pure Python (Runs in the In-app IDE)",
      scenario: "transformers needs PyTorch, which the browser IDE cannot load. To understand what pipeline() does internally, build a toy sentiment 'pipeline' with the same three stages: tokenizer -> model -> post-processing.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Compare the output format with the real Hugging Face output in Example 1",
        "Add 'okay' to WORD_SCORES with a small positive score and run again - notice how the 0.5 'unsure' result changes"
      ],
      code: `# A toy "pipeline" that mimics the 3 stages of a Hugging Face pipeline:
# 1) tokenizer  2) model (here: a tiny word-score table)  3) post-processing
import math

WORD_SCORES = {"love": 2.0, "great": 1.5, "fast": 1.0, "good": 1.0,
               "slow": -1.0, "bad": -1.5, "broken": -2.0, "terrible": -2.5, "not": -1.0}

def tokenize(text):
    cleaned = "".join(ch.lower() if ch.isalnum() or ch == " " else " " for ch in text)
    return cleaned.split()

def model(tokens):
    return sum(WORD_SCORES.get(t, 0.0) for t in tokens)       # a single "logit"

def postprocess(logit):
    p_pos = 1 / (1 + math.exp(-logit))                         # sigmoid -> probability
    if p_pos >= 0.5:
        return {"label": "POSITIVE", "score": round(p_pos, 4)}
    return {"label": "NEGATIVE", "score": round(1 - p_pos, 4)}

def sentiment_pipeline(texts):
    return [postprocess(model(tokenize(t))) for t in texts]

reviews = ["I love this phone, the camera is great!",
           "Delivery was slow and the box was broken.",
           "It is okay."]
for review, out in zip(reviews, sentiment_pipeline(reviews)):
    print(out, "<-", review)
print("tokens:", tokenize(reviews[0]))`,
      python: {
        files: {
          "main.py": `# A toy "pipeline" that mimics the 3 stages of a Hugging Face pipeline:
# 1) tokenizer  2) model (here: a tiny word-score table)  3) post-processing
import math

WORD_SCORES = {"love": 2.0, "great": 1.5, "fast": 1.0, "good": 1.0,
               "slow": -1.0, "bad": -1.5, "broken": -2.0, "terrible": -2.5, "not": -1.0}

def tokenize(text):
    cleaned = "".join(ch.lower() if ch.isalnum() or ch == " " else " " for ch in text)
    return cleaned.split()

def model(tokens):
    return sum(WORD_SCORES.get(t, 0.0) for t in tokens)       # a single "logit"

def postprocess(logit):
    p_pos = 1 / (1 + math.exp(-logit))                         # sigmoid -> probability
    if p_pos >= 0.5:
        return {"label": "POSITIVE", "score": round(p_pos, 4)}
    return {"label": "NEGATIVE", "score": round(1 - p_pos, 4)}

def sentiment_pipeline(texts):
    return [postprocess(model(tokenize(t))) for t in texts]

reviews = ["I love this phone, the camera is great!",
           "Delivery was slow and the box was broken.",
           "It is okay."]
for review, out in zip(reviews, sentiment_pipeline(reviews)):
    print(out, "<-", review)
print("tokens:", tokenize(reviews[0]))
`
        },
        stdin: ""
      },
      result: `{'label': 'POSITIVE', 'score': 0.9707} <- I love this phone, the camera is great!
{'label': 'NEGATIVE', 'score': 0.9526} <- Delivery was slow and the box was broken.
{'label': 'POSITIVE', 'score': 0.5} <- It is okay.
tokens: ['i', 'love', 'this', 'phone', 'the', 'camera', 'is', 'great']`,
      explanation: "Review 1: love (2.0) + great (1.5) = logit 3.5; sigmoid(3.5) = 0.9707 -> POSITIVE. Review 2: slow (-1.0) + broken (-2.0) = -3.0; sigmoid(-3) = 0.0474, so NEGATIVE with score 1 - 0.0474 = 0.9526. Review 3 contains no known words: logit 0, probability exactly 0.5 - the toy model is guessing. Real models replace the word table with millions of learned weights and understand context (e.g. 'not good'), but the three stages and the {'label', 'score'} output format are the same."
    },
    {
      title: "Call a Hosted Model with the Hugging Face Inference API",
      scenario: "You want to use a model from a web app or script without downloading it. Use the huggingface_hub InferenceClient with a free access token stored in an environment variable.",
      steps: [
        "Create a free account at huggingface.co, then go to Settings -> Access Tokens -> Create new token (type: Read / fine-grained with inference permission)",
        "Never paste the token in code. In Colab: click the key icon (Secrets) -> add HF_TOKEN and allow notebook access; locally: export HF_TOKEN=...",
        "Run !pip install -q huggingface_hub",
        "Paste the code below and run it",
        "If a model is not available through the free providers, pick another one from the Hub that shows an Inference Providers widget"
      ],
      code: `import os
from huggingface_hub import InferenceClient

client = InferenceClient(token=os.environ["HF_TOKEN"])   # token from env, never hard-coded

result = client.text_classification(
    "The new update made the app much faster!",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
)
print(result[0].label, round(result[0].score, 3))

vec = client.feature_extraction("semantic search with embeddings",
                                model="sentence-transformers/all-MiniLM-L6-v2")
print("embedding length:", len(vec))`,
      result: `POSITIVE 0.999
embedding length: 384
(sample output - availability of each model on the free tier can change)`,
      explanation: "The model runs on Hugging Face's (or a partner provider's) servers; you send text and receive JSON. This is the same pattern as the Claude API from Day 29: an API key from an environment variable, a model name, input and output. Free tiers have rate limits; production apps use paid endpoints or self-hosting. In JavaScript, Transformers.js can even run small models directly in the browser."
    }
  ],
  tools: [
    { name: "Hugging Face Hub", use: "Find pre-trained models, datasets and demo Spaces; read model cards", url: "https://huggingface.co" },
    { name: "Google Colab", use: "Free notebooks (with optional GPU) to run transformers pipelines", url: "https://colab.research.google.com" },
    { name: "Transformers docs", use: "pipeline(), Auto classes, tasks reference", url: "https://huggingface.co/docs/transformers" },
    { name: "sentence-transformers", use: "Embedding models for semantic search and RAG", url: "https://www.sbert.net" },
    { name: "In-app Python IDE", use: "Run the pure-Python pipeline simulation", url: "/tools/python-ide" },
    { name: "AI Concepts Lab", use: "Tokenizer and embeddings demos that explain what pipelines do inside", url: "/tools/ai-concepts" }
  ],
  interview: [
    { q: "What is transfer learning?", a: "Reusing a model pre-trained on a large general dataset for a new task, either directly or by fine-tuning on a smaller task-specific dataset. It reduces data, compute and time requirements and usually improves accuracy.", level: "Easy" },
    { q: "What is Hugging Face and what does it offer?", a: "An ML platform and open-source ecosystem: the Hub (models, datasets, Spaces), libraries (transformers, datasets, tokenizers, diffusers, sentence-transformers, PEFT, Transformers.js) and hosted inference options.", level: "Easy" },
    { q: "What does pipeline() do?", a: "It wraps tokenizer, model and post-processing for a task into a single callable: you pass raw text/images/audio and get human-readable results like {'label': 'POSITIVE', 'score': 0.99}.", level: "Easy" },
    { q: "Why should you specify the model in pipeline() instead of using the default?", a: "The default model for a task may change between library versions, causing different results. Pinning the model (and ideally a revision) makes results reproducible and lets you check its licence and model card.", level: "Medium" },
    { q: "What is a model card and what do you check in it?", a: "Documentation of a model: intended uses, training data, evaluation results, languages, licence, biases and limitations. Check licence (commercial use?), task fit, language support, size and known risks.", level: "Medium" },
    { q: "How does zero-shot classification work?", a: "A model trained on natural-language inference scores whether the input text entails a hypothesis like 'This text is about {label}' for each candidate label, so it can classify into labels never seen during training.", level: "Hard" },
    { q: "What are logits and how do they become probabilities?", a: "Logits are the raw, unnormalised scores output by the model for each class. Softmax (or sigmoid for binary) converts them into probabilities that sum to 1.", level: "Medium" },
    { q: "What is the difference between BERT-style and GPT-style models?", a: "BERT-style (encoder) models read the whole text bidirectionally and are great for understanding tasks (classification, NER, embeddings). GPT-style (decoder) models generate text token by token and are used for chat and generation. T5/BART (encoder-decoder) suit translation and summarisation.", level: "Medium" },
    { q: "When would you fine-tune instead of prompting an LLM?", a: "When you have good labelled data, need consistent style/format or domain behaviour that prompting and RAG cannot achieve, need a smaller/cheaper/faster model for a narrow high-volume task, or must run on-premise. Start with prompting + RAG first because it is cheaper and easier to update.", level: "Hard" },
    { q: "How do you handle documents longer than a model's maximum input length?", a: "Chunk the text (with overlap), process each chunk, then combine the results (e.g. summarise summaries, aggregate classifications), or choose a long-context model.", level: "Medium" },
    { q: "How would you keep a Hugging Face or LLM API key safe?", a: "Store it in environment variables or a secrets manager (Colab Secrets, .env excluded from Git, cloud secret stores), never in code or front-end JavaScript, use least-privilege tokens and rotate them if leaked.", level: "Easy" }
  ],
  practice: [
    {
      task: "On huggingface.co/models, filter by task 'Text Classification' and language 'Hindi' (or your language). Pick one model and write down: its task, licence, training data and one limitation from its model card.",
      hint: "Use the left-hand filters; open the model page and read the 'Model card' tab.",
      solution: "Example answer format: Model: <name>; Task: sentiment classification; Licence: MIT / Apache-2.0 (commercial use allowed) or CC-BY-NC (non-commercial only); Training data: product reviews / tweets; Limitation: may perform poorly on code-mixed Hinglish or sarcasm. The habit of reading model cards is what interviewers look for."
    },
    {
      task: "In Colab, run the zero-shot classifier on 5 emails from your own inbox subject lines (remove personal names) with labels ['Job', 'Shopping', 'Finance', 'Social', 'Spam']. Count how many it gets right.",
      hint: "Use the code from Example 2; change labels and texts.",
      solution: "Typical result: most clear cases are right; ambiguous subjects (e.g. 'Your account update') can be misrouted between Finance and Spam. Calculate accuracy = correct / 5 and note which labels get confused - this is a mini confusion-matrix analysis from Day 38."
    },
    {
      task: "Extend the pure-Python toy pipeline to handle negation: if 'not' is immediately before a known word, flip that word's score. Test 'not good' and 'not bad'.",
      hint: "Loop over tokens with their index and check tokens[i-1] == 'not'.",
      solution: `def model(tokens):
    total = 0.0
    for i, t in enumerate(tokens):
        s = WORD_SCORES.get(t, 0.0)
        if t != "not" and i > 0 and tokens[i - 1] == "not":
            s = -s
        if t != "not":
            total += s
    return total
# 'not good' -> -1.0 (NEGATIVE), 'not bad' -> +1.5 (POSITIVE)`
    },
    {
      task: "Use sentence-transformers in Colab to build a tiny FAQ search: 5 FAQ questions, one user question, print the best-matching FAQ and its cosine similarity.",
      hint: "SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'), util.cos_sim, argmax.",
      solution: `from sentence_transformers import SentenceTransformer, util
m = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
faqs = ["How do I reset my password?", "What is the refund policy?", "Where is my order?",
        "How can I change my delivery address?", "Do you offer student discounts?"]
q = "I forgot my login details"
sims = util.cos_sim(m.encode(q, convert_to_tensor=True), m.encode(faqs, convert_to_tensor=True))[0]
best = int(sims.argmax())
print(faqs[best], round(float(sims[best]), 2))   # expected best match: the password FAQ`
    },
    {
      task: "Write a one-page decision note: for a college helpdesk that must answer 2,000 student questions a day in English and Hindi, would you use (a) a small open model, (b) an LLM API such as Claude, or (c) fine-tuning? Justify with cost, privacy, quality and maintenance.",
      hint: "Consider RAG over college documents, multilingual needs, and who will maintain the system.",
      solution: "A reasonable answer: start with an LLM API (e.g. claude-haiku-5-5 for cost or claude-sonnet-5-5 for quality) plus RAG over college documents - multilingual, no training, easy to update when rules change; add a small open embedding model for retrieval; avoid sending sensitive student data; fine-tune only later if logs show consistent failures and labelled data exists."
    }
  ],
  quiz: [
    {
      question: "What is the main benefit of using a pre-trained model?",
      options: ["It never makes mistakes", "It needs much less data, time and compute for your task", "It does not need any input", "It works without electricity"],
      answer: 1,
      explanation: "Transfer learning reuses knowledge already learned from huge datasets."
    },
    {
      question: "Which pipeline task classifies text into labels you choose at run time, without training?",
      options: ["summarization", "ner", "translation", "zero-shot-classification"],
      answer: 3,
      explanation: "Zero-shot classification accepts candidate_labels at call time."
    },
    {
      question: "What are the three stages inside a pipeline?",
      options: ["Tokenizer -> model -> post-processing", "Download -> train -> deploy", "Scale -> cluster -> label", "Prompt -> retrieve -> generate"],
      answer: 0,
      explanation: "Text is tokenised into IDs, the model produces logits, and post-processing turns them into labels and scores."
    },
    {
      question: "Where should a Hugging Face access token be stored?",
      options: ["Hard-coded in the Python file", "In the front-end JavaScript", "In an environment variable or secrets manager", "In the model card"],
      answer: 2,
      explanation: "Keep secrets out of code and repositories; read them from the environment."
    },
    {
      question: "Before using a model commercially, what must you check on its model card?",
      options: ["Its colour theme", "Its licence", "The author's photo", "The number of likes only"],
      answer: 1,
      explanation: "Some licences forbid commercial use; the model card states the licence and limitations."
    }
  ]
};
