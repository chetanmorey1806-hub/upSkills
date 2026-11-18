export default {
  id: "day-09-behavioural-interviews-star-method",
  title: "Behavioural Interviews and the STAR Method",
  module: "Module 3: Interview Skills",
  day: 9,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Answer 'Tell me about a time when...' questions with confidence using the STAR method (Situation, Task, Action, Result), build a personal story bank from college projects, internships and life experiences, and adapt stories to different competencies.",
  objectives: [
    "Recognise behavioural questions and the competency behind each",
    "Structure answers using Situation, Task, Action, Result",
    "Build a story bank of 6-8 experiences that cover common competencies",
    "Focus on your personal actions using 'I' while respecting the team",
    "Add measurable results and learnings to every story",
  ],
  theory: [
    {
      heading: "What Are Behavioural Questions?",
      content: `Behavioural questions ask about your past behaviour to predict future behaviour. They usually begin with 'Tell me about a time when...', 'Give an example of...', or 'Describe a situation where...'. Product companies like Amazon, Microsoft and Flipkart use them heavily, and service companies increasingly use them in HR and managerial rounds.\n\nEach question tests a competency: teamwork, leadership, conflict handling, failure, pressure, initiative, problem-solving, adaptability, customer focus or ethics. A vague or hypothetical answer ('I would...') fails; the interviewer wants a real story.`,
      points: [
        "Teamwork: 'a time you worked in a difficult team'",
        "Leadership: 'a time you took the lead without authority'",
        "Conflict: 'a disagreement with a teammate or teacher'",
        "Failure: 'a time you failed or made a mistake'",
        "Pressure: 'a tight deadline'",
        "Initiative: 'something you did beyond your responsibility'",
      ],
    },
    {
      heading: "The STAR Method",
      content: `STAR keeps your story focused and complete.\n\n**S - Situation** (10-15%): the context. Where, when, who. Keep it short. **T - Task** (10-15%): your responsibility or the challenge. **A - Action** (50-60%): what YOU specifically did, step by step. This is the most important part. **R - Result** (15-20%): what happened, ideally with numbers, plus what you learned.\n\nA good STAR answer takes 1.5 to 2 minutes. Many freshers spend 80% of the time on the situation and then rush the action. Reverse that.`,
      points: [
        "Situation: brief context",
        "Task: your goal or problem",
        "Action: your specific steps (most time here)",
        "Result: outcome + number + learning",
      ],
      tip: "Add an L for Learning at the end (STAR-L). Interviewers love to hear what you would do differently.",
    },
    {
      heading: "'I' vs 'We'",
      content: `Freshers often say 'We did this, we did that' throughout the answer. The interviewer cannot tell what YOU did. In the Action part, use 'I': 'I analysed the logs', 'I proposed a new schedule', 'I spoke to the teammate privately'.\n\nThis is not about taking credit for others' work. Mention the team in the situation and result ('Our team finished on time'), but make your individual contribution clear in the action.`,
      points: [
        "Situation and Result: 'we' is fine",
        "Action: use 'I' for your steps",
        "Give credit to others honestly where due",
      ],
    },
    {
      heading: "Building Your Story Bank",
      content: `You cannot prepare for every question, but you can prepare 6-8 strong stories and adapt them. Sources for freshers: final-year project, mini projects, internships, hackathons, college fests and committees, NSS/NCC, sports, part-time jobs, tutoring, family business, and even handling a personal challenge.\n\nWrite each story in STAR format and tag it with the competencies it covers. One hackathon story might show teamwork, pressure and problem-solving. When a question comes, pick the story that fits best.`,
      points: [
        "Story 1: a technical problem you solved",
        "Story 2: a team conflict or disagreement",
        "Story 3: a failure or mistake and recovery",
        "Story 4: leadership or initiative",
        "Story 5: tight deadline / pressure",
        "Story 6: learning something new quickly",
        "Story 7: helping someone / customer focus",
        "Story 8: an ethical choice",
      ],
      tip: "Keep a table: Story name | Competencies | Key numbers. Revise it before every interview.",
    },
    {
      heading: "Adding Results and Learnings",
      content: `Results make your story believable. Use numbers wherever possible: time saved, marks improved, users served, bugs fixed, money raised, rank achieved. If the result was not positive (a failure story), the learning becomes the result: what you changed and how it helped later.\n\nAlso, results can be qualitative: 'The professor asked us to present the solution to the junior batch', 'The teammate thanked me and we worked well after that'.`,
      points: [
        "Quantitative: 40% faster, 300 users, 2 days early",
        "Qualitative: appreciation, adoption, improved relationship",
        "Learning: what you would do differently",
      ],
    },
    {
      heading: "Common Mistakes in Behavioural Answers",
      content: `Avoid giving hypothetical answers ('I would talk to him'); the question asks what you did. Avoid stories where you look like the hero and everyone else is bad. Avoid blaming others in conflict stories. Avoid stories without a clear ending. And do not invent stories; follow-up questions ('What did your teammate say exactly?', 'What would you do differently?') expose made-up stories quickly.`,
      points: [
        "Hypothetical instead of real",
        "Too long situation, too little action",
        "Blaming teammates",
        "No result or learning",
        "Fabricated stories that collapse under follow-up questions",
      ],
    },
  ],
  examples: [
    {
      title: "Conflict in a Team (STAR)",
      scenario: "Question: 'Tell me about a time you had a disagreement with a teammate.'",
      steps: [
        "S: final-year project context",
        "T: the disagreement and your role",
        "A: steps you took to resolve it",
        "R: outcome and learning",
      ],
      code: `S: "In my final-year project, a 4-member team building a hospital
appointment app, my teammate Raj and I disagreed on the tech stack. He wanted
MongoDB, I preferred MySQL."

T: "We had to finalise the design within a week, and the argument was
delaying the whole team."

A: "I suggested we stop debating opinions and compare based on our actual
requirements. I listed our data: patients, doctors, appointments, with strong
relationships. I made a small table comparing both databases on our needs and
asked Raj to add his points. I also acknowledged that MongoDB was better for
flexible schemas. We then asked our guide for a 10-minute review."

R: "We chose MySQL with Raj's agreement, and Raj took ownership of the
reporting module. We finished the design two days early. I learned that
facts and requirements resolve disagreements better than arguments."`,
      result: "Shows maturity, data-driven thinking and respect for the teammate.",
      explanation: "Action is the longest part, uses 'I', and the result includes a number and a learning. No blame.",
    },
    {
      title: "Failure Story (STAR-L)",
      scenario: "Question: 'Tell me about a time you failed.'",
      steps: [
        "Pick a genuine but not catastrophic failure",
        "Own your part",
        "Explain recovery and learning",
      ],
      code: `S: "In my second year, I applied for a Google Summer of Code project."
T: "I needed to submit a proposal and make at least one accepted
contribution to the organisation's repository."
A: "I started three weeks before the deadline, spent most of the time reading
the code base and submitted my first pull request just two days before.
It was not reviewed in time, and my proposal was rejected."
R: "I was not selected. But I learned to start early and contribute small
fixes first. Next year, I started contributing four months early, got 6 pull
requests merged in an open-source Python library and was selected for a
paid open-source internship."
L: "Now, for any big goal, I break it into weekly milestones."`,
      result: "Interviewer sees accountability and the ability to learn from failure.",
      explanation: "The candidate owns the failure without excuses and shows clear improvement with evidence.",
    },
    {
      title: "Weak vs Strong: Working Under Pressure",
      scenario: "Question: 'Describe a time you worked under a tight deadline.'",
      steps: [
        "Compare the vague answer with the STAR answer",
      ],
      code: `WEAK:
"I always work well under pressure. In college we had many deadlines and we
always completed on time. I don't panic."

STRONG:
"S: During my internship, the client demo was moved two days earlier.
T: I had to finish the PDF export feature for the dashboard by Wednesday
instead of Friday.
A: I listed the remaining work, cut the optional styling, and asked my
mentor to approve that. I reused an existing library instead of writing my
own and worked with the tester in parallel so testing happened the same day.
R: The feature was ready by Tuesday evening and the demo went smoothly.
The client approved the next phase."`,
      result: "The strong answer proves the claim with a specific situation and actions.",
      explanation: "Generic claims without stories are ignored in behavioural interviews.",
    },
    {
      title: "Initiative / Leadership Without Authority",
      scenario: "Question: 'Give an example of when you took initiative.'",
      steps: [
        "Find a moment where you did something nobody asked you to",
        "Show the impact on others",
      ],
      code: `S: "In my hostel, students often missed placement notices because they
were shared in many WhatsApp groups."
T: "Nobody was responsible for this, but it was affecting my batchmates."
A: "I built a simple Telegram bot in Python that forwarded official
placement emails from the TPO to a single channel, with company name,
eligibility and deadline. I took permission from the TPO and shared it in
all hostel groups."
R: "Within a month, 420 students joined the channel. The TPO started using it
officially for our batch, and missed-deadline complaints dropped almost to
zero."`,
      result: "Shows ownership, technical skill and real-world impact.",
      explanation: "Initiative stories are strongest when they solve a real problem and others adopt the solution.",
    },
  ],
  interview: [
    { q: "Tell me about a time you worked in a team.", a: `S: In our college tech fest, I was part of a 6-member team managing online registrations. T: We had to handle registrations for 1,200 participants in 10 days. A: I built the Google Form and connected it to a Sheet with automatic confirmation emails using Apps Script, while others handled publicity. I also trained two juniors to manage queries. R: We registered 1,450 participants, 20% above target, with zero manual email work. I learned that dividing work by strengths makes teams fast.`, level: "Easy" },
    { q: "Describe a time you had to learn something quickly.", a: `S: In my internship, I was assigned a task in Angular, which I had never used. T: I had to add a filter feature in 10 days. A: I spent the first three days on a focused course, read the existing code to understand the project structure, and asked my mentor specific questions in a 15-minute daily call. R: I delivered the feature in 8 days and it went to production. I learned to learn from the existing codebase, not only tutorials.`, level: "Easy" },
    { q: "Tell me about a mistake you made and how you handled it.", a: `S: During my internship, I ran a script that updated test data on the shared QA database. T: I had to update 50 records but my WHERE condition was wrong. A: It updated 2,000 records. I immediately informed my mentor, explained what happened, and helped restore the data from the morning backup. I then wrote a checklist: run SELECT with the same condition first, and use transactions. R: Data was restored in an hour. I have not repeated the mistake, and the team added my checklist to their wiki.`, level: "Medium" },
    { q: "Give an example of handling a difficult person.", a: `S: In a group assignment, one member rarely attended meetings. T: As coordinator, I needed his part on time. A: Instead of complaining to the professor, I spoke to him privately. He shared he was managing a part-time job. We moved meetings to evenings and gave him a smaller but critical module with a clear deadline. R: He completed his part on time, and we got an A grade. I learned that understanding the reason behind behaviour helps more than confrontation.`, level: "Medium" },
    { q: "Tell me about a time you went beyond what was expected.", a: `S: In my internship, my task was to fix 5 UI bugs. T: While fixing them, I noticed the page took 6 seconds to load. A: After finishing my assigned bugs, I checked with my mentor and spent two days analysing the issue; I found uncompressed images and repeated API calls. I fixed both. R: Load time dropped to 1.8 seconds, and my mentor presented it in the team review. It taught me to always look for improvements beyond the ticket.`, level: "Medium" },
    { q: "Describe a situation where you had to make a decision without complete information.", a: `S: During our hackathon, the API we planned to use went down 10 hours before the demo. T: We had to decide whether to wait or switch. A: I quickly checked their status page with no ETA, so I proposed switching to mock data with the same structure so the demo would still work, and kept the integration code ready. R: We demoed successfully and explained the mock clearly; judges appreciated the honesty and we finished in the top 5. I learned to make a reversible decision quickly instead of waiting.`, level: "Hard" },
    { q: "Tell me about a time you disagreed with your teacher or manager.", a: `S: My project guide wanted us to add a chat feature two weeks before submission. T: I felt it would risk our core features. A: I respectfully showed him our remaining task list with estimates and suggested completing the core first and adding chat as a stretch goal. R: He agreed. We finished the core features well and added a basic chat in the last three days. I learned that disagreement works when you bring data and a solution.`, level: "Hard" },
    { q: "What is the STAR method?", a: `STAR stands for Situation, Task, Action and Result. It is a structure for answering behavioural questions. The situation gives context, the task explains the challenge, the action describes what I specifically did, and the result shows the outcome, ideally with numbers and learning. Most of the time should go to the action.`, level: "Easy" },
    { q: "Tell me about a time you helped someone.", a: `S: My classmate from a Hindi-medium background struggled with programming in English. T: He was at risk of failing the data structures exam. A: I offered to study with him three evenings a week for a month, explained concepts in Hindi first and then in English terms, and gave him small daily problems. R: He passed with 68 marks, and later he cleared a campus placement. I learned that explaining concepts made my own fundamentals stronger.`, level: "Easy" },
    { q: "Describe an ethical dilemma you faced.", a: `S: During an online exam, a classmate shared answers in a WhatsApp group. T: I had to decide whether to use them. A: I left the group for the exam duration and wrote my own answers. After the exam, I told the class representative that such sharing could get the whole class penalised, without naming anyone. R: I scored lower than some others in that test, but I was comfortable with my decision. Integrity matters more to me than one test score.`, level: "Hard" },
    { q: "Tell me about your biggest achievement.", a: `S: In third year, I participated in Smart India Hackathon. T: Our team of six had to build a solution for tracking water tankers in rural areas within 36 hours. A: I designed the backend in Node.js with live GPS updates and coordinated the integration with the Android app. When the map stopped updating at 3 am, I debugged the socket connection and fixed it. R: We won second prize nationally in our problem statement. It showed me I can perform under pressure and lead technical integration.`, level: "Medium" },
  ],
  practice: [
    {
      task: "Build your story bank: write 6 stories in a table with columns Story | Competencies | Key numbers.",
      hint: "Use projects, internships, hackathons, fests, sports, NSS, family business, tutoring.",
      solution: `Story | Competencies | Key numbers
1. Hostel Telegram bot | Initiative, technical, impact | 420 users
2. MySQL vs MongoDB disagreement | Conflict, teamwork, data-driven | 2 days early
3. GSoC rejection, then success | Failure, learning, persistence | 6 PRs merged
4. Internship demo moved early | Pressure, prioritisation | 1 day ahead
5. Learning Angular in 8 days | Fast learning, adaptability | 8 days
6. Teaching classmate DSA | Helping, communication | Passed with 68
Revise this table before every interview.`,
    },
    {
      task: "Write a full STAR answer for 'Tell me about a time you worked under pressure' using your own experience. Mark S, T, A, R.",
      hint: "Keep Action as the longest part. End with a number and a learning.",
      solution: `S: "Two days before our final-year project submission, our laptop with the
latest code crashed."
T: "As the team member managing the repository, I had to recover the work and
make sure we submitted on time."
A: "I checked GitHub and found the last push was three days old. I listed the
features added since then, split them among 3 teammates based on who wrote
them originally, and we rewrote them in one day, pushing every 2 hours. I
also set up a rule: push at least twice daily."
R: "We submitted on time and scored 9/10 in the viva. We never lost code again.
I learned that backups and version control discipline are not optional."`,
    },
    {
      task: "Convert this weak answer into STAR: 'I am a good leader. I led many events in college and they were all successful.'",
      hint: "Pick ONE event. Add context, your specific actions and numbers.",
      solution: `S: "I was the coordinator for our department's annual coding contest."
T: "We had 3 weeks, a budget of Rs 15,000 and a target of 200 participants."
A: "I formed three sub-teams for questions, publicity and logistics, with a
lead for each. I held 20-minute weekly check-ins, negotiated with a local
ed-tech startup for sponsorship of prizes, and arranged HackerRank for the
platform. When the lab server failed a day before, I arranged a backup lab."
R: "We had 310 participants, the highest ever, and spent only Rs 11,000 due
to sponsorship. Our HoD asked us to run it again next year."`,
    },
    {
      task: "Practise with a friend: they ask 3 random behavioural questions; you answer each in under 2 minutes using your story bank. Ask them to note whether they could identify S, T, A and R clearly.",
      hint: "Before answering, take 3-5 seconds to choose the best-fitting story.",
      solution: `Sample feedback sheet:
Q1 'Time you showed leadership' -> Coding contest story.
   S/T clear, Action detailed, Result with numbers. Time 1:50. Good.
Q2 'Time you failed' -> GSoC story. Situation too long (40s). Shorten.
Q3 'Time you helped a customer' -> Used tutoring story; fit was weak.
   Action: create a customer-focused story (e.g. helping shop customers in
   family business, or internship user feedback).
Improve the story bank based on gaps found.`,
    },
  ],
  quiz: [
    { question: "What does STAR stand for?", options: ["Skill, Talent, Ability, Result", "Situation, Task, Action, Result", "Start, Try, Act, Repeat", "Story, Time, Answer, Review"], answer: 1, explanation: "STAR = Situation, Task, Action, Result." },
    { question: "Which part of STAR should take the most time?", options: ["Action", "Situation", "Task", "Result"], answer: 0, explanation: "Action shows what you did and is what the interviewer evaluates most." },
    { question: "A behavioural question usually starts with:", options: ["What is the difference between...", "Write a program to...", "Define...", "Tell me about a time when..."], answer: 3, explanation: "Behavioural questions ask about real past experiences." },
    { question: "Which statement belongs in the Action part?", options: ["We were a team of four", "The project was in final year", "I analysed the logs and found the connection leak", "We got an A grade"], answer: 2, explanation: "Action describes your specific steps using 'I'." },
    { question: "What is wrong with answering 'I would talk to the teammate politely'?", options: ["It is too short", "It is hypothetical, not a real past example", "It uses 'I'", "Nothing is wrong"], answer: 1, explanation: "Behavioural questions need real past stories, not what you would do." },
    { question: "Why build a story bank of 6-8 stories?", options: ["So you can adapt real stories to many different questions", "To memorise word for word", "Because interviewers ask exactly 8 questions", "To avoid answering"], answer: 0, explanation: "Each story covers several competencies and can be adapted." },
  ],
};
