export default {
  id: "day-24-ai-presentations-design",
  title: "AI for Presentations & Design: Gamma, Canva AI, Microsoft Designer, Figma AI, Image Generators (Midjourney, DALL·E, Firefly)",
  module: "Module 4: AI Tools for Productivity",
  day: 24,
  level: "Beginner",
  duration: "3 hours",
  summary: "Create presentations, social media graphics, UI mockups and images with AI: what Gamma, Canva AI, Microsoft Designer, Figma AI, Midjourney, DALL·E (ChatGPT images) and Adobe Firefly are, where professionals use them, how to use each step by step, and how to write good image prompts responsibly.",
  objectives: [
    "Explain what each major AI presentation and design tool does and when to use it",
    "Generate a presentation outline and deck with AI, then refine it for your audience",
    "Write effective image prompts (subject, style, composition, lighting, aspect ratio)",
    "Create social media graphics and UI mockups with AI tools step by step",
    "Understand copyright, commercial-use and ethical rules for AI-generated images"
  ],
  theory: [
    {
      heading: "How AI changes presentations and design work",
      content: "Making slides and graphics used to mean hours of layout, searching for images and aligning boxes. AI tools now generate a first version from a text prompt or a document: a full slide deck, a poster, a social media post, a UI screen or an original image. Your job moves to content, storytelling, brand consistency and quality checking. Analogy: AI is an assistant designer who quickly gives you five drafts; you are the creative director who picks, corrects and finalises.",
      points: [
        "Text -> slides (Gamma, Copilot in PowerPoint, Canva)",
        "Text -> designs and posters (Canva AI, Microsoft Designer)",
        "Text -> UI mockups (Figma AI)",
        "Text -> images (Midjourney, DALL·E / ChatGPT images, Adobe Firefly, Gemini image generation)",
        "AI never knows your real numbers or brand rules unless you give them"
      ]
    },
    {
      heading: "Gamma - AI presentations, documents and webpages",
      content: "Gamma (gamma.app) creates presentations, documents and simple webpages from a prompt, pasted notes or an uploaded file. It produces a full deck with layouts, images and a theme in under a minute, which you can edit card by card, restyle with themes, and export to PDF or PowerPoint or share as a link. Free tier with credits; paid plans available.",
      points: [
        "Where used: sales pitch decks, startup investor decks, training sessions, college seminars, internal project updates",
        "How to use: 1) Go to gamma.app and sign up 2) Click 'Create new' -> 'Generate' (or 'Paste in text' / 'Import file') 3) Choose Presentation, set number of cards (slides) and language 4) Enter your prompt and click 'Generate outline' 5) Edit the outline (reorder, rename, delete) 6) Choose a theme and click 'Generate' 7) Edit text, replace images, use the AI edit option on any card ('make this more visual', 'turn into a timeline') 8) Export to PDF/PPTX or share the link"
      ]
    },
    {
      heading: "Canva AI and Microsoft Designer - designs for everyone",
      content: "Canva (canva.com) is a drag-and-drop design platform for posters, social posts, presentations, videos and documents. Its AI features (Magic Studio / Canva AI) include Magic Design (generate designs from a prompt or your media), Magic Write (text), text-to-image generation, Magic Edit/Eraser/Expand (edit photos), background remover, Magic Resize (one design to many formats) and translation. Microsoft Designer (designer.microsoft.com, also inside Microsoft 365 apps) generates social posts, invitations and images from prompts and offers AI image editing.",
      points: [
        "Where used: social media managers making daily posts, small business owners creating flyers, HR making event posters, teachers making worksheets, marketers resizing one design for Instagram, LinkedIn and WhatsApp status",
        "Canva how-to: 1) canva.com -> Create a design (e.g. Instagram Post) 2) Open Magic Design / Canva AI and describe the design or upload a photo 3) Pick a generated template 4) Edit text, colours, fonts (apply Brand Kit on paid plans) 5) Use Magic Edit / Background Remover on photos 6) Use Resize to create other sizes 7) Download PNG/PDF or schedule the post",
        "Designer how-to: 1) designer.microsoft.com -> sign in with a Microsoft account 2) Choose 'Create' (e.g. social post / image) and type a description 3) Pick a design 4) Edit text and elements 5) Download or share"
      ]
    },
    {
      heading: "Figma AI - UI/UX design",
      content: "Figma is the leading collaborative tool for designing apps and websites. Figma AI features (availability depends on plan) help designers work faster: generate a first-draft UI from a text prompt, rename and organise layers, generate or rewrite placeholder text, create images, search visually for similar designs, turn static screens into interactive prototypes, and (with Figma Make) turn prompts into working prototypes.",
      points: [
        "Where used: UI/UX designers starting new screens, product managers sketching ideas, developers creating quick mockups, startup founders building MVP prototypes",
        "How to use: 1) Open figma.com and create a Design file 2) Open the Actions/AI menu 3) Use a first-draft/make feature: describe the screen, e.g. 'Login screen for a food delivery app with phone OTP' 4) Edit the generated frames - align to your design system 5) Use 'Rename layers' to clean up 6) Use 'Make prototype' to link screens 7) Share with developers for handoff"
      ]
    },
    {
      heading: "Image generators: Midjourney, DALL·E, Adobe Firefly and others",
      content: "Text-to-image models create original images from a description (Day 11). Midjourney (midjourney.com, also via Discord) is known for highly artistic, stylised images. DALL·E / GPT image generation inside ChatGPT is convenient because you can refine images in conversation and it handles text in images reasonably well. Adobe Firefly (firefly.adobe.com, also inside Photoshop as Generative Fill/Expand) is designed to be commercially safe: Adobe says it is trained on licensed and public-domain content, and it integrates into professional Adobe workflows. Google Gemini, Microsoft Designer/Copilot and Canva also generate images.",
      points: [
        "Midjourney: concept art, mood boards, ad creatives with a strong artistic style (paid plans)",
        "ChatGPT images (DALL·E/GPT image): quick illustrations, edits through conversation, simple text in images",
        "Adobe Firefly: marketing and commercial work, Generative Fill/Expand in Photoshop, brand-safe workflows",
        "How to use any of them: 1) Open the tool 2) Write a detailed prompt 3) Generate 2-4 variations 4) Pick one and refine (change one thing at a time) 5) Upscale or edit 6) Check details (hands, text, logos) 7) Download and record the tool and prompt used"
      ]
    },
    {
      heading: "Writing good image and slide prompts",
      content: "Image prompts work best with concrete visual details. Use this formula: Subject + Action/Setting + Style + Composition + Lighting/Colour + Aspect ratio + Exclusions. For slides, give audience, goal, number of slides, the story structure (problem -> solution -> proof -> call to action) and your real data.",
      syntax: `IMAGE PROMPT FORMULA
[Subject] a young Indian woman data analyst
[Action/Setting] presenting a dashboard on a large screen in a modern office
[Style] clean flat vector illustration
[Composition] wide shot, subject on the left, screen on the right, empty space at top for a headline
[Lighting/Colour] bright daylight, teal and orange brand colours
[Aspect ratio] 16:9
[Exclusions] no text, no logos`,
      points: [
        "Be specific: 'flat vector illustration' vs 'photorealistic photo, 50mm lens'",
        "Leave empty space if you will add a headline later",
        "Avoid asking for real brand logos, celebrities or living artists' names",
        "AI images often get text, hands and small details wrong - add text later in Canva/PowerPoint"
      ]
    },
    {
      heading: "Copyright, commercial use and ethics",
      content: "Rules for AI-generated images are still evolving and differ by country and tool. Read each tool's terms for commercial use. Don't generate images of real people without consent, fake product photos that mislead customers, or copies of copyrighted characters and logos. Disclose AI-generated images where your company, client or platform requires it. For brand-critical commercial work, many companies prefer tools with clear licensing (e.g. Adobe Firefly) and keep records of prompts and tools used.",
      points: [
        "No deepfakes or images of real people without permission",
        "No misleading 'product photos' of things that don't exist as shown",
        "Avoid trademarked characters, logos and imitating a specific living artist's style",
        "Check data/charts in AI-made slides - AI may invent numbers"
      ]
    }
  ],
  examples: [
    {
      title: "BAD vs GOOD: Generating a pitch deck outline (Gamma / Copilot / Claude)",
      scenario: "A final-year student team is presenting their 'Smart Canteen' app to judges at a college startup competition. 'Make a presentation on my app' gives generic slides; a detailed prompt gives a judge-ready storyline using their real data.",
      steps: [
        "Write the GOOD prompt in a chat assistant (claude.ai / ChatGPT) first to get a strong outline",
        "Go to gamma.app -> Create new -> Paste in text, and paste the outline",
        "Choose Presentation, 10 cards, a clean theme, click Generate",
        "Replace AI images that don't fit; check every number on every slide against your survey",
        "Export to PPTX (or use the share link) and rehearse with a timer",
        "Alternative: in PowerPoint with Copilot, use 'Create a presentation about...' with the same prompt"
      ],
      code: `BAD PROMPT:
make a presentation on my canteen app

GOOD PROMPT:
Create a 10-slide pitch deck outline for judges at a college startup competition (7-minute pitch).
Product: "Smart Canteen" - students pre-order food on a mobile app and pick up without queuing.
Our real data: survey of 312 students - 78% wait more than 10 minutes at lunch; pilot for 2 weeks
in Block A canteen - 410 orders, average pickup time 2 minutes.
Business model: Rs 2 convenience fee per order + monthly fee from canteen vendors.
Team: 4 students (2 developers, 1 designer, 1 business).
Storyline: Problem -> Solution -> Demo -> Traction -> Business model -> Competition -> Roadmap -> Team -> Ask.
For each slide give: title, 3 bullets max, and a visual suggestion. Use ONLY the numbers above.`,
      prompt: {
        system: "You are a startup pitch coach. Create concise, judge-friendly pitch deck outlines. Use only the data provided; never invent numbers.",
        user: "Create a 10-slide pitch deck outline for judges at a college startup competition (7-minute pitch).\nProduct: \"Smart Canteen\" - students pre-order food on a mobile app and pick up without queuing.\nOur real data: survey of 312 students - 78% wait more than 10 minutes at lunch; pilot for 2 weeks in Block A canteen - 410 orders, average pickup time 2 minutes.\nBusiness model: Rs 2 convenience fee per order + monthly fee from canteen vendors.\nTeam: 4 students (2 developers, 1 designer, 1 business).\nStoryline: Problem -> Solution -> Demo -> Traction -> Business model -> Competition -> Roadmap -> Team -> Ask.\nFor each slide give: title, 3 bullets max, and a visual suggestion. Use ONLY the numbers above."
      },
      result: `1. Smart Canteen - Skip the Queue, Not the Lunch
   - Pre-order. Pick up. Back to class.
   Visual: phone mockup with order screen over a canteen photo

2. The Problem
   - 78% of 312 surveyed students wait 10+ minutes at lunch
   - Short breaks mean rushed or skipped meals
   Visual: big "78%" with a queue illustration

3. Our Solution
   - Order from the app before the break
   - Get notified when ready, pick up in seconds
   Visual: 3-step flow - Order -> Notify -> Pick up

4. Live Demo
   - Place an order in under 30 seconds
   Visual: screen recording / QR code to try it

5. Traction - 2-week Pilot (Block A)
   - 410 orders placed
   - Average pickup time: 2 minutes
   Visual: two large stat cards

6. Business Model
   - Rs 2 convenience fee per order
   - Monthly subscription from canteen vendors
   Visual: simple revenue flow diagram

7. Competition
   - Current alternative: standing in the queue
   - Food delivery apps don't serve on-campus canteens
   Visual: comparison table (Queue vs Delivery apps vs Smart Canteen)

8. Roadmap
   - Next: all campus canteens, then partner colleges
   Visual: timeline

9. Team
   - 2 developers, 1 designer, 1 business lead
   Visual: 4 photos with roles

10. Our Ask
   - Mentorship + pilot approval for all campus canteens
   Visual: bold call-to-action slide with contact details`,
      explanation: "The GOOD prompt supplies audience, time limit, storyline and real numbers, so every stat on the slides is genuine (78%, 312, 410, 2 minutes). Notice the AI did NOT invent revenue projections. Tools like Gamma then handle layout and design - but you must still check every number and replace any AI image that misrepresents your product."
    },
    {
      title: "Writing a strong image prompt: BAD vs GOOD (ChatGPT images / Firefly / Midjourney)",
      scenario: "A digital marketing executive at an EdTech company needs a banner image for a 'Learn Power BI in 30 Days' campaign. The BAD prompt gives a cluttered image with garbled fake text.",
      steps: [
        "Open ChatGPT (image generation), Adobe Firefly (firefly.adobe.com -> Text to Image), or Midjourney",
        "Try the BAD prompt and note the problems (random text, messy layout)",
        "Use the GOOD prompt; in Firefly set aspect ratio to Widescreen (16:9); in Midjourney add --ar 16:9",
        "Generate 4 variations and pick one with clean empty space at the top",
        "Download, then add the headline and logo in Canva or PowerPoint (not in the AI image)",
        "Save the prompt and tool name in your campaign notes"
      ],
      code: `BAD PROMPT:
power bi course banner with text Learn Power BI in 30 days

GOOD PROMPT:
A young Indian college student smiling at a laptop showing colourful bar and line charts,
sitting at a wooden desk near a window with a small plant, clean modern flat vector
illustration, wide composition with the student on the right and large empty light-teal
space on the left and top for a headline, soft daylight, teal, yellow and white colour
palette, 16:9, no text, no logos, no watermarks.`,
      prompt: {
        system: "You are an expert at writing prompts for AI image generators. Improve prompts using: subject, action/setting, style, composition, lighting/colour, aspect ratio, exclusions. Return the improved prompt plus 2 alternative style variations.",
        user: "Improve this image prompt for a campaign banner for an EdTech company's 'Learn Power BI in 30 Days' course: 'power bi course banner with text Learn Power BI in 30 days'. The headline and logo will be added later in Canva."
      },
      result: `Improved prompt:
A young Indian college student smiling at a laptop showing colourful bar and line charts, sitting at a wooden desk near a window with a small plant, clean modern flat vector illustration, wide composition with the student on the right and large empty light-teal space on the left and top for a headline, soft daylight, teal, yellow and white colour palette, 16:9, no text, no logos, no watermarks.

Variation A (photographic):
Photorealistic photo of a young Indian college student at a laptop displaying a business dashboard, shallow depth of field, 50mm lens look, bright modern co-working space, natural window light, subject on the right third, blurred background with space for a headline, 16:9, no text.

Variation B (3D):
Playful 3D render of floating dashboard cards (bar chart, pie chart, KPI tiles) around a laptop on a pastel teal background, soft studio lighting, isometric view, objects on the right, empty space on the left, 16:9, no text.

Why: removing the in-image text avoids garbled lettering; empty space leaves room for your real headline and logo.`,
      explanation: "Image models often misspell text, so the professional workflow is: generate a clean image with empty space, then add text in a design tool. The formula (subject, setting, style, composition, light/colour, ratio, exclusions) works across ChatGPT, Firefly, Midjourney, Gemini and Canva."
    },
    {
      title: "Step by step: A week of social posts with Canva AI",
      scenario: "A small Pune cafe owner wants 5 Instagram posts and matching WhatsApp status images for a monsoon menu week, in a consistent brand style, in under an hour.",
      steps: [
        "Use claude.ai or ChatGPT (or Canva's Magic Write) with the prompt below to get 5 post ideas with captions",
        "Go to canva.com -> Create a design -> Instagram Post (Square)",
        "Open Magic Design / Canva AI, type idea 1 (e.g. 'Monsoon special masala chai and pakoda, cosy rainy cafe vibe, warm brown and orange') and pick a template",
        "Replace stock photos with your real food photos; use Background Remover if needed",
        "Apply the same fonts and colours to all 5 designs (use Brand Kit if available)",
        "Use Resize to create Instagram Story / WhatsApp Status (9:16) versions",
        "Download as PNG or schedule with Canva's Content Planner; paste the captions"
      ],
      code: `You are a social media manager for "Chai Corner", a small cafe in Pune (students and office
crowd, budget-friendly, warm and friendly brand voice, colours brown and orange).
Monsoon menu week (Mon-Fri): masala chai Rs 30, onion pakoda Rs 60, cheese corn sandwich Rs 90,
hot chocolate Rs 80, combo chai + pakoda Rs 80.
Create 5 posts (one per day). For each give: day, design idea for Canva (visual, layout, text on
image max 6 words), Instagram caption (max 30 words, 1-2 emojis, 3 hashtags).
Use only the prices given.`,
      prompt: {
        system: "You are a social media manager for small Indian food businesses. Write short, warm captions and practical Canva design ideas. Use only the prices given.",
        user: "Cafe: \"Chai Corner\", Pune. Audience: students and office crowd. Brand: budget-friendly, warm, friendly; colours brown and orange.\nMonsoon menu week (Mon-Fri): masala chai Rs 30, onion pakoda Rs 60, cheese corn sandwich Rs 90, hot chocolate Rs 80, combo chai + pakoda Rs 80.\nCreate 5 posts (one per day). For each give: day, design idea for Canva (visual, layout, text on image max 6 words), Instagram caption (max 30 words, 1-2 emojis, 3 hashtags)."
      },
      result: `Monday
Design: steaming cup of masala chai on a wooden table, raindrops on window behind; text "Baarish + Chai = Perfect"
Caption: Monday blues? Rainy skies? Our masala chai at just Rs 30 fixes both ☕ See you at Chai Corner!
#PuneCafe #MonsoonVibes #ChaiLovers

Tuesday
Design: close-up of crispy onion pakoda in a paper cone; text "Crunch Time is Here"
Caption: Crispy, hot onion pakoda for Rs 60 - the official snack of rainy evenings 🌧️
#PuneFood #PakodaLove #MonsoonSpecial

Wednesday
Design: cheese corn sandwich cut diagonally, cheese pull; text "Midweek Cheese Therapy"
Caption: Halfway through the week! Treat yourself to our cheese corn sandwich - Rs 90 of happiness 🧀
#PuneEats #CheeseLovers #CafeLife

Thursday
Design: mug of hot chocolate with a cosy blanket in the background; text "Warm Up, Pune"
Caption: Chilly monsoon evening? Wrap your hands around our rich hot chocolate for Rs 80 🍫
#HotChocolate #PuneCafe #MonsoonMood

Friday
Design: chai and pakoda together with a big "COMBO Rs 80" badge; text "Friday Combo Deal"
Caption: End the week right! Masala chai + onion pakoda combo for just Rs 80 🎉 Bring your friends!
#ChaiPakoda #WeekendVibes #PuneFoodie`,
      explanation: "A chat assistant plans the content and captions; Canva AI turns each idea into a design; Resize creates other formats. Using real food photos instead of AI-generated food avoids misleading customers about what they'll get."
    },
    {
      title: "Step by step: First-draft app screen with Figma AI",
      scenario: "A junior UI designer at a startup must show the product manager three screen ideas for a 'Leave Management' mobile app by the end of the day.",
      steps: [
        "Use claude.ai (or ChatGPT) with the prompt below to write a clear screen specification",
        "Open figma.com -> New design file",
        "Open the Actions/AI menu and choose the first-draft / generate design option (or use Figma Make); paste the screen description",
        "Generate 2-3 variants; keep the best layout",
        "Replace generated components with your company design-system components; fix spacing and colours",
        "Use 'Rename layers' to clean up the layer panel",
        "Link screens with 'Make prototype' and share the prototype link with the product manager"
      ],
      code: `Write a UI specification for the HOME screen of a mobile "Leave Management" app for employees
of a 200-person IT company. Include:
- Purpose of the screen (1 line)
- Components from top to bottom (header, leave balance cards, quick actions, recent requests list, bottom nav)
- Exact sample content for each component (realistic Indian names and leave types: Casual, Sick, Earned)
- States: empty state, pending request, approved, rejected
- Accessibility notes (contrast, tap target size)
Format as a numbered list I can paste into Figma AI as a prompt.`,
      prompt: {
        system: "You are a senior UX designer. Write precise, implementable UI specifications for mobile apps with realistic sample content and accessibility notes.",
        user: "Write a UI specification for the HOME screen of a mobile \"Leave Management\" app for employees of a 200-person IT company. Include: purpose (1 line); components top to bottom (header, leave balance cards, quick actions, recent requests list, bottom nav); exact sample content (Indian names; Casual, Sick, Earned leave); states: empty, pending, approved, rejected; accessibility notes. Format as a numbered list I can paste into Figma AI as a prompt."
      },
      result: `Leave Management - Home Screen (mobile, 390 x 844)
Purpose: Let employees see leave balances and apply or track leave in one tap.

1. Header: "Hi, Ananya" + date "Wed, 18 Nov" + profile avatar (right) + notification bell with badge "2"
2. Leave balance cards (horizontal scroll, 3 cards):
   - Casual Leave: 6 of 12 left
   - Sick Leave: 4 of 7 left
   - Earned Leave: 9.5 of 15 left
   Each card: label, large number, thin progress bar
3. Quick actions (2 large buttons): "Apply Leave" (primary), "Team Calendar" (secondary)
4. Recent requests (list, 3 items):
   - Casual Leave, 24-25 Nov, 2 days - status chip "Pending" (amber)
   - Sick Leave, 3 Nov, 1 day - "Approved" (green)
   - Earned Leave, 14-18 Oct, 5 days - "Rejected" (red) with note "Project release week"
   Empty state: illustration + "No leave requests yet. Plan a break!" + "Apply Leave" button
5. Bottom navigation: Home, Requests, Calendar, Profile

Accessibility:
- Text contrast at least 4.5:1; status shown by colour AND text label
- Tap targets at least 44 x 44 px; support dynamic text size`,
      explanation: "A detailed spec gives Figma AI much better input than 'make a leave app screen', and realistic content reveals layout problems early (e.g. long leave names). The designer still aligns the result with the company design system - AI drafts are a starting point, not the final design."
    }
  ],
  tools: [
    { name: "Gamma", use: "Generate presentations, documents and webpages from a prompt, notes or a file; export to PDF/PPTX", url: "https://gamma.app" },
    { name: "Canva (Magic Studio / Canva AI)", use: "Magic Design, Magic Write, text-to-image, Magic Edit, background remover, resize for social media and presentations", url: "https://www.canva.com" },
    { name: "Microsoft Designer", use: "Create social posts, invitations and images from prompts; AI image editing", url: "https://designer.microsoft.com" },
    { name: "Copilot in PowerPoint", use: "Create a deck from a prompt or Word document, summarise and redesign slides", url: "https://www.microsoft.com/microsoft-365/powerpoint" },
    { name: "Figma AI", use: "First-draft UI generation, layer renaming, content generation, prototyping for app/web design", url: "https://www.figma.com" },
    { name: "Midjourney", use: "High-quality artistic image generation for concepts, mood boards and creatives", url: "https://www.midjourney.com" },
    { name: "ChatGPT images (DALL·E / GPT image)", use: "Generate and edit images through conversation", url: "https://chatgpt.com" },
    { name: "Adobe Firefly", use: "Commercially focused image generation; Generative Fill/Expand in Photoshop", url: "https://firefly.adobe.com" }
  ],
  interview: [
    { q: "What is Gamma and where is it useful?", a: "An AI tool that generates presentations, documents and webpages from a prompt, notes or a file, with layouts and themes. Useful for quickly producing pitch decks, training slides and project updates, then editing and exporting to PDF/PPTX.", level: "Easy" },
    { q: "Name three Canva AI features.", a: "Magic Design (generate designs from a prompt), Magic Write (text generation), text-to-image, Magic Edit/Eraser/Expand, background remover and Magic Resize.", level: "Easy" },
    { q: "How does Adobe Firefly differ from other image generators?", a: "Adobe positions Firefly as commercially safe, trained on licensed and public-domain content, and integrates it into Photoshop, Illustrator and Express (e.g. Generative Fill), which suits professional and brand-sensitive work.", level: "Medium" },
    { q: "What are the components of a good image prompt?", a: "Subject, action/setting, style, composition, lighting/colour, aspect ratio and exclusions (e.g. no text, no logos).", level: "Easy" },
    { q: "Why add text in a design tool instead of the image generator?", a: "Image models often produce misspelt or distorted text. Generating a clean image with empty space and adding text in Canva/PowerPoint gives correct, editable, brand-consistent typography.", level: "Medium" },
    { q: "How does Figma AI help UI/UX designers?", a: "It can generate first-draft screens from a description, rename/organise layers, generate content and images, and create prototypes, speeding up exploration; designers then align results with the design system.", level: "Medium" },
    { q: "What should you check in an AI-generated presentation before presenting?", a: "Every number and fact, that images represent the product honestly, consistency with brand guidelines, slide flow for the audience, accessibility (contrast, font size) and that no confidential data was uploaded inappropriately.", level: "Medium" },
    { q: "What ethical issues apply to AI-generated images?", a: "Consent for real people's likeness, deepfakes, misleading product images, copyright/trademark infringement, imitating living artists, and disclosure requirements. Follow tool terms and company policy.", level: "Medium" },
    { q: "When would you choose Midjourney vs ChatGPT images vs Firefly?", a: "Midjourney for highly artistic concept images; ChatGPT images for quick, conversational generation and edits; Firefly for commercial/brand work and Photoshop-based editing. Final choice also depends on licensing terms and company approval.", level: "Hard" },
    { q: "How would you create a consistent set of social posts quickly with AI?", a: "Plan content and captions with a chat assistant, generate designs from one template in Canva with a brand kit, use real product photos, apply the same fonts/colours, resize for each platform and schedule them.", level: "Medium" }
  ],
  practice: [
    { task: "Create a 6-slide presentation on 'My Learning Journey in AI' using Gamma (or Copilot in PowerPoint). Use a detailed prompt with audience and storyline.", hint: "Storyline: Why AI -> What I learned -> Favourite tool -> Project -> Challenges -> Next steps.", solution: "Prompt: 'Create a 6-slide presentation for my classmates (5-minute talk) about my AI learning journey: ... Use only these facts: ... Max 3 bullets per slide, one visual suggestion per slide.' Then replace images and check facts." },
    { task: "Write a BAD and a GOOD image prompt for a blog header about 'Data privacy for beginners'. Generate both in one tool and compare.", hint: "Use the 7-part formula; add 'no text'.", solution: "GOOD: 'A friendly padlock character protecting a laptop with floating document icons, flat vector illustration, centred composition with empty space on top, soft blue and white palette, 16:9, no text, no logos.'" },
    { task: "Design a college event poster in Canva using Magic Design, then use Resize to create an Instagram Story and a WhatsApp status version.", hint: "Keep fonts and colours the same across sizes.", solution: "Expected: one master design, 2 resized versions; check text readability on phone-size previews." },
    { task: "Write a UI spec for a 'Student Attendance' app screen and try it in Figma AI (or sketch it from the spec if Figma AI isn't available).", hint: "Components, sample content, states, accessibility.", solution: "Spec includes header, subject list with % attendance, warning state below 75%, mark-attendance button, accessibility notes. Compare the generated screen with your spec and list 3 fixes." },
    { task: "Check the commercial-use terms of one image tool you used and write 3 rules for using its images in a client project.", hint: "Look for licensing, attribution and restrictions.", solution: "Example rules: confirm the plan allows commercial use; don't include real people or trademarks; keep a record of prompts and the tool used; disclose AI use if the client requires." }
  ],
  quiz: [
    { question: "Which tool generates a full slide deck from a prompt and exports to PPTX/PDF?", options: ["Gamma", "Otter.ai", "Power Query", "Perplexity"], answer: 0, explanation: "Gamma creates presentations, documents and webpages from prompts." },
    { question: "Which image generator is positioned as commercially safe and is built into Photoshop's Generative Fill?", options: ["Midjourney", "Adobe Firefly", "NotebookLM", "Gamma"], answer: 1, explanation: "Adobe Firefly powers Generative Fill and focuses on licensed training content." },
    { question: "Best way to get a correct headline on an AI-generated banner?", options: ["Ask the image model to write it", "Use a smaller font in the prompt", "Generate the image with empty space, then add text in Canva/PowerPoint", "Use only uppercase letters"], answer: 2, explanation: "Image models often garble text; add it in a design tool." },
    { question: "Which part is MISSING from this image prompt: 'a cat on a sofa, watercolour style, warm lighting, 1:1'?", options: ["Style", "Lighting", "Aspect ratio", "Composition and exclusions"], answer: 3, explanation: "It has subject, setting, style, lighting and ratio but no composition or exclusions." },
    { question: "Which use of AI images is unethical?", options: ["A fake photo of a real politician endorsing your product", "An illustration for a blog header", "A mood board for a design team", "Concept art for a game pitch"], answer: 0, explanation: "Using a real person's likeness without consent to mislead is unethical and may be illegal." }
  ]
};
