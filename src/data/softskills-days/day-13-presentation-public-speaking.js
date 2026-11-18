export default {
  id: "day-13-presentation-public-speaking",
  title: "Presentation and Public Speaking: Structure, Slides, Nervousness and Q&A",
  module: "Module 4: Workplace Skills",
  day: 13,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Deliver clear, confident presentations for project reviews, client demos, sprint reviews and interviews: structure your talk, design simple slides, manage stage fear, and handle questions, including ones you cannot answer.",
  objectives: [
    "Structure a presentation with a strong opening, 3 key points and a clear close",
    "Design simple slides using the one-idea-per-slide rule",
    "Use voice, pauses, eye contact and movement effectively",
    "Manage nervousness with preparation and breathing techniques",
    "Handle Q&A, difficult questions and live demo failures calmly",
  ],
  theory: [
    {
      heading: "Why Presentation Skills Matter at Work",
      content: `In college, you present your project to a guide and examiners. At work, you present much more often: training assessments, sprint review demos, knowledge-sharing sessions, client walkthroughs, and later, proposals to senior management. Some interview processes (especially for experienced or analyst roles) include a presentation round or a case presentation.\n\nPeople remember how you presented as much as what you presented. A clearly explained average project often impresses more than a brilliant project explained badly.`,
      points: [
        "Training: project presentations and assessments in ILP or induction",
        "Agile teams: sprint review demos every 2 weeks",
        "Clients: walkthroughs of features and reports",
        "Career growth: visibility to senior leaders",
      ],
    },
    {
      heading: "Structure: Open, Body, Close",
      content: `A good presentation follows a simple structure. **Opening** (10%): hook the audience with a question, a surprising fact, a short story or the problem; then state the purpose and agenda. **Body** (80%): 3 key points, each with evidence, example or demo. Three is memorable; seven is not. **Close** (10%): summarise the 3 points, give a call to action or next steps, and invite questions.\n\nRemember the classic rule: tell them what you will tell them, tell them, then tell them what you told them.`,
      points: [
        "Hook: 'How many of you waited more than 10 minutes in the canteen today?'",
        "Agenda: 'I will cover the problem, our solution and the results.'",
        "Rule of three: three main points",
        "Close with a summary and a clear next step",
      ],
      tip: "Write your opening and closing lines word for word. Everything in the middle should be practised, not memorised.",
    },
    {
      heading: "Designing Simple, Effective Slides",
      content: `Slides support you; they are not your script. Follow one idea per slide, a clear headline that states the message ('Waiting time fell by 70%' rather than 'Results'), minimal text (around 6 lines, few words each), large readable fonts (at least 24 pt for body), high contrast, and visuals: diagrams, screenshots, simple charts.\n\nAvoid paragraphs, reading the slides aloud, flashy animations and too many colours. For technical presentations, show architecture diagrams and short code snippets only when necessary, with the important line highlighted.`,
      points: [
        "One message per slide; headline states the message",
        "Maximum about 6 bullets, short phrases",
        "Font 24 pt+ for body text; 32 pt+ for titles",
        "Use charts and diagrams instead of tables of numbers",
        "Roughly 1 slide per 1-2 minutes",
      ],
    },
    {
      heading: "Delivery: Voice, Eyes and Body",
      content: `Speak slightly slower and louder than normal conversation. Use pauses after important points. Vary your tone to avoid sounding monotonous. Make eye contact with different parts of the room, holding each person for a sentence. Stand straight with feet apart, use open hand gestures and move with purpose, not nervous pacing.\n\nFace the audience, not the screen. Use a clicker or keyboard shortcut so you are not bending over the laptop. On video presentations, look at the camera and keep your energy higher than usual since screens flatten expression.`,
      points: [
        "Pause for 2 seconds after a key number or result",
        "Never turn your back to read slides",
        "Avoid hands in pockets, crossed arms, swaying",
        "Smile; it relaxes both you and the audience",
      ],
    },
    {
      heading: "Managing Nervousness",
      content: `Almost everyone feels nervous before speaking; even experienced speakers do. Nervousness is energy; the goal is to use it, not eliminate it. The biggest cure is preparation: rehearse aloud at least 3 times, with a timer, ideally once in front of friends.\n\nBefore starting, use box breathing: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4, repeated 3-4 times. Arrive early, check the projector, and talk to a few audience members before you begin so you see friendly faces. Remember: the audience wants you to succeed, and they cannot see most of your nervousness.`,
      points: [
        "Rehearse aloud 3+ times with a timer",
        "Box breathing before you start",
        "Memorise the first 30 seconds; nervousness drops after the opening",
        "Focus on helping the audience, not on being judged",
        "If you lose your place, pause, check your slide headline and continue",
      ],
      tip: "A glass of water nearby is a great tool: sipping gives you a natural 3-second pause to recollect.",
    },
    {
      heading: "Handling Q&A and Demo Failures",
      content: `For Q&A: listen to the full question, thank the person or acknowledge it, repeat or paraphrase it so everyone hears, answer briefly, and check if it answered their question. If you do not know, say so honestly and offer to follow up. If someone is hostile, stay calm and factual; offer to discuss details offline.\n\nFor live demos: always have a backup (a recorded video or screenshots). If the demo fails, do not debug in front of everyone for five minutes. Say 'Looks like the server is not responding; let me show you the recorded version' and move on.`,
      points: [
        "Listen - Acknowledge - Paraphrase - Answer - Check",
        "'That is a great question; I do not have the exact number, I will email it to you today.'",
        "Keep answers short; offer offline discussion for deep dives",
        "Always keep a recorded demo backup",
      ],
    },
  ],
  examples: [
    {
      title: "Project Presentation Opening: Weak vs Strong",
      scenario: "Final-year project presentation in front of external examiners and classmates.",
      steps: [
        "Replace the generic opening with a hook",
        "State the purpose and agenda",
      ],
      code: `WEAK:
"Good morning. Our project name is QuickBite. Our team members are Ravi,
Sana, Arjun and me. So, basically, I will start with the introduction..."
(reads slide 1 which has 10 lines of text)

STRONG:
"Good morning. Quick question: how many of you skipped lunch at least once
this month because the canteen queue was too long? (hands go up)
That is exactly the problem we solved. In the next 10 minutes, I will show
you QuickBite, a pre-ordering app; how we built it; and how it reduced
waiting time from 15 minutes to 4 during our pilot."`,
      result: "The audience is engaged from the first 20 seconds and knows what to expect.",
      explanation: "A relatable hook plus a clear agenda and a teaser result creates interest immediately.",
    },
    {
      title: "Slide Redesign",
      scenario: "Converting a text-heavy results slide into an effective one.",
      steps: [
        "Write a headline that states the message",
        "Replace paragraphs with a visual",
        "Keep only key supporting facts",
      ],
      code: `BEFORE:
Title: Results
- The application was tested for two weeks in our college canteen with
  students from all departments and we observed that the waiting time was
  reduced significantly and students gave positive feedback and also the
  canteen staff said that order management became easier...

AFTER:
Title: Waiting time fell from 15 to 4 minutes
[Bar chart: Before 15 min | After 4 min]
- 150 students/day in a 2-week pilot
- 4.5/5 average student rating
- Staff: zero lost orders`,
      result: "The audience grasps the key result in 3 seconds.",
      explanation: "A message headline plus a visual and three facts is far more powerful than a paragraph.",
    },
    {
      title: "Sprint Review Demo Script",
      scenario: "A trainee presents a completed feature to the product owner in a 5-minute sprint review.",
      steps: [
        "Context: what user problem the feature solves",
        "Demo: show the user flow, not the code",
        "Mention what is done and what is pending",
        "Ask for feedback",
      ],
      code: `"This sprint I worked on the 'Download invoice as PDF' feature.
Earlier, customers had to email support for invoices, which created about
200 tickets a month.

Let me show the flow: the customer goes to My Orders, clicks the order, and
here is the new 'Download Invoice' button. The PDF includes GST details and
the company logo.

Done: PDF generation, GST format, tested on Chrome and Edge.
Pending: Hindi language support, planned for next sprint.

Any feedback on the layout before we release?"`,
      result: "The product owner sees business value, a working feature and clear status in under 5 minutes.",
      explanation: "Demos should focus on the user's problem and flow. Clear done/pending avoids surprises.",
    },
    {
      title: "Handling a Tough Q&A Question",
      scenario: "An examiner asks: 'Your app will fail if 2,000 students order at once. Did you test that?'",
      steps: [
        "Acknowledge the concern",
        "Be honest about what was tested",
        "Explain how you would address it",
      ],
      code: `"That is a very valid point, sir. We tested with about 150 concurrent users
in our pilot, and with 500 simulated users using JMeter, where response time
stayed under one second.

We have not tested 2,000 concurrent users. To handle that, I would add
caching for the menu, use a connection pool sized for the load, and run the
API on two instances behind a load balancer. That would be our next step
if the college decides to adopt it fully."`,
      result: "The examiner sees honesty, testing knowledge and scalability thinking.",
      explanation: "Acknowledging limits and giving a concrete improvement plan is stronger than defending blindly.",
    },
  ],
  interview: [
    { q: "How do you prepare for a presentation?", a: `I first understand the audience and the goal. Then I create a simple structure: opening hook, three key points, and a close with next steps. I make slides with one idea each, rehearse aloud at least three times with a timer, prepare for likely questions and keep a backup for any demo. Finally, I reach early to test the setup.`, level: "Easy" },
    { q: "Do you get nervous while speaking in public? How do you handle it?", a: `Yes, I do feel some nervousness, which I think is natural. I manage it through preparation: I rehearse several times and memorise my opening. Just before speaking, I do box breathing. Once the first minute goes well, I feel comfortable. At our tech fest, I presented to about 200 students using this approach.`, level: "Easy" },
    { q: "Tell me about a presentation you gave that went well.", a: `S: I presented our hostel complaint app to the college administration. T: We needed approval to use it officially. A: Instead of technical details, I focused on their problem: complaints lost in registers. I showed a 3-minute demo and data from our pilot: resolution time dropped from 5 days to 2. I prepared answers on data privacy and cost. R: The administration approved it for all hostels. I learned to present in the audience's language.`, level: "Medium" },
    { q: "What would you do if your live demo fails during a client presentation?", a: `I would stay calm, acknowledge it briefly, and switch to my backup: a recorded video or screenshots. I would not debug in front of the client. After the meeting, I would investigate the issue and offer to show the live version in a follow-up call.`, level: "Medium" },
    { q: "How do you handle a question you cannot answer during a presentation?", a: `I acknowledge it honestly: 'That is a good question; I do not have the exact data right now.' Then I commit to follow up by a specific time and actually do it. If I can reason about it partially, I share that with clear caveats. Guessing confidently is risky in front of clients or seniors.`, level: "Medium" },
    { q: "What makes a good slide?", a: `One main idea, a headline that states the message, minimal text, large readable fonts, high contrast and a visual like a chart or diagram where possible. The slide should support what I say, not replace it. If the audience has to read a paragraph, they stop listening.`, level: "Easy" },
    { q: "Explain a technical topic to us in 2 minutes, as if presenting to non-technical people. (e.g. Cloud computing)", a: `Imagine you want to start a small business. You could build your own power plant, or simply take electricity from the grid and pay for what you use. Cloud computing is the same idea for computers. Instead of buying expensive servers, companies rent computing power and storage from providers like AWS, Azure or Google Cloud over the internet. Three benefits: you pay only for what you use, you can grow quickly when customers increase, and you do not worry about maintaining hardware. That is why most new apps, from food delivery to banking, run on the cloud today.`, level: "Hard" },
    { q: "How do you keep your audience engaged?", a: `By starting with a relatable hook, using stories and real examples, asking the audience questions, showing visuals instead of text, varying my voice and pace, and keeping it within time. I also watch body language; if people look lost, I give a quick example or summary.`, level: "Medium" },
    { q: "Someone in the audience challenges your data aggressively. What do you do?", a: `I stay calm and respectful, thank them for the point, and answer with facts I have. If the discussion needs detail beyond the session, I offer to discuss it offline so the presentation stays on track for everyone. I never argue emotionally in front of the audience.`, level: "Hard" },
    { q: "How do you manage time in a presentation?", a: `I plan roughly one slide per one to two minutes, rehearse with a timer and mark checkpoints, like 'by slide 5, I should be at 5 minutes'. I keep one optional slide I can skip if I run late. Finishing on time shows respect for the audience.`, level: "Easy" },
    { q: "What is the difference between a presentation for a manager and one for a technical team?", a: `For a manager, I focus on the problem, business impact, timeline, risks and decisions needed, with minimal technical detail. For a technical team, I go deeper into architecture, design choices, trade-offs and code-level details. The core content may be the same, but the level and focus change based on the audience.`, level: "Hard" },
  ],
  practice: [
    {
      task: "Create a 5-slide outline for a 7-minute presentation of your final-year project with a message headline for each slide.",
      hint: "Problem, Solution, Architecture, Results, Next steps. Each headline should be a sentence that states the point.",
      solution: `Slide 1: Students lose 15 minutes daily in canteen queues
  (photo of queue + survey: 82% of 120 students skip lunch sometimes)
Slide 2: QuickBite lets students pre-order and pick up in 2 minutes
  (3 app screenshots: menu, pay, token)
Slide 3: A simple 3-tier design kept development fast
  (diagram: React -> Spring Boot API -> MySQL)
Slide 4: Waiting time fell from 15 to 4 minutes in our pilot
  (bar chart + 150 users/day + 4.5/5 rating)
Slide 5: Next: scale to all 3 canteens and add UPI live payments
  (3 bullets + 'Questions?')`,
    },
    {
      task: "Write a strong 30-second opening for a 5-minute knowledge-sharing session on 'Git basics' for your training batch.",
      hint: "Use a relatable problem or question as the hook, then state the agenda.",
      solution: `"Raise your hand if you have ever named a file 'project_final_final_v3.zip'.
(laughter) We have all been there. Today, in five minutes, I will show you
how Git solves that problem. We will cover three things: what Git is, the
four commands you will use every day, and one mistake to avoid. By the end,
you will never need a 'final_final' file again."`,
    },
    {
      task: "Record a 3-minute presentation (with or without slides) and evaluate yourself on 6 criteria out of 5.",
      hint: "Criteria: opening, structure, pace, eye contact, filler words, closing.",
      solution: `Sample self-evaluation:
Opening hook: 3/5 - started with 'So, basically...'; replace with a question
Structure: 4/5 - three points clear
Pace: 3/5 - rushed in the middle (about 170 wpm)
Eye contact (camera): 2/5 - looked at slides most of the time
Filler words: 3/5 - 7 fillers
Closing: 2/5 - ended with 'that's it'; add summary and next step
Plan: rehearse opening/closing word for word; use speaker notes less; re-record.`,
    },
    {
      task: "Prepare answers for 4 likely Q&A questions on your project, including one you cannot fully answer.",
      hint: "Think about scalability, security, why this tech, and what you would improve.",
      solution: `1. Why React and not Angular? "Our team knew JavaScript, and React's
   component model let us build fast. For a larger enterprise app, Angular's
   structure could be an advantage."
2. How is payment data secured? "We use Razorpay's hosted checkout, so we
   never store card details; we store only the payment ID and status."
3. Can it handle 2,000 users? "Tested with 500 simulated users. For 2,000, we
   would add caching and multiple instances behind a load balancer."
4. What is the server cost per month? (unknown) "I do not have the exact
   figure; based on a small cloud instance it should be low, but I will
   calculate and share it by tomorrow."`,
    },
  ],
  quiz: [
    { question: "What is the recommended number of key points in a short presentation?", options: ["One", "Three", "Ten", "As many as possible"], answer: 1, explanation: "The rule of three makes content memorable." },
    { question: "Which slide headline is most effective?", options: ["Waiting time fell from 15 to 4 minutes", "Results", "Data", "Slide 4"], answer: 0, explanation: "A message headline tells the audience the point immediately." },
    { question: "Your live demo crashes. What should you do?", options: ["Debug live for 10 minutes", "End the presentation", "Blame the network team", "Switch to the recorded backup and continue"], answer: 3, explanation: "A backup keeps the presentation on track and shows preparation." },
    { question: "What is box breathing?", options: ["Breathing into a paper bag", "Holding breath as long as possible", "Inhale 4s, hold 4s, exhale 4s, hold 4s", "Fast shallow breaths"], answer: 2, explanation: "Box breathing calms the nervous system before speaking." },
    { question: "Which is the correct Q&A sequence?", options: ["Interrupt - Answer - Leave", "Listen - Acknowledge - Paraphrase - Answer - Check", "Guess - Defend - Move on", "Ignore - Continue"], answer: 1, explanation: "This sequence ensures you answer the right question clearly." },
    { question: "Which is a common slide design mistake?", options: ["Paragraphs of text read aloud", "Large fonts", "One idea per slide", "Using a chart"], answer: 0, explanation: "Reading text-heavy slides loses the audience." },
  ],
};
