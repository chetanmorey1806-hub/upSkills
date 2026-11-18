const nlpDemo = `# Mini NLP: sentiment (word lexicon) + very simple NER (patterns)
import re

positive = {"good", "great", "love", "excellent", "fast", "happy"}
negative = {"bad", "slow", "broken", "hate", "late", "poor"}

def sentiment(text):
    words = re.findall(r"[a-z]+", text.lower())
    score = sum(w in positive for w in words) - sum(w in negative for w in words)
    if "not" in words:
        score = -score                # crude negation handling
    label = "POSITIVE" if score > 0 else "NEGATIVE" if score < 0 else "NEUTRAL"
    return label, score

reviews = [
    "Great phone, I love the fast charging",
    "Delivery was late and the box was broken",
    "The product is not good",
    "It arrived on Monday",
]
for r in reviews:
    print(sentiment(r), "<-", r)

cities = {"Mumbai", "Pune", "Delhi"}
def ner(text):
    found = []
    for token in re.findall(r"[A-Za-z0-9-]+", text):
        if token in cities:
            found.append((token, "LOCATION"))
        elif re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}", token):
            found.append((token, "DATE"))
    for name in re.findall(r"(?:Mr|Ms|Dr)\\.? [A-Z][a-z]+", text):
        found.append((name, "PERSON"))
    return found

print(ner("Dr. Sharma will fly from Pune to Delhi on 2026-12-05"))
`;

const visionDemo = `# Mini computer vision: a 5x5 "image" is just a grid of numbers (1 = ink)
images = {
    "vertical line": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]],
    "horizontal line": [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]],
    "plus sign": [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]],
}

def features(img):
    rows_with_ink = sum(1 for row in img if any(row))
    cols_with_ink = sum(1 for c in range(5) if any(img[r][c] for r in range(5)))
    return rows_with_ink, cols_with_ink

def classify(img):
    r, c = features(img)
    if r >= 4 and c >= 4:
        return "plus"
    if r >= 4:
        return "vertical"
    if c >= 4:
        return "horizontal"
    return "unknown"

for name, img in images.items():
    for row in img:
        print("".join("#" if p else "." for p in row))
    print(name, "-> features", features(img), "-> predicted:", classify(img), "\\n")
`;

