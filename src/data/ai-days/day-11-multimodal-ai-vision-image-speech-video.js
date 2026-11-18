const numbersDemo = `# Multimodal AI sees everything as numbers. Image = grid of pixels, audio = list of samples.
import math

# A 4x4 grayscale image (0 = black, 255 = white)
image = [
    [0,   50,  100, 150],
    [50,  255, 255, 50],
    [50,  255, 255, 50],
    [0,   50,  50,  0],
]
flat = [p for row in image for p in row]
print("Pixels:", len(flat), "| average brightness:", sum(flat) / len(flat))
print("Brightened:", [min(255, p + 100) for p in image[0]])
print("Flipped row 0:", image[0][::-1])

# Audio: 1 millisecond of a 440 Hz tone sampled 8,000 times per second
rate, freq = 8000, 440
samples = [round(math.sin(2 * math.pi * freq * n / rate), 2) for n in range(8)]
print("First 8 audio samples:", samples)
print("Samples in 3 seconds of audio:", rate * 3)

# Text: characters become numbers too (real models use tokens instead)
print("Text 'Hi' as numbers:", [ord(c) for c in "Hi"])
`;

export default {
  id: "day-11-multimodal-ai-vision-image-speech-video",
  title: "Multimodal AI: vision, image generation, speech-to-text, text-to-speech, video",
  module: "Module 2: Generative AI & Large Language Models",
  day: 11,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Multimodal AI works with more than one type of data - text, images, audio and video. Learn how models 'see' images (vision / image understanding), how image generators create pictures from text (diffusion), how speech-to-text and text-to-speech work, and what AI video tools can do. Practise with chat assistants and a pure-Python demo showing that every modality becomes numbers.",
  objectives: [
    "Define multimodal AI and list its input and output modalities",
    "Use vision features of chat assistants to understand images, charts and documents",
    "Explain how diffusion-based image generation works in simple terms",
    "Describe speech-to-text (STT) and text-to-speech (TTS) and their uses",
    "Understand AI video generation and the ethics of synthetic media",
  ],
  theory: [
    {
      heading: "What is multimodal AI?",
      content: "A modality is a type of data: text, image, audio, video. Early AI models handled one modality each. Multimodal AI can take in and/or produce several modalities - for example you upload a photo of a broken appliance and ask in text 'what is wrong?', or you speak to an assistant and it speaks back.\n\n Inputs:  text | image | audio | video | documents (PDF)\n            \\      |       |       |       /\n             [ multimodal model ]\n            /      |       |       \\\n Outputs: text | image | speech | video\n\nAnalogy: humans are multimodal - we read, look, listen and talk, and combine them to understand the world. Multimodal AI moves computers closer to that.",
      points: [
        "Vision-language models: image + text in, text out (Claude, GPT models, Gemini can read images)",
        "Text-to-image: text in, image out (Midjourney, DALL-E, Adobe Firefly, Imagen in Gemini)",
        "Speech-to-text (STT/ASR): audio in, text out (Whisper, Otter.ai, YouTube captions)",
        "Text-to-speech (TTS): text in, natural voice out (ElevenLabs, built-in voices in assistants)",
        "Text/image-to-video: Runway, Synthesia (avatar presenters), and other video models",
      ],
    },
    {
      heading: "Everything becomes numbers (and then tokens)",
      content: "Models only work with numbers. Each modality is converted:\n- Text -> tokens -> vectors (Day 8, 12)\n- Image -> pixel grid (height x width x 3 colours) -> split into small patches (for example 16x16 pixels) -> each patch becomes a vector, like a 'visual token'\n- Audio -> a list of amplitude samples (for example 16,000 per second) -> often converted to a spectrogram (a picture of frequencies over time) -> vectors\n- Video -> a sequence of image frames (+ audio)\n\nOnce everything is vectors, a Transformer can attend across text tokens and image patches together. That is how a model can answer 'what is the total on this receipt?'",
      tip: "Images and audio use tokens too, so large images, long audio and video increase cost and context usage.",
    },
    {
      heading: "Vision: understanding images, charts and documents",
      content: "Modern chat assistants can analyse uploaded images and PDFs. This is incredibly useful in daily work - but always double-check numbers and small text.",
      points: [
        "Describe and caption images; answer questions about them",
        "Read text from photos and scans (OCR) and extract tables into Excel-ready format",
        "Explain charts and dashboards ('what trend does this sales chart show?')",
        "Convert a whiteboard sketch or screenshot into code, a diagram or notes",
        "Limits: can miscount objects, misread tiny or handwritten text, and misjudge exact positions; do not rely on it for medical or safety decisions without experts",
      ],
    },
    {
      heading: "Image generation: how diffusion works",
      content: "Most popular image generators use diffusion models. Training: take millions of images with captions, add random noise step by step until each image becomes pure static, and train a network to predict and remove the noise at each step. Generation: start from pure random noise and repeatedly remove noise, guided by your text prompt, until a clear image appears.\n\n static noise -> blurry shapes -> rough scene -> detailed image   (guided by: 'a red bicycle on a beach at sunset')\n\nAnalogy: a sculptor starts with a rough block and chips away until a statue appears; your prompt tells the sculptor what to carve.",
      points: [
        "Good image prompts: subject, setting, style, lighting, composition, mood, what to avoid",
        "Editing features: inpainting (change part of an image), outpainting (extend the image), style transfer, background removal",
        "Common weaknesses: text inside images, hands and fingers, exact counts, consistent characters across images (improving quickly)",
        "Ethics: do not generate images of real people without consent; check the tool's licence for commercial use; some tools add watermarks or content credentials",
      ],
    },
    {
      heading: "Speech-to-text and text-to-speech",
      content: "Speech-to-text (STT), also called automatic speech recognition (ASR), turns spoken audio into text. Text-to-speech (TTS) turns text into natural-sounding speech. Voice assistants combine both: STT -> LLM -> TTS.\n\n You speak -> [STT] -> text -> [LLM] -> reply text -> [TTS] -> assistant speaks",
      points: [
        "STT uses: meeting transcripts (Otter.ai, Teams/Zoom captions), YouTube auto-captions, voice typing, call-centre analytics, accessibility for people with hearing loss",
        "TTS uses: audiobooks, video voice-overs, accessibility for visually impaired users, IVR phone systems, language learning",
        "Popular tools: OpenAI Whisper (open-source STT), Google speech services, ElevenLabs (TTS and voice), Microsoft Azure Speech",
        "Challenges: accents, background noise, mixed languages (Hinglish), technical terms, speaker identification",
        "Voice cloning can copy a person's voice from a short sample - powerful for dubbing but a major scam risk; always get consent (Day 25)",
      ],
    },
    {
      heading: "AI video",
      content: "AI video tools generate or edit video from text, images or existing clips. Categories:",
      points: [
        "Text/image-to-video generation: create short clips from a prompt (Runway and other video models)",
        "Avatar presenter videos: a digital presenter reads your script in many languages (Synthesia, HeyGen)",
        "AI editing: remove filler words by editing the transcript, auto-captions, background removal (Descript, CapCut)",
        "Understanding video: summarise a lecture video, find the moment something happens (some assistants like Gemini can analyse video)",
        "Responsible use: label synthetic media, never impersonate real people, be aware of deepfake misuse",
      ],
      tip: "Video generation uses a lot of compute; free tiers usually have short clip limits and watermarks.",
    },
  ],
  examples: [
    {
      title: "Every modality is just numbers (pure Python)",
      scenario: "See how an image, an audio clip and text all become lists of numbers that a model can process.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Image: see the pixel count, average brightness, a brightened row and a flipped row",
        "Audio: see the first 8 samples of a sine wave tone and how many samples 3 seconds needs",
        "Text: see the characters 'Hi' as numbers",
      ],
      code: numbersDemo,
      python: { files: { "main.py": numbersDemo }, stdin: "" },
      result: `Pixels: 16 | average brightness: 101.25
Brightened: [100, 150, 200, 250]
Flipped row 0: [150, 100, 50, 0]
First 8 audio samples: [0.0, 0.34, 0.64, 0.86, 0.98, 0.99, 0.88, 0.66]
Samples in 3 seconds of audio: 24000
Text 'Hi' as numbers: [72, 105]`,
      explanation: "Image editing like 'brighten' or 'flip' is just arithmetic on pixel numbers (capped at 255). Audio is a list of air-pressure samples - 8,000 per second here, so 3 seconds = 24,000 numbers (real recordings often use 16,000-48,000 per second). Text becomes numbers too (real models use tokens, not single characters). A multimodal model converts all of these into vectors so a single Transformer can reason across them.",
    },
    {
      title: "Vision: analyse a chart or receipt with a chat assistant",
      scenario: "Upload an image of a chart (or a receipt) and get insights plus extracted data you can paste into Excel.",
      steps: [
        "Take a screenshot of any simple chart (for example from Excel, Power BI or a news article) - avoid confidential data",
        "Open claude.ai (or ChatGPT / Gemini) and click the attach / image button",
        "Upload the image and paste the prompt below",
        "Copy the table into Excel and compare a few values with the original chart",
        "Note any values the AI misread",
      ],
      code: `Look at the attached chart image.
1. What type of chart is it, and what are the axes?
2. Extract the data points as a table (Category | Value). If a value is estimated from the bar height, mark it with ~.
3. Give 3 key insights in one line each.
4. What is one thing the chart does NOT tell us?`,
      prompt: {
        system: "You are a data analyst. When reading values from images, mark estimates clearly and never invent data that is not visible.",
        user: "(Attach a chart image in your chat app.)\nLook at the attached chart image.\n1. What type of chart is it, and what are the axes?\n2. Extract the data points as a table (Category | Value). If a value is estimated from the bar height, mark it with ~.\n3. Give 3 key insights in one line each.\n4. What is one thing the chart does NOT tell us?",
      },
      result: "For example: 'Clustered bar chart - x-axis: months, y-axis: sales (lakh)'; a table with values like Jan ~12, Feb ~15, Mar 18 (labelled); insights such as 'March is highest, February to March grew most'; and a limitation like 'it does not show profit or reasons for the change'.",
      explanation: "Vision models can turn images into structured data and insights in seconds. Asking it to mark estimates (~) separates read values from guesses - always check important numbers against the source.",
    },
    {
      title: "Speech-to-text and text-to-speech round trip",
      scenario: "Record yourself, transcribe it, summarise it with an LLM, and listen to the summary - the full voice-assistant pipeline.",
      steps: [
        "Record a 30-second voice note on your phone explaining what you learned this week (mixing English and Hindi/Marathi is fine)",
        "Transcribe it: use voice typing in Google Docs (Tools > Voice typing), or upload the audio to an assistant that accepts audio, or use Otter.ai (free tier available)",
        "Paste the transcript into claude.ai (or ChatGPT / Gemini) with the prompt below",
        "Paste the summary into a TTS tool (for example the 'read aloud' feature in Microsoft Edge, or ElevenLabs free tier) and listen",
        "Note any words the transcription got wrong (names, technical terms, mixed language)",
      ],
      code: `Here is a raw voice transcript (it may contain errors, filler words and mixed languages):
"""
[paste transcript here]
"""
1. Clean it into correct English sentences, keeping the meaning.
2. Write a 3-bullet summary.
3. List any words that look like transcription errors and your best guess for each, marked as a guess.`,
      prompt: {
        system: "You clean up speech transcripts. Keep meaning, mark guesses clearly, never add facts.",
        user: "Here is a raw voice transcript (it may contain errors, filler words and mixed languages):\n\"\"\"\num so this week I learnt about uh neural networks and the the back propogation thing, and also transformer models jo attention use karte hai, and RHLF\n\"\"\"\n1. Clean it into correct English sentences, keeping the meaning.\n2. Write a 3-bullet summary.\n3. List any words that look like transcription errors and your best guess for each, marked as a guess.",
      },
      result: "Clean text such as 'This week I learned about neural networks and backpropagation, and also about Transformer models, which use attention, and RLHF.' plus a 3-bullet summary and a list like 'propogation -> propagation (guess)', 'RHLF -> RLHF (guess)'.",
      explanation: "This is the STT -> LLM -> TTS pipeline used by voice assistants and meeting tools. Transcription often struggles with technical words and code-mixed speech, so an LLM clean-up step plus human review improves quality.",
    },
    {
      title: "Create an image, then describe it back (generation + vision)",
      scenario: "Use one model to generate an image and another (or the same) to describe it - a fun way to check whether the image matches your intent.",
      steps: [
        "Open an image generator (ChatGPT image generation, Gemini, Adobe Firefly, Canva AI or Microsoft Designer)",
        "Paste the image prompt from the code block below and generate an image",
        "Download the image",
        "Open claude.ai (or another assistant), upload the image and paste the checking prompt (shown in the prompt field)",
        "Compare its description with your original prompt - what was missed?",
      ],
      code: `IMAGE PROMPT:
A cosy study desk by a window at night, a laptop showing colourful charts, a cup of chai with steam, a small green plant, warm lamp light, rain on the window, digital illustration, soft colours, no text.

CHECKING PROMPT (with the generated image attached):
Describe this image in detail. Then check it against this list and mark each Yes/No: laptop with charts, cup of chai with steam, green plant, warm lamp light, rain on window, night time, no text in image.`,
      prompt: {
        system: "You are a precise image reviewer. Only report what is actually visible.",
        user: "(Attach the generated image in your chat app.)\nDescribe this image in detail. Then check it against this list and mark each Yes/No: laptop with charts, cup of chai with steam, green plant, warm lamp light, rain on window, night time, no text in image.",
      },
      result: "A detailed description plus a checklist, for example: laptop with charts - Yes; chai with steam - Yes; plant - Yes; lamp light - Yes; rain on window - Yes; night - Yes; no text - No (the laptop screen shows random letters).",
      explanation: "Generation and understanding are two sides of multimodal AI. Using a vision model as an automatic checker is a real technique used to evaluate image generators - and it trains you to write precise prompts.",
    },
  ],
  tools: [
    { name: "Claude / ChatGPT / Gemini", use: "Upload images and PDFs for analysis; some support voice conversations", url: "https://claude.ai" },
    { name: "Adobe Firefly", use: "Text-to-image generation and editing", url: "https://firefly.adobe.com" },
    { name: "Midjourney", use: "High-quality artistic image generation (paid plans)", url: "https://www.midjourney.com" },
    { name: "Otter.ai", use: "Speech-to-text meeting transcription", url: "https://otter.ai" },
    { name: "ElevenLabs", use: "Text-to-speech and voice generation", url: "https://elevenlabs.io" },
    { name: "Runway", use: "AI video generation and editing", url: "https://runwayml.com" },
    { name: "Synthesia", use: "AI avatar presenter videos from a script", url: "https://www.synthesia.io" },
  ],
  interview: [
    { q: "What is multimodal AI?", a: "AI that can process and/or generate multiple data types - text, images, audio, video - and combine information across them, such as answering text questions about an image.", level: "Easy" },
    { q: "How does a model process an image?", a: "The image is a grid of pixel values; vision transformers split it into patches, convert each patch into a vector (like a token), add position information and process them with attention, often together with text tokens.", level: "Medium" },
    { q: "Explain diffusion models simply.", a: "During training, noise is gradually added to images and the model learns to remove it. To generate, it starts with random noise and denoises step by step, guided by the text prompt, until an image forms.", level: "Medium" },
    { q: "What is the difference between STT and TTS?", a: "Speech-to-text converts spoken audio into written text; text-to-speech converts written text into synthetic spoken audio.", level: "Easy" },
    { q: "Name challenges in speech recognition.", a: "Accents, background noise, overlapping speakers, code-mixed languages, domain-specific vocabulary, and low-quality microphones.", level: "Medium" },
    { q: "Give three business uses of vision-language models.", a: "Extracting data from invoices and receipts, analysing charts and screenshots, product image tagging, visual quality inspection support, and accessibility (describing images).", level: "Easy" },
    { q: "Why are images and video expensive for LLM APIs?", a: "They are converted into many tokens (patches/frames), increasing input size, compute and cost; video multiplies this by the number of frames.", level: "Medium" },
    { q: "What are the risks of voice cloning?", a: "Impersonation scams, fraud, misinformation and privacy violations. Mitigations include consent, watermarking, verification procedures and laws on deepfakes.", level: "Medium" },
    { q: "Why do image generators struggle with text in images?", a: "They generate pixels from learned visual patterns rather than spelling with characters; small, precise letter shapes are hard to get right, though newer models are improving.", level: "Hard" },
    { q: "Describe the architecture of a voice assistant.", a: "Speech-to-text converts the user's voice to text, an LLM generates a reply (possibly using tools), and text-to-speech speaks it back. Some newer systems process audio end-to-end for lower latency.", level: "Hard" },
  ],
  practice: [
    { task: "Modify the Python demo: darken the image by 50 (minimum 0) and print the new average brightness.", hint: "Use max(0, p - 50) for every pixel.", solution: "darker = [max(0, p - 50) for p in flat]; print(sum(darker) / len(darker)). Pixels below 50 cannot go under 0, so the average drops by less than 50: it prints 60.625 (down from 101.25)." },
    { task: "Take a photo of a page from your notebook and ask an assistant to convert it into neat typed notes with headings.", hint: "Ask it to mark unclear words as [unclear].", solution: "You get structured notes; compare with the original and count any misread words - handwriting quality strongly affects accuracy." },
    { task: "Write 3 image prompts for the same idea (a 'Study Buddy' app mascot) in 3 styles: cartoon, 3D render, watercolour. Generate them in one tool.", hint: "Keep subject the same, change only the style line.", solution: "The subject stays consistent while style changes dramatically, showing how much the style keywords control output." },
    { task: "Use voice typing (Google Docs or your phone keyboard) to dictate a 5-sentence paragraph with 2 technical terms. Measure word accuracy.", hint: "Accuracy = correct words / total words.", solution: "Typical results: common words near perfect; technical terms (e.g. 'backpropagation', 'RLHF') more likely to be wrong. Add punctuation by saying 'comma' and 'full stop'." },
    { task: "Make a table of 6 multimodal tools: Tool | Input modality | Output modality | One use case.", hint: "Use the tools list and the AI Tools Directory (/tools/ai-tools).", solution: "Example: Claude | text, image, PDF | text | analyse a chart. Midjourney | text, image | image | poster art. Otter.ai | audio | text | meeting notes. ElevenLabs | text | audio | voice-over. Runway | text, image, video | video | short clip. Synthesia | text | video | training video with avatar." },
  ],
  quiz: [
    { question: "Turning a recorded lecture into written notes uses:", options: ["Text-to-speech", "Speech-to-text", "Diffusion", "Image classification"], answer: 1, explanation: "STT converts audio into text." },
    { question: "Diffusion image generators create images by:", options: ["Gradually removing noise guided by the prompt", "Searching the internet for a matching photo", "Drawing with vectors only", "Copying the closest training image"], answer: 0, explanation: "They denoise step by step from random noise." },
    { question: "A model that answers text questions about an uploaded photo is a:", options: ["Text-to-speech model", "k-means model", "Vision-language (multimodal) model", "Spreadsheet macro"], answer: 2, explanation: "It combines image and text understanding." },
    { question: "Why might a long video cost more to analyse than a short text?", options: ["Videos are always copyrighted", "Text is free", "Videos cannot be tokenized", "Video frames become many tokens, using more compute"], answer: 3, explanation: "Every frame adds visual tokens." },
    { question: "Which is the most responsible use of voice cloning?", options: ["Cloning a celebrity for an ad without permission", "Dubbing your own course videos into Hindi with your own voice and consent", "Calling relatives with a cloned voice as a prank", "Faking a CEO's voice to approve payments"], answer: 1, explanation: "Consent and honest use are essential." },
  ],
};
