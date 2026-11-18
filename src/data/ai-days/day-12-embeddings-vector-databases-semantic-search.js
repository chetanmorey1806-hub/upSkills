const cosineDemo = `# Embeddings + cosine similarity + semantic search (hand-made 4-number embeddings)
import math

# Dimensions (made up, for teaching): [animal, vehicle, food, royalty]
embeddings = {
    "dog":    [0.9, 0.0, 0.1, 0.0],
    "puppy":  [0.85, 0.0, 0.15, 0.0],
    "cat":    [0.8, 0.0, 0.1, 0.1],
    "car":    [0.0, 0.95, 0.0, 0.05],
    "truck":  [0.0, 0.9, 0.05, 0.0],
    "pizza":  [0.0, 0.0, 1.0, 0.0],
    "king":   [0.1, 0.0, 0.0, 0.95],
}

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    return dot / (norm_a * norm_b)

print(f"dog vs puppy: {cosine(embeddings['dog'], embeddings['puppy']):.3f}")
print(f"dog vs car:   {cosine(embeddings['dog'], embeddings['car']):.3f}")

# Semantic search: rank all items against a query vector
query = [0.7, 0.0, 0.3, 0.0]          # "a pet that likes food"
ranked = sorted(embeddings, key=lambda w: cosine(query, embeddings[w]), reverse=True)
for w in ranked[:3]:
    print(f"{w:6} score={cosine(query, embeddings[w]):.3f}")
`;

const searchDemo = `# Keyword search vs "meaning" search on a tiny FAQ (a mini vector store)
import math
from collections import Counter

faq = [
    "How do I get a refund for my order?",
    "Where can I track my delivery?",
    "How do I reset my password?",
]
synonyms = {"money": "refund", "back": "refund", "parcel": "delivery",
            "package": "delivery", "login": "password", "forgot": "reset"}

def words(text):
    return [w.strip("?.,!").lower() for w in text.split()]

def vector(text, use_synonyms):
    ws = words(text)
    if use_synonyms:                      # a crude stand-in for learned meaning
        ws = [synonyms.get(w, w) for w in ws]
    return Counter(ws)

def cosine(a, b):
    dot = sum(a[k] * b[k] for k in a)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0

store = [(doc, vector(doc, True)) for doc in faq]      # "index" the documents
query = "I want my money back"
for mode in (False, True):
    q = vector(query, mode)
    best = max(store, key=lambda item: cosine(q, item[1]))
    print(f"meaning={mode!s:5} best match: {best[0]!r} score={cosine(q, best[1]):.2f}")
`;

