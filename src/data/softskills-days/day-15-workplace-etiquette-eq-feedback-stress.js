export default {
  id: "day-15-workplace-etiquette-eq-feedback-stress",
  title: "Workplace Etiquette, Emotional Intelligence, Feedback, Stress and the Final Mock-Interview Checklist",
  module: "Module 4: Workplace Skills",
  day: 15,
  level: "Advanced",
  duration: "3 hours",
  summary: "Prepare for your first job and final interviews: professional etiquette in office and online, emotional intelligence, receiving and giving feedback, managing stress, and a complete mock-interview checklist that brings together everything from this course.",
  objectives: [
    "Follow office, meeting, chat and email etiquette in Indian IT companies",
    "Understand the five components of emotional intelligence and apply them",
    "Receive critical feedback without defensiveness and give feedback using SBI",
    "Manage stress and maintain work-life balance in the first job",
    "Use a complete checklist to prepare for and review mock interviews",
  ],
  theory: [
    {
      heading: "Workplace Etiquette",
      content: `Etiquette is the set of small behaviours that make you pleasant and professional to work with. In an Indian IT office: be on time for meetings, follow the dress code (often business casual, formals on client visit days), keep your desk tidy, speak softly in open offices, keep phone on silent, respect cafeteria and common areas, and wear your ID card.\n\nAddress people the way your company culture does. Many IT companies use first names even for managers; follow what colleagues do. Respect diversity: colleagues come from different states, languages, religions and genders. Speak a language everyone in the group understands; switching to your regional language in a mixed group excludes others.`,
      points: [
        "Punctuality: join meetings 1-2 minutes early",
        "Common language in mixed groups (usually English)",
        "Respect personal space and privacy",
        "Do not discuss salaries, gossip or politics at work",
        "Follow information security rules: lock your screen, no client data on personal devices",
      ],
      tip: "Windows + L (or Ctrl + Cmd + Q on Mac) to lock your screen every time you leave your desk.",
    },
    {
      heading: "Online and Chat Etiquette",
      content: `Most teams communicate on Microsoft Teams or Slack. Do not send just 'Hi' and wait; write your full question in one message ('Hi Ravi, quick question: which branch should I use for the payment fix? I see both dev and release-2.1.'). Respect working hours and status (Busy, Do Not Disturb). Use threads, avoid unnecessary @everyone mentions, and keep emojis appropriate.\n\nIn video meetings: mute when not speaking, turn camera on if the team does, use a professional background, do not eat on camera, and raise your hand or use chat to ask questions without interrupting.`,
      points: [
        "No 'Hi' alone: ask the full question in one message",
        "Respect status and time zones; schedule messages if needed",
        "Mute when not speaking; camera as per team norm",
        "Recap action items after calls in writing",
      ],
    },
    {
      heading: "Emotional Intelligence (EQ)",
      content: `Emotional intelligence is the ability to understand and manage your own emotions and to understand and influence the emotions of others. Daniel Goleman described five components: **Self-awareness** (knowing your emotions and triggers), **Self-regulation** (controlling impulsive reactions), **Motivation** (inner drive), **Empathy** (understanding others' feelings), and **Social skills** (building relationships, managing conflict).\n\nIn IT work, EQ shows up when a client is angry about a bug, a code review comment feels harsh, a teammate is struggling, or a release goes wrong late at night. People with high EQ stay calm, respond rather than react, and keep relationships strong.`,
      points: [
        "Self-awareness: 'I get irritated when interrupted; I should pause before replying'",
        "Self-regulation: wait before replying to an upsetting email",
        "Motivation: learning even when nobody is checking",
        "Empathy: 'The tester is under deadline pressure too'",
        "Social skills: appreciating others, resolving conflicts calmly",
      ],
      tip: "When emotional, use the 'pause rule': do not reply to an upsetting message for 30 minutes.",
    },
    {
      heading: "Handling Feedback: Receiving and Giving",
      content: `Freshers receive a lot of feedback: code review comments, training assessments, appraisals. Receiving feedback well is a skill: listen fully, do not interrupt or defend immediately, ask clarifying questions, thank the person, act on it and follow up. Not all feedback will be perfect, but there is usually something useful in it.\n\nWhen giving feedback (in code reviews or to teammates), use the **SBI model**: Situation, Behaviour, Impact. Describe a specific situation, the observable behaviour, and its impact, then suggest or ask about the way forward. Give praise in public and criticism in private.`,
      points: [
        "Receive: Listen - Clarify - Thank - Act - Follow up",
        "Do not take code review comments personally",
        "Give: Situation - Behaviour - Impact + suggestion",
        "Praise publicly, correct privately",
        "Ask for feedback proactively: 'What is one thing I can improve?'",
      ],
    },
    {
      heading: "Managing Stress and Work-Life Balance",
      content: `The first job brings new stress: a new city, PG or hostel life, training assessments, strict deadlines, production issues, night shifts and comparison with batchmates' packages. Some stress is normal; chronic stress harms health and performance.\n\nPractical strategies: plan and prioritise, break big tasks into small ones, ask for help early, keep a regular sleep schedule, exercise (even a 20-minute walk), maintain friendships and family calls, take your leaves, and limit comparison on social media. Many companies offer Employee Assistance Programmes (EAP) with free confidential counselling; using them is a sign of strength.`,
      points: [
        "Sleep 7 hours; avoid all-nighters becoming a habit",
        "Physical activity daily",
        "Talk to someone: friend, mentor, family, EAP counsellor",
        "Set boundaries: reply to non-urgent messages in working hours",
        "Focus on your growth, not others' packages",
      ],
      tip: "Write down what is stressing you. Separate what you can control from what you cannot, and act only on the first list.",
    },
    {
      heading: "Final Mock-Interview Checklist",
      content: `This course has covered communication, self-introduction, English confidence, body language, emails, resume, LinkedIn, HR questions, STAR stories, technical communication, GDs, video interviews, salary, presentations and teamwork. Before real interviews, put it together with at least three full mock interviews: one HR, one technical, one mixed, ideally with a senior, mentor or placement cell.\n\nUse the checklist below before every interview, and review each mock honestly. Improvement comes from feedback loops: practise, record, review, fix, repeat.`,
      points: [
        "Documents: resume copies, ID, certificates, offer letters",
        "Introduction: 30s / 60s / 2min versions ready",
        "Story bank: 6-8 STAR stories revised",
        "Projects: 2-minute explanation + architecture + challenges",
        "Company research: 3 specific facts + questions to ask",
        "HR answers: strengths, weakness, 5 years, relocation, bond, gap",
        "Setup: dress, camera, internet, quiet room (if online)",
        "Mindset: sleep well, arrive early, breathe, smile",
      ],
    },
  ],
  examples: [
    {
      title: "Receiving Harsh Code Review Feedback",
      scenario: "A senior comments on your pull request: 'This is inefficient. Why are you calling the database inside a loop?'",
      steps: [
        "Pause; do not react emotionally",
        "Understand the technical point",
        "Thank, fix and learn",
      ],
      code: `REACTIVE (low EQ):
"It works fine on my machine. I followed the existing code style.
Why are you always finding problems in my code?"

RESPONSIVE (high EQ):
"Thanks for catching this, Suresh. You are right: for 500 orders it makes
500 queries. I have changed it to fetch all items in one query using an
IN clause and map them in memory. Response time dropped from 3.2s to 0.4s.
Could you take another look? Also, is there a guideline doc for such
patterns that I should read?"`,
      result: "The senior sees a coachable engineer, and the code improves significantly.",
      explanation: "Self-regulation turns criticism into learning. Asking for guidelines shows motivation and builds the relationship.",
    },
    {
      title: "Giving Feedback with SBI",
      scenario: "A teammate frequently joins stand-ups late, delaying the meeting.",
      steps: [
        "Speak privately",
        "Describe Situation, Behaviour and Impact",
        "Ask and suggest a way forward",
      ],
      code: `BAD (public, vague):
(in the group chat) "Some people need to learn to come on time!!"

GOOD (private, SBI):
"Hi Aman, can I share something small? In the last three stand-ups
(Situation), you joined about 10 minutes late (Behaviour). We waited for
your update each time, so the meeting ran over and a few of us were late for
the client call (Impact).
Is something making the 10 am slot difficult? If so, maybe we can ask
Priya to move it, or you could share your update in chat if you are delayed."`,
      result: "Aman explains he has a daily 9:30 call with another team; the stand-up is moved to 10:15.",
      explanation: "SBI is specific and non-judgemental. Asking about the cause shows empathy and often reveals a simple fix.",
    },
    {
      title: "Chat Etiquette: Bad vs Good",
      scenario: "You need help from a senior on Microsoft Teams.",
      steps: [
        "Avoid sending 'Hi' and waiting",
        "Write context, question and what you tried in one message",
      ],
      code: `BAD:
10:02 "Hi"
10:02 "Sir"
10:15 "Are you there?"
10:30 "I have doubt"

GOOD:
10:02 "Hi Kiran, quick question when you have 5 minutes:
The build fails on my machine with 'Java heap space' when running tests for
the billing module. I tried increasing -Xmx to 2g in the Maven config but it
still fails. Is there a project-specific setting I am missing?
Error log attached."`,
      result: "Kiran replies in one message with the fix; no back-and-forth needed.",
      explanation: "A complete message respects the other person's time and usually gets faster help.",
    },
    {
      title: "Full Mock-Interview Review Sheet",
      scenario: "A student completes a 30-minute mock HR + technical interview with a senior and fills out a review sheet.",
      steps: [
        "Score each area 1-5",
        "Note specific observations",
        "Write 3 action items with deadlines",
      ],
      code: `MOCK INTERVIEW REVIEW - 15 Nov
Area                          Score  Notes
Entry, greeting, posture       4     Good smile; sat at edge of chair
Tell me about yourself         3     85 sec; too much on 10th/12th marks
Project explanation            4     Clear structure; missed DB design
Technical (SQL, OOP)           3     Joins fine; struggled on normalisation
Handling 'I don't know'        4     Honest, reasoned well
STAR answers                   2     No numbers; long situations
HR (weakness, relocation)      4     Genuine weakness with plan
Questions to interviewer       3     Asked only about next steps
Fillers / pace                 3     'basically' x6; fast when nervous

ACTION ITEMS
1. Rewrite intro (remove marks, add internship result) - by 17 Nov
2. Add numbers to 4 STAR stories; cut situations to 2 lines - by 18 Nov
3. Revise normalisation 1NF-3NF with examples - by 19 Nov
Next mock: 20 Nov`,
      result: "Clear, measurable improvements before the real interview.",
      explanation: "Scoring each area with notes and dated action items turns a mock into real progress.",
    },
  ],
  interview: [
    { q: "What is emotional intelligence and why is it important at work?", a: `Emotional intelligence is the ability to recognise and manage my own emotions and to understand others' emotions. It includes self-awareness, self-regulation, motivation, empathy and social skills. At work, it helps me stay calm under pressure, accept feedback, handle conflicts and build good relationships with teammates and clients, which are essential in team-based IT projects.`, level: "Easy" },
    { q: "How do you handle criticism?", a: `I listen without interrupting, try to understand the point and ask questions if needed. I thank the person and act on it. For example, in my internship my mentor said my code had too little documentation. I started writing clear comments and README files, and in my final review he mentioned it as an improvement. I see criticism as free coaching.`, level: "Easy" },
    { q: "How do you handle stress?", a: `I plan my work in small steps so big tasks do not overwhelm me. I keep a fixed sleep schedule and go for a run three times a week. When I am stressed about something, I write it down and separate what I can control from what I cannot. During final exams and placement preparation together, this helped me stay calm and consistent.`, level: "Easy" },
    { q: "Tell me about a time you handled a stressful situation.", a: `S: Our project server crashed one hour before our final evaluation. T: As the backend person, I had to get it running. A: I stayed calm, informed the team and the guide immediately, checked logs and found the disk was full due to log files. I cleared old logs, restarted the services and kept our recorded demo ready as backup. R: The app was running in 25 minutes, and the evaluation went well. Later I added log rotation. I learned that calm, step-by-step action works better than panic.`, level: "Medium" },
    { q: "How would you handle a rude or angry client on a call?", a: `I would stay calm and let them express their concern without interrupting. I would acknowledge their frustration, apologise for the inconvenience, and focus on facts: what is the issue, what is the impact and what we will do next with a timeline. I would not take it personally or argue. After the call, I would send a written summary and update my manager.`, level: "Medium" },
    { q: "Your manager gives you feedback you believe is unfair. What do you do?", a: `I would first listen fully and take some time to reflect, because there may be a valid part. Then I would request a calm one-on-one conversation, share my perspective with specific facts and examples, and ask what I could do differently. Even if we still see it differently, I would focus on improving and keep the relationship professional.`, level: "Hard" },
    { q: "What is professional etiquette in an IT office?", a: `Being punctual, following the dress code, keeping the phone on silent, speaking in a common language in mixed groups, respecting others' time on chat and meetings, keeping the workspace tidy, maintaining information security such as locking my screen, and treating everyone with respect regardless of role or background.`, level: "Easy" },
    { q: "How do you work with people from different backgrounds and cultures?", a: `I stay open and respectful, avoid assumptions and stereotypes, and use a common language. In college, my project team had members from Kerala, Bihar and Punjab; we used English and appreciated each other's perspectives. With international clients, I learn about their communication style, like being more direct with US clients, and adjust.`, level: "Medium" },
    { q: "How do you give feedback to a peer?", a: `I use the SBI model: describe the specific situation, the behaviour I observed and its impact, and then discuss a way forward together. I give it privately and focus on the behaviour, not the person. I also make sure to appreciate what they are doing well.`, level: "Medium" },
    { q: "You are not selected for a project you wanted. How do you react?", a: `I would feel disappointed, but I would ask my manager for feedback on what skills I need for such projects in future, and create a plan to build them. Meanwhile, I would give my best to my current project. Reacting maturely and improving usually leads to the next opportunity.`, level: "Hard" },
    { q: "Do you have any questions for us? (Final HR round)", a: `Yes, thank you. What does the onboarding and training look like for new joiners? How is feedback given during the first year? And what are the next steps and the expected timeline for the result? Thank you for your time today; I really enjoyed the conversation.`, level: "Easy" },
    { q: "If you could improve one thing about yourself before joining, what would it be?", a: `I would improve my spontaneous public speaking further. I have become comfortable presenting prepared content, but speaking without preparation in meetings still needs practice. I am working on it through daily one-minute speaking drills and by volunteering to give updates in group calls.`, level: "Medium" },
  ],
  practice: [
    {
      task: "Write a calm reply to this code review comment you received: 'Did you even test this? It breaks the login page.'",
      hint: "Pause, acknowledge, fix, share what you will do differently. Do not match the tone.",
      solution: `"Thanks for flagging this, Rohit, and sorry for the trouble. I tested the
profile page but missed the login flow, which uses the same validation
function I changed. I have fixed the regex so both cases work and added two
unit tests for login validation. Updated PR is ready for review.
Going forward, I will run the full regression suite before raising a PR."`,
    },
    {
      task: "Use the SBI model to write feedback for a project teammate who submits work at the last minute, causing integration problems.",
      hint: "Private, specific, impact-focused, ask about the cause, propose a solution.",
      solution: `"Hi Meena, can I share something? For the last two milestones
(Situation), your module was pushed on the deadline night (Behaviour).
Because of that, we had integration errors and spent the night fixing them,
and our demo to the guide was rushed (Impact).
Is anything making it difficult to push earlier? Maybe we can set an
internal deadline two days before the real one and do a quick integration
check together then. Would that work for you?"`,
    },
    {
      task: "Create your personal stress-management plan for the first three months of your job.",
      hint: "Cover sleep, exercise, finances, social support, learning plan and warning signs.",
      solution: `My first-90-days plan:
- Sleep: 11:30 pm to 6:30 am, phone outside bedroom
- Exercise: 20-minute walk daily; badminton Sunday
- Work: plan top-3 tasks daily; ask for help after 45 minutes stuck
- Learning: 30 minutes daily on the project's tech stack
- Money: fixed budget; start SIP of Rs 2,000 after first salary
- Social: weekly call with family; make 2 friends in training batch
- Warning signs: poor sleep for a week, skipping meals, constant
  irritation -> talk to mentor or use the company EAP counselling
- Monthly check-in with myself: what is going well, what to change`,
    },
    {
      task: "Conduct a full 30-minute mock interview (10 min HR, 15 min technical, 5 min your questions) with a senior or friend and fill the review sheet with 3 dated action items.",
      hint: "Use the checklist from this lesson. Record the session if possible and review it within 24 hours.",
      solution: `Preparation checklist used:
[x] Resume printed, project explanation rehearsed
[x] 60-second intro, 6 STAR stories, company research (3 facts)
[x] Formal dress, camera/internet tested

Review (sample):
Intro 4/5 | Project 4/5 | Technical 3/5 | STAR 3/5 | HR 4/5 |
Body language 4/5 | Fillers 3/5 | Questions 4/5
Action items:
1. Practise 5 SQL query questions daily - by 22 Nov
2. Add metrics to 'teamwork' and 'failure' stories - by 21 Nov
3. Record intro twice daily to cut 'basically' - by 20 Nov
Next mock scheduled: 24 Nov with placement cell.`,
    },
  ],
  quiz: [
    { question: "Which is NOT one of Goleman's five components of emotional intelligence?", options: ["Self-awareness", "Empathy", "Self-regulation", "Technical expertise"], answer: 3, explanation: "The five are self-awareness, self-regulation, motivation, empathy and social skills." },
    { question: "What does SBI stand for in feedback?", options: ["Skill, Behaviour, Improvement", "Speak, Believe, Implement", "Situation, Behaviour, Impact", "Start, Build, Improve"], answer: 2, explanation: "SBI makes feedback specific and non-judgemental." },
    { question: "What is the best first response to harsh feedback?", options: ["Defend immediately", "Listen fully and seek to understand", "Complain to HR", "Ignore it"], answer: 1, explanation: "Listening first allows you to find the useful part and respond calmly." },
    { question: "Which chat message follows good etiquette?", options: ["Full question with context and what you tried in one message", "'Hi' and wait for a reply", "Many short messages: 'Sir', 'Are you there?'", "@everyone for a personal question"], answer: 0, explanation: "A complete message respects the reader's time." },
    { question: "In a mixed group of colleagues from different states, which language should you speak?", options: ["Your regional language", "Whatever is fastest for you", "Do not speak", "A common language everyone understands"], answer: 3, explanation: "Using a common language includes everyone." },
    { question: "What is the most effective way to improve after mock interviews?", options: ["Do one mock and stop", "Only practise technical questions", "Score each area, note specifics and set dated action items", "Memorise answers word for word"], answer: 2, explanation: "A feedback loop with specific actions leads to measurable improvement." },
  ],
};