export default {
  id: "day-05-nlp-computer-vision-basics",
  title: "NLP and Computer Vision Basics: text classification, sentiment, NER, image classification, object detection, OCR",
  module: "Module 1: AI Foundations",
  day: 5,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Meet the two biggest application areas of AI: Natural Language Processing (computers working with human language) and Computer Vision (computers understanding images and video). Learn the core tasks - text classification, sentiment analysis, named entity recognition, image classification, object detection and OCR - with real examples, chat-assistant exercises and tiny pure-Python demos.",
  objectives: [
    "Explain what NLP is and describe text classification, sentiment analysis and NER",
    "Explain how computers 'see' images as grids of numbers",
    "Differentiate image classification, object detection, segmentation and OCR",
    "Use a chat assistant to perform NLP and vision tasks (with image upload)",
    "Recognise the limits of simple rule-based NLP and vision approaches",
  ],
  theory: [
    {
      heading: "What is NLP (Natural Language Processing)?",
      content: "NLP is the area of AI that lets computers read, understand and generate human language - English, Hindi, Marathi, code comments, tweets. Language is hard for computers because it is ambiguous: 'I saw her duck' can mean a bird or a movement; 'This phone is sick!' may be praise. Modern NLP is dominated by large language models, but the classic tasks below are still how businesses describe what they need.",
      points: [
        "Pipeline idea: raw text -> clean -> split into tokens -> convert to numbers -> model -> output",
        "Tokenization: splitting text into pieces (words or sub-words) - LLMs use sub-word tokens (Day 8)",
        "Real uses: spam filters, chatbots, search engines, translation (Google Translate), voice assistants, resume screening, review analysis",
        "Classic tools: spaCy and NLTK (Python libraries); modern: Hugging Face models and LLM APIs",
      ],
    },
    {
      heading: "Core NLP tasks: text classification, sentiment, NER",
      content: "Three tasks cover a huge share of real-world NLP work:",
      points: [
        "Text classification: put a text into a category. Examples: spam/not spam, support ticket -> 'billing' / 'delivery' / 'technical', news -> sports/politics/business",
        "Sentiment analysis: a special classification for emotion or opinion - positive, negative, neutral (sometimes a score). Example: analysing 10,000 product reviews to see what customers dislike",
        "Named Entity Recognition (NER): find and label 'named things' in text - PERSON, ORGANIZATION, LOCATION, DATE, MONEY. Example: from 'Infosys opened an office in Pune on 5 May' extract Infosys = ORG, Pune = LOCATION, 5 May = DATE",
        "Other tasks: translation, summarisation, question answering, keyword extraction, speech-to-text (Day 11)",
      ],
      tip: "Sentiment is tricky with sarcasm ('Great, another delay!') and negation ('not bad'). Simple word-count methods fail here; LLMs handle context much better but are still not perfect.",
    },
    {
      heading: "What is Computer Vision? How computers see",
      content: "Computer Vision (CV) lets computers understand images and video. A computer does not see a 'cat'; it sees a grid of numbers. A grayscale image is a table of brightness values from 0 (black) to 255 (white). A colour image has three such tables: Red, Green and Blue (RGB). A 1080p photo has about 2 million pixels x 3 colours = about 6 million numbers.\n\n  . . # . .      0   0 255 0   0\n  . # # # .  =   0 255 255 255 0\n  . . # . .      0   0 255 0   0\n\nDeep learning models (CNNs and vision transformers) learn which patterns in these numbers mean 'edge', 'wheel', 'face'.",
      points: [
        "Pixel: the smallest dot of an image; resolution = width x height in pixels",
        "Video = many images (frames) per second, for example 30 fps",
        "Real uses: face unlock, medical scan analysis, quality inspection in factories, number-plate reading, self-driving perception, crop disease detection",
        "Popular tools: OpenCV (classic image processing), YOLO (fast object detection), Google Lens, and multimodal chat assistants that accept images",
      ],
    },
    {
      heading: "Core vision tasks: classification, detection, segmentation, OCR",
      content: "Imagine a photo of a street with two cars and a dog:",
      syntax: "Image classification: 'street scene'                 (one label for whole image)\nObject detection:     [car  box at x,y,w,h] [car box] [dog box]  (what + where)\nSegmentation:         colour every pixel: car pixels / dog pixels / road pixels\nOCR:                  read the text on the number plate -> 'MH12AB1234'",
      points: [
        "Image classification: one label per image (cat vs dog, defective vs good part, normal vs abnormal X-ray)",
        "Object detection: finds multiple objects and draws bounding boxes around each (helmet detection, counting people, self-driving cars)",
        "Image segmentation: labels every pixel; used in medical imaging and photo background removal",
        "OCR (Optical Character Recognition): converts text in images or scans into editable text - invoices, PAN/Aadhaar card forms, number plates, Google Lens copy-text",
        "Face recognition, pose estimation and image generation are other CV areas",
      ],
    },
    {
      heading: "From rules to deep learning to LLMs",
      content: "Early NLP and CV used hand-written rules ('if the word is in the positive list...', 'if many pixels in a column are dark...'). These break easily. Then machine learning learned the rules from labelled data. Today, deep learning and large multimodal models can do many of these tasks with just an instruction - you can upload a photo to Claude, ChatGPT or Gemini and ask 'what objects are in this image?' or 'extract the table from this receipt'.",
      points: [
        "Rules: fast and explainable but brittle (fail on new wording or new images)",
        "Trained models: accurate on their task, need labelled data",
        "LLMs / multimodal models: flexible, zero-shot (no training needed), but can be slower, cost per use, and can make mistakes - always check important outputs",
      ],
      tip: "Never upload private documents (ID cards, medical reports, company data) to public AI tools without permission - this connects to Day 6 (privacy).",
    },
  ],
  examples: [
    {
      title: "Mini NLP: sentiment and NER with simple rules (pure Python)",
      scenario: "Build a tiny lexicon-based sentiment analyser and a pattern-based entity finder to understand what these tasks produce - and where simple methods break.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Check the sentiment labels and scores for each review",
        "Look at the entities found in the last sentence",
        "Add the review 'Not bad at all, I am happy' to the list - it comes out NEUTRAL, so the crude negation rule gets it wrong",
      ],
      code: nlpDemo,
      python: { files: { "main.py": nlpDemo }, stdin: "" },
      result: `('POSITIVE', 3) <- Great phone, I love the fast charging
('NEGATIVE', -2) <- Delivery was late and the box was broken
('NEGATIVE', -1) <- The product is not good
('NEUTRAL', 0) <- It arrived on Monday
[('Pune', 'LOCATION'), ('Delhi', 'LOCATION'), ('2026-12-05', 'DATE'), ('Dr. Sharma', 'PERSON')]`,
      explanation: "Sentiment: each positive word adds 1, each negative word subtracts 1, and 'not' flips the score. NER: a list of known cities, a date pattern and a title pattern (Dr./Mr./Ms.) find entities. It works on these examples but is brittle: it does not know new cities or sarcasm, and 'Not bad at all, I am happy' returns ('NEUTRAL', 0) because 'happy' (+1) and 'bad' (-1) cancel out before 'not' flips the score - even though the review is clearly positive. Real systems learn these patterns from data or use an LLM.",
    },
    {
      title: "Sentiment + NER + classification on customer reviews with a chat assistant",
      scenario: "An online shop has messy customer messages. Use an LLM to do three NLP tasks at once and return a clean table.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check each row: is the sentiment right, especially for the sarcastic message?",
        "Optional: open the AI Prompt Lab (/tools/ai-lab), paste the prompt, and add a constraint 'Output JSON only'",
      ],
      code: `Analyse these customer messages. For each, return: Category (Delivery / Product quality / Payment / Other), Sentiment (Positive / Negative / Neutral), Entities (person, place, product, date, money).
1. "Ordered a Samsung charger on 3 Nov, still not delivered to Nagpur!"
2. "Great, another failed UPI payment of Rs 499. Just great."
3. "Rahul from support was super helpful, thanks!"
4. "The jeans fit well but the colour faded after one wash."
Return a markdown table, then one line on which message was hardest and why.`,
      prompt: {
        system: "You are an NLP assistant for an e-commerce support team. Be precise and detect sarcasm.",
        user: "Analyse these customer messages. For each, return: Category (Delivery / Product quality / Payment / Other), Sentiment (Positive / Negative / Neutral), Entities (person, place, product, date, money).\n1. \"Ordered a Samsung charger on 3 Nov, still not delivered to Nagpur!\"\n2. \"Great, another failed UPI payment of Rs 499. Just great.\"\n3. \"Rahul from support was super helpful, thanks!\"\n4. \"The jeans fit well but the colour faded after one wash.\"\nReturn a markdown table, then one line on which message was hardest and why.",
      },
      result: "1 Delivery / Negative / Samsung charger (product), 3 Nov (date), Nagpur (place). 2 Payment / Negative (sarcasm) / UPI, Rs 499 (money). 3 Other (support) / Positive / Rahul (person). 4 Product quality / Mixed or Negative / jeans (product). Hardest: message 2 because 'Great' is sarcastic, or message 4 because it is mixed.",
      explanation: "One LLM prompt replaced three separate classic models. Notice the LLM catches sarcasm that our rule-based demo would miss - but always spot-check results before using them for business decisions.",
    },
    {
      title: "Mini computer vision: images are grids of numbers (pure Python)",
      scenario: "Represent tiny 5x5 black-and-white images as numbers, extract simple features, and classify the shape.",
      steps: [
        "Paste the code into the Python IDE and click Run",
        "See each image drawn with # and . characters",
        "Read the features: (rows with ink, columns with ink)",
        "Add a 4th image: a diagonal line (1s from top-left to bottom-right) and see how it is classified",
      ],
      code: visionDemo,
      python: { files: { "main.py": visionDemo }, stdin: "" },
      result: `..#..
..#..
..#..
..#..
..#..
vertical line -> features (5, 1) -> predicted: vertical

.....
.....
#####
.....
.....
horizontal line -> features (1, 5) -> predicted: horizontal

..#..
..#..
#####
..#..
..#..
plus sign -> features (5, 5) -> predicted: plus`,
      explanation: "To the computer an image is only numbers. We hand-designed two features (how many rows and columns contain ink) and wrote rules on top. A diagonal line also has ink in 5 rows and 5 columns, so it is wrongly called 'plus' - hand-made features break easily. CNNs solve this by learning their own features (edges, corners, curves) from thousands of labelled images.",
    },
    {
      title: "OCR and object detection with an image-capable chat assistant",
      scenario: "Use a multimodal chat assistant to read text from a photo (OCR) and list objects with approximate positions (detection-style output).",
      steps: [
        "Take a photo of a printed shop bill or a notice board (avoid personal data)",
        "Open claude.ai (or ChatGPT / Gemini) and click the attachment / image button",
        "Upload the photo and paste the prompt below",
        "Compare the extracted text with the photo line by line and count any errors",
        "Optional: try Google Lens 'Text' mode on the same photo and compare",
      ],
      code: `1. OCR: Extract all text from this image exactly as written, keeping line breaks.
2. Detection: List every distinct object you can see with its approximate position (top-left, center, bottom-right, etc.).
3. Classification: In one word, what kind of image is this (receipt, notice, menu, street, other)?
Mark anything you cannot read clearly as [unclear].`,
      prompt: {
        system: "You are a careful vision assistant. Never guess unreadable text; mark it [unclear].",
        user: "(Attach an image in your chat app.)\n1. OCR: Extract all text from this image exactly as written, keeping line breaks.\n2. Detection: List every distinct object you can see with its approximate position (top-left, center, bottom-right, etc.).\n3. Classification: In one word, what kind of image is this (receipt, notice, menu, street, other)?\nMark anything you cannot read clearly as [unclear].",
      },
      result: "The extracted text of the bill (shop name, items, prices, total), a list such as 'shop logo - top-centre; item table - centre; total amount - bottom-right; QR code - bottom-left', and the classification 'receipt'. Blurry parts are marked [unclear].",
      explanation: "One multimodal model performed OCR, a detection-style description and classification. Dedicated detection models (like YOLO) give exact pixel boxes and run in real time; chat assistants give descriptive answers. Asking it to mark unclear text reduces made-up (hallucinated) characters.",
    },
  ],
  tools: [
    { name: "Claude / ChatGPT / Gemini (image upload)", use: "Sentiment, NER, OCR and image description with a single prompt", url: "https://claude.ai" },
    { name: "Google Lens", use: "Quick OCR (copy text from photos), object and product recognition", url: "https://lens.google" },
    { name: "Hugging Face", use: "Browse ready-made sentiment, NER and image-classification models (Day 41)", url: "https://huggingface.co" },
    { name: "Python IDE (in-app)", use: "Run the mini NLP and vision demos", url: "/tools/python-ide" },
  ],
  interview: [
    { q: "What is NLP?", a: "Natural Language Processing is the branch of AI that enables computers to understand, interpret and generate human language, for tasks like classification, translation, summarisation and chat.", level: "Easy" },
    { q: "What is sentiment analysis? Give a business use.", a: "Classifying text by the opinion or emotion expressed (positive/negative/neutral). Businesses use it to analyse product reviews, social media mentions and support tickets at scale.", level: "Easy" },
    { q: "What is Named Entity Recognition?", a: "An NLP task that finds and labels named items in text, such as PERSON, ORGANIZATION, LOCATION, DATE and MONEY. Used in resume parsing, document processing and search.", level: "Easy" },
    { q: "Why is sentiment analysis hard?", a: "Sarcasm, negation ('not bad'), mixed opinions, slang, emojis, domain-specific words and context ('unpredictable' is good for a movie plot, bad for a car's brakes).", level: "Medium" },
    { q: "How does a computer represent an image?", a: "As a grid of pixel values. Grayscale uses one number per pixel (0-255); colour images use three channels (RGB), so each pixel has three numbers.", level: "Easy" },
    { q: "Image classification vs object detection vs segmentation?", a: "Classification gives one label for the whole image. Detection finds each object with a class and a bounding box. Segmentation assigns a class to every pixel.", level: "Medium" },
    { q: "What is OCR and where is it used?", a: "Optical Character Recognition converts text in images or scanned documents into machine-readable text. Used in invoice processing, KYC document reading, number-plate recognition and digitising books.", level: "Easy" },
    { q: "What is tokenization?", a: "Splitting text into smaller units (tokens) such as words, sub-words or characters so a model can convert them to numbers. LLMs use sub-word tokenization.", level: "Medium" },
    { q: "Why are CNNs used for images?", a: "Convolutional filters detect local patterns like edges and textures and reuse the same filter across the image, so they learn visual features efficiently and are robust to position changes.", level: "Medium" },
    { q: "When would you use a small dedicated model instead of an LLM for NLP?", a: "When you need very low cost, low latency, high volume, on-device or offline processing, or strict consistency on a narrow task (for example classifying millions of tickets). LLMs are better for flexible tasks with little training data.", level: "Hard" },
  ],
  practice: [
    { task: "Add 5 new positive and 5 new negative words to the sentiment demo and test 3 reviews of your own.", hint: "Edit the positive and negative sets.", solution: "For example add 'awesome', 'smooth', 'worth', 'perfect', 'friendly' and 'rude', 'expensive', 'damaged', 'worst', 'useless'. Reviews using these words now get non-zero scores. Note how the coverage depends entirely on your word lists." },
    { task: "Write a prompt that extracts NER from a news paragraph and returns JSON with keys persons, organizations, locations, dates.", hint: "Specify the output format exactly and say 'return JSON only'.", solution: "Prompt: 'Extract named entities from the text below. Return JSON only with keys persons, organizations, locations, dates, each a list of strings. If none, use an empty list. Text: ...'. Test it in the AI Prompt Lab (/tools/ai-lab)." },
    { task: "Add a diagonal-line image to the vision demo. What does it predict and why?", hint: "Count rows and columns with ink.", solution: "A diagonal has ink in all 5 rows and all 5 columns, so the features are (5, 5) and it is predicted as 'plus' - wrong. Hand-crafted features are not enough; learned features (CNN) are needed." },
    { task: "Upload a photo of a handwritten note to a chat assistant and ask for OCR. Count how many words it got right.", hint: "Handwriting is harder than print.", solution: "Typically printed text is near perfect while messy handwriting has some errors. Report accuracy = correct words / total words and note which letters caused trouble." },
    { task: "For each scenario, name the NLP/CV task: (a) sort support emails into departments (b) count cars at a signal (c) read a scanned invoice (d) find company names in news.", hint: "Use today's task names.", solution: "(a) text classification (b) object detection (c) OCR (often plus NER/extraction) (d) Named Entity Recognition." },
  ],
  quiz: [
    { question: "Finding 'Pune' as a LOCATION in a sentence is called:", options: ["Sentiment analysis", "Named Entity Recognition", "OCR", "Segmentation"], answer: 1, explanation: "NER labels named things like people, places and dates." },
    { question: "Drawing boxes around every car in an image is:", options: ["Image classification", "OCR", "Text classification", "Object detection"], answer: 3, explanation: "Detection gives a class and a bounding box for each object." },
    { question: "A grayscale pixel value of 0 means:", options: ["Black", "White", "Red", "Transparent"], answer: 0, explanation: "0 = black, 255 = white in 8-bit grayscale." },
    { question: "Which task converts a scanned invoice into editable text?", options: ["NER", "Segmentation", "OCR", "Sentiment analysis"], answer: 2, explanation: "Optical Character Recognition reads text from images." },
    { question: "Why did our simple sentiment demo fail on sarcasm?", options: ["Python is too slow", "It only counts words and ignores context and tone", "It uses too much data", "Sentiment cannot be computed"], answer: 1, explanation: "Word counting ignores context; learned models and LLMs handle context better." },
  ],
};
