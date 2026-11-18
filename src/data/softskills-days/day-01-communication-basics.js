export default {
  id: "day-01-communication-basics",
  title: "Communication Basics: Verbal, Non-Verbal, Active Listening and Barriers",
  module: "Module 1: Communication Skills",
  day: 1,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Understand what communication really is, the difference between verbal and non-verbal messages, how to listen actively, and how to remove the common barriers that make freshers sound unclear in interviews and at work.",
  objectives: [
    "Explain the communication process: sender, message, channel, receiver and feedback",
    "Differentiate verbal, non-verbal, written and visual communication",
    "Practise active listening using paraphrasing and clarifying questions",
    "Identify common barriers (language, noise, assumptions, emotions) and how to fix them",
    "Apply the 7 Cs of communication to everyday messages at college and work",
  ],
  theory: [
    {
      heading: "What is Communication?",
      content: `Communication is the process of sending a message so that the other person understands it the way you meant it. The important word is "understands". If you speak for five minutes and the interviewer is still confused, communication has not happened.\n\nEvery communication has five parts: the **sender** (you), the **message** (your idea), the **channel** (face-to-face, phone, email, Teams chat), the **receiver** (interviewer, manager, client) and **feedback** (their reply, nod, or follow-up question). Good communicators keep checking feedback and adjust.\n\nIn IT companies like TCS, Infosys, Wipro or a product startup, you will spend almost half of your day communicating: stand-up meetings, emails, chat with testers, client calls. That is why almost every placement drive has an HR round and many have a separate communication or versant test.`,
      points: [
        "Sender encodes the idea into words, tone and gestures",
        "Receiver decodes it using their own knowledge and mood",
        "Feedback closes the loop and tells you whether the message landed",
        "Noise is anything that disturbs the message: network lag, jargon, stress",
      ],
      tip: "Communication is judged by what the listener understood, not by what you said.",
    },
    {
      heading: "Types of Communication",
      content: `**Verbal communication** uses spoken words: interviews, meetings, phone calls. **Written communication** uses text: emails, resumes, chat messages, documentation. **Non-verbal communication** uses body language, facial expressions, posture, eye contact and tone of voice. **Visual communication** uses diagrams, slides and charts.\n\nResearch on first impressions often shows that people trust non-verbal signals more than words. If you say "I am very confident" while looking at the floor and playing with your pen, the interviewer believes your body, not your words.`,
      points: [
        "Verbal: choose simple words, speak at a steady pace",
        "Non-verbal: posture, smile, eye contact, hand gestures",
        "Paralanguage: tone, pitch, volume and pauses in your voice",
        "Written: grammar, structure and politeness matter because there is no tone to help you",
      ],
      tip: "Match your words, tone and body. When all three say the same thing, you sound believable.",
    },
    {
      heading: "Active Listening",
      content: `Most people listen to reply, not to understand. Active listening means giving full attention, understanding the message, and showing the speaker that you understood. In interviews, many freshers give wrong answers simply because they did not listen to the full question.\n\nActive listening has simple steps: stop doing other things, look at the speaker, do not interrupt, nod or say small acknowledgements like "okay" or "I see", then paraphrase ("So you want me to explain the project architecture, right?") and ask clarifying questions if something is not clear.`,
      points: [
        "Pay attention: no phone, no looking around",
        "Show you are listening: nod, short verbal cues",
        "Paraphrase: repeat the key point in your own words",
        "Clarify: ask a question instead of guessing",
        "Respond: answer only after the speaker finishes",
      ],
      tip: "In a technical round, repeating the question in your own words also gives you 5 extra seconds to think.",
    },
    {
      heading: "Barriers to Communication",
      content: `A barrier is anything that blocks or distorts the message. Common barriers for Indian freshers are: translating from the mother tongue, using too much jargon, speaking too fast due to nervousness, assumptions about what the other person knows, and emotional barriers like fear of judgement.\n\nAt work, there are also physical barriers (noisy office, bad Wi-Fi on a Zoom call), cultural barriers (a US client may expect direct "yes" or "no", while we often say "I will try"), and organisational barriers (message passing through too many people).`,
      points: [
        "Language barrier: unclear grammar, heavy accent, mother tongue influence",
        "Physical barrier: noise, poor audio or video, distance",
        "Psychological barrier: fear, stress, low confidence, ego",
        "Semantic barrier: same word, different meaning (e.g. 'revert' used for 'reply')",
        "Cultural barrier: different expectations about directness and politeness",
      ],
      tip: "Indian English habit to fix: 'Please revert' actually means 'go back'. In emails, write 'Please reply' or 'Please let me know'.",
    },
    {
      heading: "The 7 Cs of Effective Communication",
      content: `A simple checklist that works for spoken answers, emails and presentations. Before sending any important message, quickly check it against the 7 Cs.`,
      points: [
        "Clear: one main idea, simple words",
        "Concise: no unnecessary words or long stories",
        "Concrete: specific facts and numbers ('reduced load time by 30%')",
        "Correct: right grammar, right facts, right names",
        "Coherent: logical flow from one point to the next",
        "Complete: includes everything the receiver needs to act",
        "Courteous: polite and respectful tone",
      ],
      tip: "If your message fails 'Concise' and 'Complete' at the same time, you are giving the wrong details. Cut stories, keep facts.",
    },
    {
      heading: "Communication in the Indian IT Workplace",
      content: `Freshers usually join as trainees, then move into project teams. You will talk to team leads, testers, business analysts and sometimes onsite clients in the US, UK or Australia. Expectations are simple: be clear, be on time, and raise problems early.\n\nA classic fresher mistake is staying silent when stuck for two days because of fear. Managers prefer a short message like "I am blocked on the login API since morning. I tried X and Y. Can someone help for 10 minutes?" That is good communication: clear, concrete and honest.`,
      points: [
        "Daily stand-up: what I did yesterday, what I will do today, any blockers",
        "Use status words clearly: done, in progress, blocked",
        "Confirm understanding of tasks before you start coding",
        "Over-communicate in remote teams: short updates are better than silence",
      ],
    },
  ],
  examples: [
    {
      title: "Paraphrasing an Interview Question (Good vs Bad)",
      scenario: "In a Wipro technical round, the interviewer asks a long question about your final-year project database. The student is not sure what exactly is being asked.",
      steps: [
        "Listen to the full question without interrupting",
        "Paraphrase the key part of the question",
        "Ask one clarifying question if needed",
        "Then answer in a structured way",
      ],
      code: `BAD:
"Sir, actually our project is very good, we used MySQL and also Python and
the front end is also there, so database is like... many tables are there."

GOOD:
"Just to make sure I understood: you want to know how I designed the database
tables and why I chose MySQL, right?
(Interviewer: Yes.)
Sure. We had 4 main tables: users, products, orders and payments. I chose
MySQL because the data was structured and needed relationships through
foreign keys..."`,
      result: "Interviewer sees a candidate who listens carefully and answers exactly what is asked.",
      explanation: "Paraphrasing confirms understanding, buys thinking time and shows active listening. The bad answer jumps in without structure and uses filler words like 'actually' and 'like'.",
    },
    {
      title: "Reporting a Blocker in Stand-up",
      scenario: "You are a trainee in a Java project at Infosys. You could not finish your task because the test database is down.",
      steps: [
        "Say what you completed",
        "Say what you are working on today",
        "State the blocker clearly with what you already tried",
        "Ask for specific help",
      ],
      code: `"Yesterday I completed the employee search API and pushed it for review.
Today I am working on the update API.
One blocker: the test database is down since 10 am, so I cannot run
integration tests. I checked the connection string and pinged the server.
Can Ravi from DevOps help me check it after this call?"`,
      result: "The lead understands the status in 20 seconds and can assign help immediately.",
      explanation: "It follows the stand-up structure and is concrete. It shows initiative (what you tried) instead of just complaining.",
    },
    {
      title: "Removing a Semantic Barrier in Email",
      scenario: "A fresher writes to a client in Australia using Indian English phrases that the client may misread.",
      steps: [
        "Find phrases that are common in India but unclear globally",
        "Replace them with simple standard English",
        "Re-read for tone and clarity",
      ],
      code: `BEFORE:
"Kindly do the needful and revert back at the earliest. I have one doubt
regarding the prepone of the meeting."

AFTER:
"Could you please share the updated file and reply by Thursday?
I have a question about moving the meeting to an earlier date."`,
      result: "The client understands exactly what is needed and by when.",
      explanation: "Phrases like 'do the needful', 'revert back', 'doubt' (for question) and 'prepone' are understood in India but confuse many global readers. Specific deadlines remove ambiguity.",
    },
    {
      title: "Matching Words and Body Language",
      scenario: "An HR interviewer asks: 'Are you comfortable working in night shifts?' The candidate says yes but looks uncomfortable.",
      steps: [
        "Decide your honest answer before the interview",
        "Answer with steady eye contact and a calm tone",
        "Add a short reason so the answer is believable",
      ],
      code: `WEAK (words and body mismatch):
"Yes... yes, no problem." (looks down, long pause, forced smile)

STRONG:
"Yes, I am comfortable. I understand support projects work with US clients,
and I have already discussed shift timings with my family. I would just like
to know the shift rotation policy."`,
      result: "The interviewer trusts the answer because tone, eyes and words are consistent.",
      explanation: "Non-verbal signals are trusted more than words. A clear reason and a sensible follow-up question show maturity.",
    },
  ],
  interview: [
    { q: "What do you understand by communication skills?", a: `Communication skills are the ability to share ideas clearly and to understand others correctly. It includes speaking, writing, listening and body language. For example, in my college project I had to explain our module to teammates who worked on the front end, so I used a simple diagram and short points. Good communication means the other person understands and can act on what I said.`, level: "Easy" },
    { q: "Why are communication skills important for a software engineer?", a: `Software is built by teams. A developer needs to understand requirements from business analysts, explain progress in stand-ups, write clear emails and documentation, and sometimes talk to clients. Even a great coder creates problems if they misunderstand a requirement. That is why companies test communication along with technical skills.`, level: "Easy" },
    { q: "What is active listening? How do you practise it?", a: `Active listening means listening with full attention to understand, not just to reply. I practise it by keeping my phone away, maintaining eye contact, not interrupting, paraphrasing the key point and asking clarifying questions. For example, before starting a task I repeat the requirement back to my lead to confirm I understood it correctly.`, level: "Easy" },
    { q: "What are the barriers to effective communication?", a: `The main barriers are language barriers like grammar or accent, physical barriers like noise or poor network, psychological barriers like fear and stress, semantic barriers where words mean different things, and cultural barriers. We can reduce them by using simple language, confirming understanding, choosing the right channel and staying calm.`, level: "Easy" },
    { q: "Tell me about a time when there was a misunderstanding in your team. How did you fix it?", a: `In our final-year project, two of us built the same login page because the task division was only discussed verbally. We lost two days. I suggested we maintain a shared task sheet in Google Sheets with owner and status for each task, and do a 10-minute call every evening. After that, there was no duplicate work, and we finished the project a week before the deadline. I learned that important decisions should always be written down.`, level: "Medium" },
    { q: "How do you communicate with someone who does not understand technical terms?", a: `I avoid jargon and use real-life analogies. For example, to explain an API to a non-technical person, I say it is like a waiter in a restaurant: you give your order to the waiter, he goes to the kitchen and brings back food. I also check understanding by asking if they would like me to explain any part again.`, level: "Medium" },
    { q: "Is English fluency the same as good communication?", a: `No. Fluency helps, but good communication is about clarity, structure, listening and confidence. A person with simple English who explains clearly and listens well communicates better than a person who uses big words but confuses the listener. I focus on being clear and correct first, and I am improving my fluency every day.`, level: "Medium" },
    { q: "How would you handle a team member who keeps interrupting you in meetings?", a: `I would first stay calm and let them finish, then politely say, 'Can I just complete my point? Then I would like to hear your view.' If it continues, I would speak to them privately after the meeting, without blaming, and explain that I value their inputs but want both of us to get time. Most of the time people do not even realise they are interrupting.`, level: "Medium" },
    { q: "What is the difference between hearing and listening?", a: `Hearing is a physical process: sound reaches our ears. Listening is a mental process: we pay attention, understand and respond. I can hear a lecture while thinking about something else, but I am not listening. In interviews and meetings, listening is what matters.`, level: "Easy" },
    { q: "How do you make sure your message is understood in a remote team?", a: `In remote teams there is no body language, so I keep messages short and structured, use bullet points, mention deadlines clearly, and confirm with a follow-up like 'Please let me know if this is clear.' After important calls, I send a short summary email of decisions and action items so that everyone has the same understanding.`, level: "Hard" },
    { q: "Rate your communication skills out of 10 and justify.", a: `I would rate myself 7 out of 10. I explain technical concepts clearly, and I presented our project at the college tech fest in front of 200 students. I am still improving my spontaneous speaking in English, so I practise by recording 2-minute talks daily and joining group discussions. I am confident I will reach 9 in the next year with real work exposure.`, level: "Hard" },
  ],
  practice: [
    {
      task: "Watch a 3-minute English news clip or TED talk. Without pausing, then write a 4-line summary. Compare it with the clip to check what you missed.",
      hint: "Listen for the main idea, two supporting points and the conclusion. Do not try to note every word.",
      solution: `Sample approach:
1. Main idea: The speaker says small daily habits matter more than big goals.
2. Point 1: Habits compound like interest, 1% better daily.
3. Point 2: Focus on systems, not only targets.
4. Conclusion: Start with a habit so small you cannot say no.
Self-check: if you missed a point, listen again and note which part distracted you.
Repeat this daily for two weeks to build active listening.`,
    },
    {
      task: "Rewrite this message using the 7 Cs: 'Hi sir, actually I wanted to tell that I have some doubt in the module and also maybe the deadline can we extend because some issue is there, kindly do the needful.'",
      hint: "State the question clearly, give a concrete reason, propose a new date.",
      solution: `Hi Suresh,

I have a question about the payment module: should failed transactions be
retried automatically or shown to the user?

Also, the test server was down for one day this week, so I need one extra
day. Can we move the deadline from Friday to Monday?

Thanks,
Priya`,
    },
    {
      task: "Make a list of 6 Indian English phrases you commonly use and write the globally clear version for each.",
      hint: "Think of words like revert, prepone, do the needful, doubt, out of station, passed out.",
      solution: `1. Please revert -> Please reply
2. Prepone the meeting -> Move the meeting earlier
3. Do the needful -> Please share the file / approve the request (be specific)
4. I have a doubt -> I have a question
5. I am out of station -> I am travelling / out of town
6. I passed out in 2025 -> I graduated in 2025`,
    },
    {
      task: "Practise a paraphrase-then-answer response for this question: 'Can you walk me through how your project handles user login and what happens if the password is wrong?'",
      hint: "Start with 'Just to confirm...' and split your answer into two parts.",
      solution: `"Just to confirm, you want to know the login flow and how we handle a wrong
password, right?

Sure. First, the login flow: the user enters email and password, the backend
checks the email in the users table and compares the hashed password using
bcrypt. If it matches, we create a JWT token and send it to the browser.

Second, wrong password: we return a generic message 'Invalid email or
password' so attackers cannot guess which one is wrong, and after 5 failed
attempts we lock the account for 15 minutes."`,
    },
  ],
  quiz: [
    { question: "Which part of the communication process tells the sender whether the message was understood?", options: ["Channel", "Feedback", "Encoding", "Noise"], answer: 1, explanation: "Feedback is the receiver's response; it closes the loop and shows whether the message landed." },
    { question: "A candidate says 'I am confident' while avoiding eye contact. Which signal will the interviewer most likely trust?", options: ["The non-verbal signal", "The words", "Neither", "Both equally"], answer: 0, explanation: "When words and body language conflict, people usually trust the non-verbal signal." },
    { question: "Which is an example of active listening?", options: ["Preparing your reply while the other person talks", "Interrupting to save time", "Checking your phone to look busy", "Paraphrasing the question before answering"], answer: 3, explanation: "Paraphrasing confirms understanding and shows the speaker you were listening." },
    { question: "Using the word 'revert' to mean 'reply' is an example of which barrier?", options: ["Physical", "Psychological", "Semantic", "Organisational"], answer: 2, explanation: "Semantic barriers happen when a word is understood differently by sender and receiver." },
    { question: "Which of the 7 Cs is improved by writing 'reduced page load time by 30%' instead of 'improved performance'?", options: ["Courteous", "Concrete", "Coherent", "Concise"], answer: 1, explanation: "Concrete communication uses specific facts and numbers." },
    { question: "You are stuck on a task for a full day. What is the best action?", options: ["Report the blocker with what you tried and ask for specific help", "Wait silently until you solve it", "Tell the lead the task is impossible", "Skip the task without informing anyone"], answer: 0, explanation: "Raising blockers early, with context, is expected in professional teams." },
  ],
};