export default {
  id: "day-12-embeddings-vector-databases-semantic-search",
  title: "Embeddings, Vector Databases and Semantic Search",
  module: "Module 2: Generative AI & Large Language Models",
  day: 12,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn how AI turns meaning into numbers. Embeddings are lists of numbers (vectors) that place similar meanings close together, cosine similarity measures how close two meanings are, vector databases store and search millions of embeddings quickly, and semantic search finds results by meaning instead of exact keywords. This is the foundation of RAG and AI-powered search. Compute cosine similarity yourself in Python and try the embeddings demo in the in-app AI Concepts Lab.",
  objectives: [
    "Explain embeddings as 'coordinates of meaning' with simple analogies",
    "Compute and interpret cosine similarity between two vectors",
    "Contrast keyword search with semantic (meaning-based) search",
    "Describe what a vector database does and name popular options",
    "Outline the semantic search pipeline that powers RAG",
  ],
  theory: [
    {
      heading: "What is an embedding?",
      content: "An embedding is a list of numbers (a vector) that represents the meaning of a piece of text, an image or other data. An embedding model is trained so that things with similar meanings get similar vectors.\n\nAnalogy: a map. Every city has coordinates (latitude, longitude); nearby cities have nearby coordinates. Embeddings give every word, sentence or document coordinates on a 'map of meaning' - but instead of 2 numbers they usually use hundreds or thousands of numbers (dimensions).\n\n 'dog'    -> [0.90, 0.00, 0.10, 0.00]\n 'puppy'  -> [0.85, 0.00, 0.15, 0.00]   (close to dog)\n 'car'    -> [0.00, 0.95, 0.00, 0.05]   (far from dog)\n(Toy 4-number vectors; real dimensions are learned and have no simple labels.)",
      points: [
        "Similar meaning = vectors point in a similar direction",
        "Works across wording: 'How do I get my money back?' and 'refund process' end up close even with no shared words",
        "Embeddings exist for text, images (and image + text together), audio and code",
        "Embedding models are different from chat models: they output vectors, not text. Providers like OpenAI, Google, Cohere and Voyage AI offer embedding APIs, and many open models are on Hugging Face",
        "Try it: the AI Concepts Lab (/tools/ai-concepts) has an embeddings & semantic-search (mini RAG) demo",
      ],
    },
    {
      heading: "Measuring similarity: cosine similarity",
      content: "To compare two embeddings, we usually use cosine similarity: it measures the angle between the two vectors.\n- 1.0 = pointing the same way (very similar meaning)\n- 0 = at right angles (unrelated)\n- negative = opposite directions (rare for text in practice)\n\n cosine(A, B) = (A . B) / (|A| x |B|)\n   A . B   = sum of A[i] x B[i]   (dot product)\n   |A|     = square root of sum of A[i] squared   (length)\n\nAnalogy: two people pointing at stars. If they point in almost the same direction, they are looking at the same star - no matter how long their arms are. Cosine cares about direction, not length.",
      syntax: "cosine([1, 0], [1, 0]) = 1.0   same direction\ncosine([1, 0], [0, 1]) = 0.0   unrelated\ncosine([1, 1], [2, 2]) = 1.0   same direction, different length",
      tip: "Other distance measures exist (dot product, Euclidean distance). Many embedding models produce normalised vectors (length 1), so dot product and cosine give the same ranking.",
    },
    {
      heading: "Keyword search vs semantic search",
      content: "Keyword search (classic search, Ctrl+F, SQL LIKE) finds documents containing the same words as the query. Semantic search finds documents with the same meaning, using embeddings.\n\n Query: 'I want my money back'\n Keyword search: looks for 'money', 'back' -> may miss the 'Refund policy' page\n Semantic search: query embedding is close to 'refund' content -> finds 'Refund policy'",
      points: [
        "Keyword strengths: exact matches (product codes, names, error numbers), fast, explainable",
        "Semantic strengths: synonyms, paraphrases, different languages, natural-language questions",
        "Hybrid search combines both and is common in production systems",
        "Re-ranking: a second model can re-order the top results for even better relevance",
      ],
    },
    {
      heading: "Vector databases",
      content: "A vector database stores embeddings (with the original text and metadata) and quickly finds the nearest vectors to a query vector. Comparing a query with every vector one by one is fine for 1,000 items but too slow for millions; vector databases use approximate nearest neighbour (ANN) indexes (such as HNSW) to search fast with tiny accuracy trade-offs.\n\nAnalogy: a library where books are shelved by topic similarity, not alphabetically, and a librarian who walks straight to the right shelf instead of checking every book.",
      points: [
        "Store: id, vector, original text chunk, metadata (source file, page, date, department)",
        "Query: 'find top-k nearest vectors to this query vector' + optional metadata filters ('only HR documents from 2026')",
        "Popular options: Pinecone (managed cloud), Chroma (simple, open-source, great for learning), pgvector (vectors inside PostgreSQL), Weaviate, Qdrant, Milvus, FAISS (library)",
        "Many regular databases and search engines now support vectors too",
      ],
    },
    {
      heading: "The semantic search pipeline (foundation of RAG)",
      content: "Indexing (done once, or when documents change):\n 1. Collect documents -> 2. Split into chunks (for example a few paragraphs each) -> 3. Embed each chunk -> 4. Store in a vector DB\n\nQuerying (every question):\n 5. Embed the user's question -> 6. Find top-k most similar chunks -> 7. Show them as results, OR give them to an LLM to write an answer (RAG, Day 32)\n\n Question -> [embed] -> vector -> [vector DB: nearest chunks] -> chunks -> [LLM] -> grounded answer with sources",
      points: [
        "Uses: smart FAQ/helpdesk search, 'chat with your PDFs', product recommendations ('similar items'), duplicate ticket detection, clustering feedback by topic",
        "Use the SAME embedding model for documents and queries - vectors from different models are not comparable",
        "Chunk size matters: too big = vague matches; too small = missing context",
        "Embeddings capture similarity, not truth: the top result can still be outdated or wrong - keep sources up to date",
      ],
      tip: "You will build this end-to-end in the in-app AI App Builder (/tools/ai-app-builder) knowledge base on Day 44.",
    },
  ],
  examples: [
    {
      title: "Cosine similarity and semantic ranking with toy embeddings (pure Python)",
      scenario: "Use hand-made 4-number embeddings (animal, vehicle, food, royalty) to compute similarity and rank items for a query 'a pet that likes food'.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Compare dog-puppy (almost 1) with dog-car (0)",
        "See the top-3 results for the query vector",
        "Change the query to [0.0, 0.8, 0.0, 0.0] (something vehicle-like) and run again",
        "Then open the AI Concepts Lab (/tools/ai-concepts) embeddings demo to search real sentences",
      ],
      code: cosineDemo,
      python: { files: { "main.py": cosineDemo }, stdin: "" },
      result: `dog vs puppy: 0.998
dog vs car:   0.000
puppy  score=0.974
dog    score=0.957
cat    score=0.954`,
      explanation: "dog and puppy point in almost the same direction (0.998), while dog and car share no dimensions (0.000). The query 'pet that likes food' [0.7, 0, 0.3, 0] is closest to puppy because puppy has slightly more 'food' in its vector. Real embedding models learn hundreds of dimensions automatically, but the maths - dot product divided by lengths - is exactly the same.",
    },
    {
      title: "Keyword match vs meaning match on a tiny FAQ (pure Python mini vector store)",
      scenario: "A customer types 'I want my money back'. A plain word-overlap search picks the wrong FAQ; adding meaning (here simulated with a small synonym map) finds the refund answer.",
      steps: [
        "Paste the code into the Python IDE and click Run",
        "Look at the first line: plain keyword matching picks the delivery FAQ just because of common words like 'i' and 'my'",
        "Look at the second line: with meaning-aware vectors the refund FAQ wins",
        "Try the query 'forgot my login' and see which FAQ is returned in each mode",
      ],
      code: searchDemo,
      python: { files: { "main.py": searchDemo }, stdin: "" },
      result: `meaning=False best match: 'Where can I track my delivery?' score=0.37
meaning=True  best match: 'How do I get a refund for my order?' score=0.50`,
      explanation: "The 'store' is a list of (document, vector) pairs - a mini vector database. Without meaning, the only shared words are filler words ('i', 'my'), so the shortest FAQ scores highest by accident. Mapping 'money'/'back' to 'refund' simulates what a real embedding model learns automatically from data: different words, same meaning. Real systems use embedding models instead of hand-written synonym lists.",
    },
    {
      title: "Ask an assistant to act as a semantic search engine",
      scenario: "See semantic matching in action with an LLM: match employee questions to the right policy section even when no keywords overlap.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check whether each question was matched to the correct section",
        "Notice that the matches rely on meaning, not shared words",
        "Optional: run it in the AI Prompt Lab (/tools/ai-lab) with Claude",
      ],
      code: `Policy sections:
A. Leave policy - annual leave, sick leave, applying for time off
B. Reimbursement - travel claims, food bills, submitting receipts
C. IT security - passwords, laptops, phishing emails
D. Work from home - remote work days, internet allowance

For each employee question, give the best section letter, a similarity score 0-1 (your estimate), and the words that signalled the meaning:
1. "Can I get paid back for the cab I took to the client office?"
2. "I got a weird email asking for my login, what do I do?"
3. "My fever is high, can I skip work tomorrow?"
4. "Is my home Wi-Fi bill covered?"`,
      prompt: {
        system: "You are a semantic search engine for an HR helpdesk. Match by meaning, not keywords. Scores are your estimates and must be labelled as such.",
        user: "Policy sections:\nA. Leave policy - annual leave, sick leave, applying for time off\nB. Reimbursement - travel claims, food bills, submitting receipts\nC. IT security - passwords, laptops, phishing emails\nD. Work from home - remote work days, internet allowance\n\nFor each employee question, give the best section letter, a similarity score 0-1 (your estimate), and the words that signalled the meaning:\n1. \"Can I get paid back for the cab I took to the client office?\"\n2. \"I got a weird email asking for my login, what do I do?\"\n3. \"My fever is high, can I skip work tomorrow?\"\n4. \"Is my home Wi-Fi bill covered?\"",
      },
      result: "1 -> B (paid back = reimbursement, cab = travel). 2 -> C (weird email asking for login = phishing). 3 -> A (fever = sick leave). 4 -> D (home Wi-Fi = internet allowance). Scores are estimates such as 0.9.",
      explanation: "None of the questions share key words with the section titles, yet the meaning is clear. Real semantic search does this with embeddings and cosine similarity instead of a chat model, which is much faster and cheaper for millions of documents.",
    },
    {
      title: "Plan a vector database for a college notes search",
      scenario: "Design (on paper) the indexing and query pipeline for searching 500 PDF lecture notes by meaning.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check that the plan includes chunking, embeddings, vector DB, metadata and top-k retrieval",
        "Save it - you will use the same design for RAG on Day 32 and the final project on Day 44",
      ],
      code: `Design a semantic search system for 500 PDF lecture notes (subjects: DBMS, OS, Networks, AI).
Give:
1. Indexing steps (extract text, chunking strategy with a suggested chunk size, embedding, storage)
2. Metadata fields to store for each chunk
3. Query steps (including top-k and a metadata filter example)
4. Which vector database you would use for a student project and why (choose from Chroma, pgvector, Pinecone)
5. Two ways to evaluate whether search results are good
Keep it under 250 words.`,
      prompt: {
        system: "You are a search engineer mentoring students. Prefer simple, free tools for student projects.",
        user: "Design a semantic search system for 500 PDF lecture notes (subjects: DBMS, OS, Networks, AI).\nGive:\n1. Indexing steps (extract text, chunking strategy with a suggested chunk size, embedding, storage)\n2. Metadata fields to store for each chunk\n3. Query steps (including top-k and a metadata filter example)\n4. Which vector database you would use for a student project and why (choose from Chroma, pgvector, Pinecone)\n5. Two ways to evaluate whether search results are good\nKeep it under 250 words.",
      },
      result: "A plan such as: extract text per page -> chunks of a few hundred tokens with small overlap -> embed with one embedding model -> store in Chroma; metadata: subject, file name, page, unit, year; query: embed question, retrieve top-5, filter subject = 'OS'; Chroma for simplicity (or pgvector if already using PostgreSQL); evaluate with a set of 20 test questions and check if the correct page appears in the top-5 (hit rate), plus student feedback.",
      explanation: "This is the standard pipeline used in industry. The same design becomes RAG when you send the retrieved chunks to an LLM to write the answer with citations.",
    },
  ],
  tools: [
    { name: "AI Concepts Lab (in-app)", use: "Embeddings & semantic-search (mini RAG) demo", url: "/tools/ai-concepts" },
    { name: "Chroma", use: "Simple open-source vector database for learning and prototypes", url: "https://www.trychroma.com" },
    { name: "Pinecone", use: "Managed cloud vector database", url: "https://www.pinecone.io" },
    { name: "pgvector", use: "Vector similarity search inside PostgreSQL", url: "https://github.com/pgvector/pgvector" },
    { name: "Hugging Face", use: "Open embedding models (sentence-transformers)", url: "https://huggingface.co" },
  ],
  interview: [
    { q: "What is an embedding?", a: "A dense vector of numbers that represents the meaning of data (text, image, etc.) so that semantically similar items have similar vectors.", level: "Easy" },
    { q: "What is cosine similarity?", a: "A measure of the angle between two vectors: dot product divided by the product of their lengths. 1 means same direction (very similar), 0 means unrelated.", level: "Easy" },
    { q: "Why use cosine similarity instead of Euclidean distance for text embeddings?", a: "Cosine focuses on direction (meaning) rather than vector length, which can vary with text length or model specifics. For normalised vectors, cosine and dot product give the same ranking.", level: "Medium" },
    { q: "What is semantic search?", a: "Search that retrieves results based on meaning, by comparing the embedding of the query to embeddings of documents, rather than requiring exact keyword matches.", level: "Easy" },
    { q: "What is a vector database?", a: "A database optimised for storing embeddings with metadata and performing fast similarity (nearest-neighbour) search, often with approximate indexes like HNSW. Examples: Pinecone, Chroma, pgvector, Weaviate, Qdrant, Milvus.", level: "Easy" },
    { q: "What is ANN search?", a: "Approximate Nearest Neighbour search finds vectors that are very likely the closest without comparing against every vector, trading a tiny amount of accuracy for large speed gains.", level: "Medium" },
    { q: "Why must documents and queries use the same embedding model?", a: "Each model defines its own vector space; vectors from different models are not comparable, so similarity scores would be meaningless.", level: "Medium" },
    { q: "When is keyword search better than semantic search?", a: "For exact identifiers - product codes, error numbers, names, legal section numbers - and when explainability of matches matters. Hybrid search often combines both.", level: "Medium" },
    { q: "What is chunking and why does it matter?", a: "Splitting documents into smaller passages before embedding. Good chunk sizes keep enough context to be meaningful while being specific enough to match a question; it strongly affects retrieval quality.", level: "Medium" },
    { q: "How are embeddings used in RAG?", a: "Document chunks are embedded and stored; the user's question is embedded; the most similar chunks are retrieved and passed to the LLM as context so it can answer grounded in those sources.", level: "Hard" },
    { q: "Name three applications of embeddings besides search.", a: "Recommendations (similar products), clustering and topic discovery, duplicate detection, classification features, and anomaly detection.", level: "Medium" },
  ],
  practice: [
    { task: "Compute by hand cosine([1, 2], [2, 4]) and cosine([1, 0], [0, 1]). Then check with the cosine function.", hint: "The first pair points the same way.", solution: "cosine([1,2],[2,4]) = (2+8) / (sqrt(5) x sqrt(20)) = 10 / 10 = 1.0. cosine([1,0],[0,1]) = 0 / 1 = 0.0." },
    { task: "Add 'kitten' [0.8, 0.0, 0.1, 0.05] and 'bus' [0.0, 0.9, 0.0, 0.0] to the toy embeddings. Which is closer to 'cat'?", hint: "cat = [0.8, 0.0, 0.1, 0.1].", solution: "kitten is extremely close to cat (cosine 0.998); bus is unrelated (cosine 0.0)." },
    { task: "In the FAQ search demo, add synonyms so that 'my parcel has not arrived' returns the delivery FAQ in meaning mode.", hint: "'parcel' already maps to 'delivery' - test it.", solution: "Set query = 'my parcel has not arrived'. Real run: keyword mode picks the delivery FAQ with score 0.18 (only because of 'my'), meaning mode picks it with 0.37 because 'parcel' becomes 'delivery'. Bonus: 'forgot my login' gives the delivery FAQ (0.24) in keyword mode but 'How do I reset my password?' (0.71) in meaning mode. Add more synonyms like 'shipment': 'delivery', 'arrived': 'track' to strengthen matches." },
    { task: "Open the AI Concepts Lab (/tools/ai-concepts) embeddings demo. Search 3 questions that use different words from the documents and record the top result and score.", hint: "Use paraphrases, not copy-pasted phrases.", solution: "Good semantic search returns the relevant document even with different wording; note any failures and whether a keyword would have helped (hybrid search)." },
    { task: "Write a one-page design for a 'similar products' feature for an online store using embeddings.", hint: "Embed product title + description; store in a vector DB; query by the current product's vector.", solution: "Steps: embed every product (title, description, category); store vectors with metadata (price, category, stock) in a vector DB; on a product page, find top-5 nearest vectors excluding the same product, filter by in-stock; evaluate with click-through rate." },
  ],
  quiz: [
    { question: "Two embeddings with cosine similarity 0.98 are:", options: ["Unrelated", "Opposite in meaning", "Very similar in meaning", "Invalid"], answer: 2, explanation: "Close to 1 means the vectors point the same way." },
    { question: "Semantic search finds results based on:", options: ["Exact keyword matches only", "Meaning, using embeddings", "Alphabetical order", "File size"], answer: 1, explanation: "Semantic search compares meaning vectors." },
    { question: "Which is a vector database?", options: ["Chroma", "Microsoft Paint", "Excel PivotTable", "Git"], answer: 0, explanation: "Chroma stores embeddings and performs similarity search." },
    { question: "Why must queries and documents use the same embedding model?", options: ["To save disk space", "Because it is required by law", "To make search slower", "Different models create incompatible vector spaces"], answer: 3, explanation: "Only vectors from the same model are comparable." },
    { question: "For finding an exact product code like 'SKU-88213', the best choice is usually:", options: ["Pure semantic search", "Image generation", "Keyword (or hybrid) search", "Text-to-speech"], answer: 2, explanation: "Exact identifiers are best matched by keywords." },
  ],
};
