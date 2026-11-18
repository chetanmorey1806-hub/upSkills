export default {
  id: "day-25-ai-audio-video-tools",
  title: "AI for Audio & Video: ElevenLabs, Runway, Synthesia, Descript, CapCut AI and the Ethics of Voice/Face Cloning",
  module: "Module 4: AI Tools for Productivity",
  day: 25,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn how AI creates and edits audio and video: text-to-speech and voice cloning (ElevenLabs), text/image-to-video generation (Runway), AI presenter videos (Synthesia), editing video by editing text (Descript), and quick social-media editing with auto-captions (CapCut AI). Finish with the consent, disclosure and deepfake rules every professional must follow.",
  objectives: [
    "Explain the main AI audio/video tasks: text-to-speech, voice cloning, speech-to-text, text-to-video, avatar video and AI editing",
    "Pick the right tool (ElevenLabs, Runway, Synthesia, Descript, CapCut) for a given job",
    "Write a video script and a shot-by-shot prompt that AI video tools can follow",
    "Produce a short narrated explainer video end-to-end using free tiers",
    "Apply consent, disclosure and copyright rules for synthetic voices and faces"
  ],
  theory: [
    {
      heading: "The AI audio and video toolbox – what each task means",
      content: "Think of a traditional video studio: a script writer, a voice artist, a camera crew, an actor, an editor and a subtitle person. AI tools now help with each of these roles. Text-to-speech (TTS) turns written text into natural speech. Voice cloning creates a synthetic copy of a specific person's voice from sample recordings. Speech-to-text (transcription) turns audio into text, which is the base of auto-captions. Text-to-video and image-to-video models generate short new clips from a description or a still picture. Avatar video tools put a digital presenter on screen who speaks your script. AI editing tools remove filler words, silences and background noise, or let you edit the video by editing its transcript.",
      points: [
        "Text-to-speech: script -> narration (ElevenLabs, also built into Canva, CapCut, Microsoft and Google tools)",
        "Voice cloning: a few minutes of a consenting speaker -> a reusable synthetic voice",
        "Speech-to-text: audio -> transcript and captions (Descript, CapCut, Otter.ai, Whisper-based tools)",
        "Text/image-to-video: prompt or picture -> a few seconds of generated footage (Runway, also Google Veo, OpenAI Sora, Pika, Kling)",
        "Avatar video: script -> a presenter speaking it, in many languages (Synthesia, HeyGen)",
        "AI editing: remove 'um/uh', fix audio, auto-reframe for Reels/Shorts, auto-captions (Descript, CapCut)"
      ],
      tip: "AI does not replace the script. A weak script with perfect AI voice is still a weak video. Always write (or AI-draft and then edit) the script first."
    },
    {
      heading: "ElevenLabs – realistic AI voices and dubbing",
      content: "ElevenLabs is a voice AI platform. You paste text, choose a voice from a library, and download an MP3 of natural-sounding narration. It also offers voice cloning (only of your own voice or with written consent), dubbing (translating a video's speech into other languages while keeping a similar voice), sound effects from text, and speech-to-text. Good uses: course narration, YouTube voice-overs, audiobook drafts, IVR phone messages, accessibility audio for blog posts.",
      points: [
        "How to use: 1) Sign up at elevenlabs.io (free tier available). 2) Open Text to Speech. 3) Choose a voice and a model. 4) Paste your script (short paragraphs work best). 5) Adjust stability/similarity/style sliders if offered. 6) Click Generate, listen, then download MP3.",
        "Punctuation controls pacing: commas create small pauses, full stops create longer pauses, new paragraphs create breaks",
        "Spell tricky words the way they sound (e.g. 'Pune' as 'Poo-nay') if the voice mispronounces them",
        "Check the plan's licence: free tiers often require attribution and may not allow commercial use"
      ]
    },
    {
      heading: "Runway and Synthesia – generating video",
      content: "Runway is a creative video suite. Its generation models turn a text prompt or an image into a short video clip (a few seconds), and it has AI editing tools like background removal, motion tracking and inpainting. Use it for B-roll (background footage), product mood shots and concept visuals – not for long, story-accurate scenes. Synthesia creates 'talking presenter' videos: you choose an AI avatar, paste a script, choose a language, and it renders a video of the avatar speaking. Companies use it for training, onboarding and internal how-to videos because updating the script is far cheaper than reshooting.",
      points: [
        "Runway how-to: 1) Sign in at runwayml.com. 2) Choose a video generation tool (text-to-video or image-to-video). 3) Upload a reference image (optional) and write a prompt: subject + action + camera + lighting + style. 4) Choose duration/aspect ratio. 5) Generate, review, regenerate or extend. 6) Download and edit in your editor.",
        "Synthesia how-to: 1) Sign in at synthesia.io. 2) Create video -> pick a template. 3) Choose an avatar and voice/language. 4) Paste the script scene by scene. 5) Add slides, text, screen recordings. 6) Generate and share or download.",
        "Video prompt formula: [subject] [doing what] in [setting], [camera move], [lighting], [style], [duration]",
        "Generated clips can contain errors (extra fingers, warped text, physics mistakes) – always review frame by frame"
      ],
      syntax: "Prompt: A steaming cup of masala chai on a wooden table near a rainy window, slow push-in camera, warm morning light, cinematic, shallow depth of field, 5 seconds"
    },
    {
      heading: "Descript and CapCut AI – editing made easy",
      content: "Descript transcribes your audio/video and shows it as a document. Deleting a sentence in the text deletes it from the video – like editing a Word file instead of cutting a timeline. It can remove filler words in one click, improve voice quality ('Studio Sound'), and fix a misspoken word using an AI voice (only with the speaker's permission). CapCut (by ByteDance) is a popular mobile and desktop editor for short-form video with auto-captions, templates, background removal, auto-reframe for 9:16, AI effects and text-to-speech voices.",
      points: [
        "Descript how-to: 1) Install the app or open web version at descript.com. 2) New project -> import your recording. 3) Wait for transcription. 4) Delete text to cut video; use 'Remove filler words'. 5) Apply Studio Sound. 6) Add captions and export.",
        "CapCut how-to: 1) Open CapCut (mobile, desktop or web). 2) New project -> import clips. 3) Text -> Auto captions -> choose language -> Generate. 4) Edit caption mistakes. 5) Use Auto reframe / Remove background if needed. 6) Export 1080p in 9:16 for Reels/Shorts.",
        "Always proofread auto-captions – names, numbers and technical terms are commonly wrong",
        "Check music licences in templates before using them for business content"
      ]
    },
    {
      heading: "Ethics and law of voice and face cloning",
      content: "Synthetic voices and faces are powerful and easily misused for fraud ('Hi Mom, I lost my phone, send money'), fake endorsements, political misinformation and harassment. Professional rules are simple: get informed, written consent before cloning anyone's voice or likeness; never imitate real public figures; disclose AI-generated or AI-altered media to your audience; follow platform labelling rules (YouTube, Instagram and others ask creators to label realistic synthetic content); respect copyright of music, footage and scripts; and keep originals plus a record of consent. Many countries are adding laws about deepfakes and personality rights, so check your local rules and your company policy.",
      points: [
        "Consent: written permission from the person whose voice/face is used, stating where and how long it will be used",
        "Disclosure: say 'This video uses an AI-generated voice/avatar' in the description or on screen",
        "No impersonation of real people, celebrities or officials, even as a joke",
        "Security: families and companies should agree a 'code word' to verify urgent voice-call requests",
        "Detection is imperfect – watermarking and content credentials (C2PA) help but are not foolproof"
      ],
      tip: "A good rule: if the person in the voice/video would be surprised or upset to see it, do not publish it."
    }
  ],
  examples: [
    {
      title: "Write a 60-second explainer script with AI, then narrate it",
      scenario: "Your college club needs a 60-second voice-over explaining 'What is UPI?' for an Instagram Reel.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below and send it",
        "Read the script aloud once and fix anything that sounds unnatural",
        "Open elevenlabs.io -> Text to Speech, choose a clear voice",
        "Paste only the narration lines (not the scene notes) and click Generate",
        "Download the MP3 and import it into CapCut with your visuals"
      ],
      code: "You are a scriptwriter for short educational Reels.\nWrite a 60-second voice-over script explaining 'What is UPI?' to first-year college students in India.\nFormat: a table with columns Time | Narration | On-screen visual.\nRules: max 150 words of narration, simple English, one real-life example (splitting a canteen bill), end with a one-line safety tip about never sharing your UPI PIN.",
      prompt: {
        system: "You are a scriptwriter for short educational Reels. You write tight, friendly scripts with clear visuals.",
        user: "Write a 60-second voice-over script explaining 'What is UPI?' to first-year college students in India. Format: a table with columns Time | Narration | On-screen visual. Rules: max 150 words of narration, simple English, one real-life example (splitting a canteen bill), end with a one-line safety tip about never sharing your UPI PIN."
      },
      result: "A table like:\n0-5s | Ever split a canteen bill in seconds? That's UPI. | Friends at canteen table, phones out\n5-20s | UPI – Unified Payments Interface – links your bank account to apps like ... | Animated bank -> phone arrow\n...\n55-60s | Remember: you only enter your PIN to SEND money. Never share it. | Lock icon + text 'Never share your PIN'",
      explanation: "Splitting the script into Time, Narration and Visual keeps narration within 150 words (about 60 seconds at normal speaking speed) and gives you a shot list for editing. The narration column is what you paste into ElevenLabs."
    },
    {
      title: "Prompting Runway for B-roll clips",
      scenario: "A cafe owner wants three 5-second background clips for an Instagram ad without hiring a videographer.",
      steps: [
        "Open claude.ai and paste the prompt below to get three structured video prompts",
        "Sign in to runwayml.com and open a text-to-video (or image-to-video) generator",
        "Paste prompt 1, set aspect ratio 9:16 and a 5-second duration, click Generate",
        "Review the clip; if hands, text or logos look wrong, simplify the prompt and regenerate",
        "Repeat for prompts 2 and 3, download all clips",
        "Combine them in CapCut with the cafe's real logo and text added in the editor (not generated)"
      ],
      code: "Create 3 text-to-video prompts for a cozy cafe ad (vertical 9:16, 5 seconds each).\nUse this formula for each: subject + action + setting + camera movement + lighting + style.\nAvoid: readable text, logos, real people's faces, brand names.\nReturn as a numbered list, one line per prompt.",
      prompt: {
        system: "You are a video director who writes precise prompts for AI video generators.",
        user: "Create 3 text-to-video prompts for a cozy cafe ad (vertical 9:16, 5 seconds each). Use this formula for each: subject + action + setting + camera movement + lighting + style. Avoid: readable text, logos, real people's faces, brand names. Return as a numbered list, one line per prompt."
      },
      result: "1. Barista's hands pouring latte art into a white cup on a wooden counter, slow overhead push-in, warm golden morning light, cinematic shallow depth of field\n2. Steam rising from fresh croissants on a tray by a rainy window, gentle side dolly, soft natural light, cozy film look\n3. Coffee beans tumbling into a grinder in slow motion, macro close-up, moody backlight, rich brown tones",
      explanation: "Video models respond best to concrete visual nouns and camera language. Text and logos are often rendered badly by generators, so you add them later in the editor where they are crisp and accurate."
    },
    {
      title: "Clean a recorded lecture with Descript and caption it",
      scenario: "A teacher recorded a 10-minute lecture with many 'umm's, a long silence and room echo.",
      steps: [
        "Open Descript and create a new project",
        "Import the lecture video and wait for automatic transcription",
        "Click 'Remove filler words' and review the suggested cuts before applying",
        "Use 'Shorten word gaps' to remove long silences",
        "Apply Studio Sound to reduce echo and background noise",
        "Proofread the transcript (names, numbers), then add captions and export MP4 plus an SRT caption file"
      ],
      code: "Descript workflow checklist\n[ ] Import media -> transcript ready\n[ ] Remove filler words (review list first)\n[ ] Shorten word gaps > 1.5 s\n[ ] Studio Sound ON\n[ ] Proofread: names, numbers, technical terms\n[ ] Captions style: 2 lines max, high contrast\n[ ] Export: MP4 1080p + SRT",
      result: "A tighter lecture (often noticeably shorter after removing fillers and gaps) with clearer audio and an accurate caption file the teacher can upload to YouTube or the LMS.",
      explanation: "Text-based editing makes cuts as easy as deleting words. Exporting a separate SRT file makes captions searchable and accessible, and lets platforms show them in the viewer's preferred style."
    },
    {
      title: "Create a consent and disclosure template for voice cloning",
      scenario: "Your company wants to clone the CEO's voice for internal training videos. HR asks you to draft the paperwork.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Review the draft with HR/legal – AI drafts are a starting point, not legal advice",
        "Store signed consent with the project files",
        "Add the disclosure line to every video description"
      ],
      code: "Draft a one-page consent form for creating an AI clone of an employee's voice for internal training videos only.\nInclude: purpose, where it will be used, who can access the voice model, duration, right to withdraw consent and delete the voice, no use for external ads or impersonation, signature lines.\nAlso give a one-sentence disclosure line to show in each video.",
      prompt: {
        system: "You are an HR policy assistant. You write clear, plain-English documents and remind users to get legal review.",
        user: "Draft a one-page consent form for creating an AI clone of an employee's voice for internal training videos only. Include: purpose, where it will be used, who can access the voice model, duration, right to withdraw consent and delete the voice, no use for external ads or impersonation, signature lines. Also give a one-sentence disclosure line to show in each video."
      },
      result: "A structured consent form with headed sections (Purpose, Permitted Use, Access, Duration, Withdrawal & Deletion, Prohibited Uses, Signatures) plus a disclosure line such as: 'The narration in this video uses an AI-generated voice of [Name], created with their written consent.'",
      explanation: "Consent, limited purpose, the right to withdraw and clear disclosure are the core ethics of synthetic media. Writing them down protects both the person and the company."
    }
  ],
  tools: [
    { name: "ElevenLabs", use: "Text-to-speech narration, consented voice cloning, dubbing and sound effects. How to use: 1) Sign up (free tier available). 2) Text to Speech -> pick voice. 3) Paste script. 4) Generate and listen. 5) Download MP3.", url: "https://elevenlabs.io" },
    { name: "Runway", use: "Text/image-to-video clips and AI video editing (background removal, inpainting). How to use: 1) Sign in. 2) Choose a video generation tool. 3) Add prompt (and optional image). 4) Set duration/aspect ratio. 5) Generate, review, download.", url: "https://runwayml.com" },
    { name: "Synthesia", use: "AI avatar presenter videos for training and onboarding in many languages. How to use: 1) Create video from template. 2) Pick avatar and language. 3) Paste script per scene. 4) Add slides/media. 5) Generate and share.", url: "https://www.synthesia.io" },
    { name: "Descript", use: "Edit audio/video by editing the transcript, remove filler words, Studio Sound, captions. How to use: 1) New project. 2) Import media. 3) Edit text to cut video. 4) Remove fillers, apply Studio Sound. 5) Export video + captions.", url: "https://www.descript.com" },
    { name: "CapCut", use: "Short-form video editing with auto-captions, templates, auto-reframe and TTS voices. How to use: 1) New project. 2) Import clips. 3) Text -> Auto captions. 4) Fix caption errors. 5) Export 9:16 1080p.", url: "https://www.capcut.com" },
    { name: "Claude (claude.ai)", use: "Write scripts, shot lists, video prompts and consent templates. How to use: 1) Open claude.ai. 2) Paste a role + task + format prompt. 3) Iterate until the script reads naturally.", url: "https://claude.ai" },
    { name: "AI Tools Directory (in-app)", use: "Compare audio/video tools, see what each is for and where to start. How to use: open /tools/ai-tools and filter by Audio or Video.", url: "/tools/ai-tools" }
  ],
  interview: [
    { q: "What is the difference between text-to-speech and voice cloning?", a: "Text-to-speech converts written text into speech using a stock or designed synthetic voice. Voice cloning builds a synthetic voice that imitates a specific real person from recordings of that person. Cloning needs explicit consent because it reproduces someone's identity.", level: "Easy" },
    { q: "When would you use Synthesia instead of filming a real presenter?", a: "When content changes often (policies, product training), must be produced in many languages, or needs to be made quickly at scale. Updating a script and re-rendering is faster and cheaper than reshooting. For emotional brand storytelling, a real presenter is usually better.", level: "Easy" },
    { q: "What makes a good prompt for an AI video generator?", a: "Concrete visual details: subject, action, setting, camera movement, lighting, style, aspect ratio and duration. Avoid asking for readable text or logos, keep one main action per clip, and iterate by changing one element at a time.", level: "Medium" },
    { q: "How does Descript's text-based editing work?", a: "It transcribes the media and aligns each word with its timestamp. When you delete or move words in the transcript, Descript cuts or moves the matching segments of audio/video on the timeline.", level: "Medium" },
    { q: "What are deepfakes and how can organisations reduce deepfake fraud risk?", a: "Deepfakes are realistic synthetic or manipulated audio/video of real people. Organisations reduce risk with verification procedures (call-back on a known number, code words, multi-person approval for payments), staff awareness training, content provenance tools, and clear policies on official communication channels.", level: "Medium" },
    { q: "What legal and ethical checks do you do before publishing an AI-generated voice-over?", a: "Confirm the voice is licensed for the intended (commercial) use, have written consent if it is a cloned real voice, avoid impersonating real people, check music/footage copyright, follow platform labelling rules and add a disclosure line.", level: "Medium" },
    { q: "Why should auto-captions always be reviewed?", a: "Speech recognition makes mistakes with names, accents, numbers, jargon and overlapping speech. Wrong captions can change meaning, look unprofessional and fail accessibility requirements.", level: "Easy" },
    { q: "What is content provenance (C2PA / content credentials)?", a: "A standard for attaching tamper-evident metadata to media that records how it was created and edited, including whether AI was used. It helps viewers and platforms check origin, though metadata can be stripped, so it is not a complete solution.", level: "Hard" },
    { q: "How would you design an AI dubbing pipeline for a course in three languages?", a: "Transcribe the original, clean the transcript, translate with an LLM plus human review for terminology, generate speech in each language (consented voice or stock voice), align timing to the video, optionally lip-sync, add translated captions, then have a native speaker QA each version before publishing.", level: "Hard" }
  ],
  practice: [
    { task: "Write a 45-second script about 'How to stay safe from phishing' and generate narration in ElevenLabs.", hint: "Use a Time | Narration | Visual table and keep narration under 110 words.", solution: "Prompt Claude with role, audience, word limit and table format. Copy only the narration column into ElevenLabs Text to Speech, choose a clear voice, generate, adjust punctuation for pauses and download the MP3." },
    { task: "Create three text-to-video prompts for a college fest promo and test one in Runway (free credits).", hint: "Formula: subject + action + setting + camera + lighting + style.", solution: "Example: 'Crowd of students dancing under colourful stage lights at night, wide drone shot slowly moving forward, vibrant neon lighting, energetic festival film look, 9:16, 5 seconds'. Generate, review for distortions, regenerate with simpler wording if needed." },
    { task: "Record a 2-minute talk on your phone, then use CapCut or Descript to remove fillers and add captions.", hint: "Proofread captions for names and numbers before exporting.", solution: "Import -> transcribe/auto-captions -> remove filler words and long gaps -> fix caption errors -> apply audio enhancement -> export MP4 (and SRT in Descript)." },
    { task: "Write a disclosure policy (5 bullet points) for a YouTube channel that uses AI voices.", hint: "Cover consent, labelling, no impersonation, copyright and corrections.", solution: "1) We label videos that use AI voices or avatars. 2) We only clone voices with written consent. 3) We never imitate real public figures. 4) We only use licensed music and footage. 5) We correct errors publicly when found." },
    { task: "Use the AI Tools Directory to compare two avatar-video tools and write which you would choose for HR onboarding and why.", hint: "Compare languages supported, ease of editing, free tier and data/privacy terms.", solution: "Open /tools/ai-tools, read the Synthesia and HeyGen entries, list strengths, then justify a choice based on language needs, script editing workflow and the company's privacy requirements." }
  ],
  quiz: [
    { question: "Which tool is best known for editing video by editing its transcript?", options: ["Runway", "Descript", "Synthesia", "ElevenLabs"], answer: 1, explanation: "Descript transcribes media and lets you cut video by deleting text." },
    { question: "What must you have before cloning a colleague's voice?", options: ["A paid plan only", "A high-quality microphone only", "The person's informed, written consent", "Nothing if it is for internal use"], answer: 2, explanation: "Voice cloning reproduces someone's identity, so informed consent is required regardless of audience." },
    { question: "Which prompt detail is LEAST reliable for current AI video generators?", options: ["Camera movement", "Lighting style", "Readable text and logos inside the scene", "Setting description"], answer: 2, explanation: "Generators often distort text and logos; add them in the editor instead." },
    { question: "A company needs the same training video in 8 languages, updated every quarter. Which tool fits best?", options: ["An avatar video tool like Synthesia", "A photo filter app", "A spreadsheet", "A code editor"], answer: 0, explanation: "Avatar video tools render the same script in many languages and are easy to update." },
    { question: "Why should you proofread auto-generated captions?", options: ["Captions are always perfect", "Platforms forbid captions", "Speech recognition can get names, numbers and jargon wrong", "Captions increase file size"], answer: 2, explanation: "Transcription errors can change meaning and hurt accessibility." }
  ]
};
