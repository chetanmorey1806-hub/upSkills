export default {
  id: "day-14-teamwork-time-management-problem-solving",
  title: "Teamwork, Time Management, Problem-Solving and Critical Thinking",
  module: "Module 4: Workplace Skills",
  day: 14,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Develop the everyday workplace skills that managers value most in freshers: being a dependable team member in Agile teams, planning and prioritising your work, solving problems systematically and thinking critically before acting.",
  objectives: [
    "Explain what makes a good team member in an Agile/IT project team",
    "Prioritise tasks using the Eisenhower matrix and time-blocking",
    "Estimate work realistically and communicate delays early",
    "Solve problems using a structured approach (define, analyse, options, decide, review)",
    "Apply critical thinking: question assumptions, check evidence and avoid biases",
  ],
  theory: [
    {
      heading: "Teamwork in IT Projects",
      content: `Software is built by teams: developers, testers, business analysts, designers, DevOps engineers and a scrum master or project manager. In Agile (Scrum), work is planned in sprints of 1-3 weeks, with daily stand-ups, sprint planning, reviews and retrospectives. Your success depends on how well you work with others, not just on your own code.\n\nA good team member is reliable (does what they promise), communicates status openly, helps others, accepts code review feedback, shares knowledge and does not blame. Tuckman's model describes how teams develop: Forming, Storming, Norming, Performing. Some conflict in the 'storming' stage is normal.`,
      points: [
        "Reliability: meet commitments or inform early",
        "Transparency: share progress and blockers in stand-ups",
        "Support: help teammates and ask for help",
        "Respect: in code reviews, critique the code, not the person",
        "Ownership: 'our' project, not 'my' module only",
      ],
      tip: "The fastest way to earn trust as a fresher: do small tasks well and on time, and keep people updated.",
    },
    {
      heading: "Handling Conflict in Teams",
      content: `Conflicts happen over technical choices, workload, deadlines or communication styles. Healthy conflict on ideas improves solutions; personal conflict harms teams. Address issues early and privately, focus on the problem and facts, listen to understand the other person's view, find common goals and agree on a solution. Escalate to the lead only if you cannot resolve it together.\n\nUse 'I' statements rather than accusations: 'I am finding it hard to test because builds arrive late' instead of 'You always deliver late.'`,
      points: [
        "Talk privately first, not in public channels",
        "Separate the person from the problem",
        "Use data and requirements to decide technical disputes",
        "Agree on actions and follow up",
      ],
    },
    {
      heading: "Time Management and Prioritisation",
      content: `As a trainee or junior engineer, you will juggle training assessments, tasks, meetings, bug fixes and learning. The **Eisenhower matrix** helps: Urgent + Important (do now: production bug), Important but not urgent (schedule: learning, refactoring, assessment preparation), Urgent but not important (minimise or delegate: some meetings, routine requests), Neither (eliminate: endless scrolling).\n\nOther useful techniques: **time-blocking** (reserve calendar blocks for focused work), the **Pomodoro technique** (25 minutes focus + 5 minutes break), a daily **top-3 list**, and batching small tasks like emails twice a day.`,
      points: [
        "Q1 Urgent + Important: do first",
        "Q2 Important, not urgent: schedule (this is where growth happens)",
        "Q3 Urgent, not important: limit or delegate",
        "Q4 Neither: drop",
        "Plan tomorrow's top 3 tasks before leaving today",
      ],
      tip: "When your manager gives you two urgent tasks, do not guess. Ask: 'Which one should I prioritise?'",
    },
    {
      heading: "Estimation and Managing Deadlines",
      content: `Freshers often under-estimate because they forget testing, code review, integration and unexpected issues. Break tasks into smaller pieces (a few hours each), estimate each, then add a buffer. Share estimates as ranges when uncertain: '2 to 3 days, depending on API access.'\n\nIf you see a deadline at risk, inform early, not on the deadline day. Bring options: reduce scope, get help, or move the date. Managers can handle bad news early; they cannot handle surprises late.`,
      points: [
        "Break work into small, estimable tasks",
        "Include testing, review and fixes in estimates",
        "Communicate risks as soon as you see them",
        "Offer options, not just problems",
      ],
    },
    {
      heading: "Structured Problem-Solving",
      content: `Whether it is a production bug, a slow report or a business problem, a structured approach works better than random trial and error. A simple 5-step method: (1) **Define** the problem precisely (what, where, when, impact). (2) **Analyse** root cause using data, logs and the '5 Whys'. (3) **Generate options**. (4) **Decide and act** based on impact, effort and risk. (5) **Review**: did it work, and how do we prevent recurrence?\n\nThe '5 Whys' technique asks 'why' repeatedly until you reach the root cause rather than fixing only the symptom.`,
      points: [
        "Define: 'Login fails for users with + in their email since Monday's release'",
        "Analyse: logs, recent changes, reproduce the issue",
        "Options: quick fix vs proper fix",
        "Decide: considering impact, effort, risk",
        "Review: add a test so it never repeats",
      ],
      tip: "Before asking for help, spend reasonable time (say 30-60 minutes), then ask with what you tried. This balances independence and speed.",
    },
    {
      heading: "Critical Thinking",
      content: `Critical thinking means evaluating information carefully before accepting it or acting on it. Ask: What is the evidence? What assumptions am I making? Is there another explanation? What would happen if I am wrong?\n\nCommon thinking traps: **confirmation bias** (looking only for evidence that supports your first idea), **jumping to conclusions** ('the database is slow' without measuring), **anchoring** (sticking to the first number you heard), and blindly copying solutions from the internet or AI tools without understanding them. In interviews, puzzles and guesstimates test this skill: interviewers watch your reasoning, not just the final number.`,
      points: [
        "Question assumptions",
        "Look for evidence and measure before concluding",
        "Consider alternative explanations",
        "Verify AI-generated or copied code before using it",
        "Think about consequences and edge cases",
      ],
    },
  ],
  examples: [
    {
      title: "Prioritising with the Eisenhower Matrix",
      scenario: "Monday morning for a trainee developer with six tasks.",
      steps: [
        "List all tasks",
        "Classify each into the four quadrants",
        "Plan the day accordingly",
      ],
      code: `Tasks:
1. Fix bug blocking QA testing (due today)
2. Prepare for training assessment on Friday
3. Reply to a non-urgent survey email
4. Attend optional webinar during focus hours
5. Learn Docker for next month's project
6. Scroll tech memes

Q1 (Do now)           : 1
Q2 (Schedule)         : 2 (1 hr daily), 5 (Tue/Thu 5-6 pm)
Q3 (Limit/Delegate)   : 3 (batch with emails at 4 pm), 4 (watch recording later)
Q4 (Drop)             : 6

Day plan:
9:30-12:00 Bug fix (Pomodoros)  | 12:00 update QA
2:00-3:00 Assessment prep       | 4:00 emails/survey
5:00-5:15 Plan tomorrow's top 3`,
      result: "The critical bug is fixed by noon, and important learning still gets time.",
      explanation: "Without prioritising, many freshers spend the morning on emails and webinars while the urgent bug waits.",
    },
    {
      title: "5 Whys Root Cause Analysis",
      scenario: "The daily sales report emailed to managers was empty this morning.",
      steps: [
        "Ask 'why' repeatedly until reaching a root cause",
        "Fix the root cause, not just the symptom",
        "Add prevention",
      ],
      code: `Problem: Daily sales report email was empty today.
Why 1? The report query returned zero rows.
Why 2? The sales table had no data for yesterday.
Why 3? The nightly data load job failed.
Why 4? The source system changed a column name from 'amt' to 'amount'.
Why 5? There was no alert when the load job failed, and no schema check.

Fix: Update the column mapping and rerun the load. Resend the report.
Prevention: Add a failure alert on the job and a schema validation step;
ask the source team to notify schema changes.`,
      result: "The report is fixed today and the same failure will be caught automatically next time.",
      explanation: "Fixing only 'Why 1' (rerunning the report) would not have solved anything. 5 Whys reaches a preventable cause.",
    },
    {
      title: "Communicating a Deadline Risk Early",
      scenario: "On Tuesday, you realise the feature due Friday will not be done because a third-party API has issues.",
      steps: [
        "Inform the lead as soon as the risk appears",
        "Give the cause, the impact and options",
      ],
      code: `BAD (Friday evening):
"Sorry, the feature is not done. The API was not working."

GOOD (Tuesday):
"Hi Priya, a quick heads-up on the SMS notification feature due Friday.
The vendor's SMS API is returning timeouts for about 40% of requests since
yesterday; I have raised a ticket with them (#55120).
Options:
1. Deliver the feature with email notification now and add SMS once the
   vendor fixes the API.
2. Wait for the vendor; risk of slipping to next Wednesday.
I suggest option 1. What do you think?"`,
      result: "The lead can adjust plans and inform stakeholders in time; trust increases.",
      explanation: "Early warning with options turns a problem into a manageable decision.",
    },
    {
      title: "Critical Thinking in a Guesstimate",
      scenario: "Interview question: 'How many two-wheelers are sold in Pune in a year?'",
      steps: [
        "State assumptions clearly",
        "Break the problem into parts",
        "Calculate and sanity-check",
      ],
      code: `"Let me make some assumptions.
Pune population: about 70 lakh. Average household size: 4,
so about 17.5 lakh households.
Assume 60% of households own at least one two-wheeler: about 10.5 lakh
households, and on average 1.3 vehicles each: about 13.6 lakh two-wheelers.
If a two-wheeler is replaced roughly every 8 years, replacement demand is
13.6 lakh / 8 = about 1.7 lakh per year.
Add new buyers, like students and new residents, say 20%: about 2 lakh
per year.
Sanity check: about 550 per day across a large city with many dealers seems
reasonable. So my estimate is around 2 lakh two-wheelers a year."`,
      result: "The interviewer evaluates the logical breakdown and stated assumptions, not the exact number.",
      explanation: "Critical thinking means structured reasoning, explicit assumptions and a sanity check.",
    },
  ],
  interview: [
    { q: "Are you a team player? Give an example.", a: `Yes. In our final-year project, our front-end member fell ill for two weeks before the review. I had completed my backend APIs, so I volunteered to take over the remaining screens. I coordinated with him over calls to understand his code, finished the screens and kept the team updated. We presented on time. For me, being a team player means caring about the team's goal, not just my own part.`, level: "Easy" },
    { q: "How do you manage your time when you have multiple deadlines?", a: `I list all tasks with their deadlines, classify them by urgency and importance, and plan my day with a top-3 list. I block time for focused work and use Pomodoro for difficult tasks. If two tasks clash, I inform the stakeholders early and ask for priorities. In my last semester, I managed internship work, project and exams using this method without missing any deadline.`, level: "Easy" },
    { q: "Tell me about a time you missed a deadline.", a: `In my internship, I estimated two days for an export feature but it took four, because I did not account for testing different file formats. I informed my mentor on day two, so the impact was limited. Since then, I break tasks into smaller parts and include testing and review time in estimates, and my estimates have become much more accurate.`, level: "Medium" },
    { q: "How do you approach a problem you have never seen before?", a: `I first define it clearly and reproduce it. Then I break it into smaller parts, check documentation, logs and similar past issues, and form a hypothesis. I test the hypothesis step by step. If I am stuck after a reasonable time, I ask a teammate, explaining what I have tried. After solving it, I note the learning for future reference.`, level: "Medium" },
    { q: "What would you do if a teammate is not contributing?", a: `I would first talk to them privately to understand the reason; there may be a problem I do not know about. I would offer help or suggest redistributing tasks according to strengths. If the issue continues and affects the deadline, I would discuss it with the lead objectively, focusing on the work impact, not blame.`, level: "Medium" },
    { q: "Your manager gives you a task with an unrealistic deadline. What do you do?", a: `I would not simply say no or silently accept. I would break the task down, estimate it honestly and share the reasoning with my manager. Then I would offer options: deliver a core version by the deadline, get extra help, or adjust the date. This way, the manager can make an informed decision.`, level: "Hard" },
    { q: "What is the Eisenhower matrix?", a: `It is a prioritisation tool with four quadrants based on urgency and importance: urgent and important tasks are done first; important but not urgent tasks are scheduled; urgent but not important tasks are minimised or delegated; and tasks that are neither are dropped. It helps focus on what truly matters, especially the important-not-urgent work like learning.`, level: "Easy" },
    { q: "Explain the 5 Whys technique with an example.", a: `It is a root cause analysis method where you keep asking why until you find the underlying cause. Example: the website is slow. Why? The product page takes 6 seconds. Why? It loads 200 high-resolution images. Why? Images are uploaded without compression. Why? The upload process has no resizing step. So the fix is adding automatic image compression on upload, not just buying a bigger server.`, level: "Medium" },
    { q: "How do you handle disagreement with a senior's technical decision?", a: `I first try to understand their reasoning, because they may have context I do not have. If I still have a concern, I share it privately and respectfully with data, for example performance numbers or a small prototype. If they decide to go ahead, I support the decision fully and do my best to make it work. Disagree and commit.`, level: "Hard" },
    { q: "How do you use AI tools like ChatGPT or Copilot responsibly in your work?", a: `I use them to speed up learning and boilerplate, but I always read and understand the generated code, test it, and check it against official documentation. I never paste confidential company code or client data into public tools, and I follow company policy on AI use. The responsibility for correctness is still mine.`, level: "Hard" },
    { q: "What is the difference between being busy and being productive?", a: `Being busy means doing many activities; being productive means making progress on what matters. A person can attend meetings and answer emails all day and still not finish the important task. I measure my day by whether my top priorities moved forward.`, level: "Easy" },
  ],
  practice: [
    {
      task: "List everything you need to do this week (college, job prep, personal) and classify each item into the Eisenhower matrix. Then create a time-blocked plan for tomorrow.",
      hint: "Be honest about Q4 time wasters. Protect at least 2 hours for Q2 tasks.",
      solution: `Sample:
Q1: Submit lab record (due tomorrow), fix project bug before review
Q2: DSA practice, resume update, mock interview, revise SQL joins
Q3: Group chat replies, helping a friend format a PPT (limit to 20 min)
Q4: Reels, random YouTube

Tomorrow's plan:
7:00-8:00   DSA (2 problems)                [Q2]
9:00-1:00   College
2:00-3:30   Lab record + submit             [Q1]
4:00-5:30   Project bug fix                 [Q1]
6:00-7:00   Resume update                   [Q2]
9:00-9:15   Plan next day
Social media: only 8:30-9:00 pm`,
    },
    {
      task: "Apply the 5 Whys to a real problem in your life or project (e.g. 'I keep missing my morning study time').",
      hint: "Keep asking why until you reach something you can control and change.",
      solution: `Problem: I keep missing my 6 am study slot.
Why 1? I wake up at 7:30.
Why 2? I sleep around 1:30 am.
Why 3? I watch videos on my phone in bed after midnight.
Why 4? The phone is next to my bed and I use it as an alarm.
Why 5? I have no separate alarm and no cut-off routine.
Fix: Buy a Rs 200 alarm clock, keep the phone charging outside the room
after 11 pm, sleep by 11:30. Review after one week: woke up at 6 on 5 of 7 days.`,
    },
    {
      task: "Write a message to your lead flagging a deadline risk on a task, with cause, impact and two options.",
      hint: "Use facts, not excuses. Recommend one option.",
      solution: `"Hi Vivek, a heads-up on the employee report export (due Thursday).
The report query takes 90 seconds on production-size data, which times out
in the browser. I found that the attendance table has no index on the date
column.
Options:
1. Add an index (needs DBA approval, approx. 1 day) and deliver Friday.
2. Deliver Thursday with a 3-month date limit, and full range next week.
I recommend option 1 since users need yearly reports. Please let me know."`,
    },
    {
      task: "Solve this guesstimate aloud and write your reasoning: 'How many cups of tea are sold in a day at a busy railway station like Pune Junction?'",
      hint: "Estimate footfall, percentage of tea drinkers, cups per person, and sanity-check with number of stalls.",
      solution: `Assumptions:
- Daily footfall: about 2 lakh passengers + visitors.
- About 30% buy tea or chai: 60,000 people.
- Average 1.2 cups each: about 72,000 cups.
Sanity check by supply side:
- Around 40 stalls and vendors; each serves about 1 cup every 30 seconds in
  peak hours (8 hours) and slower otherwise: about 1,500-2,000 cups/stall/day.
- 40 x 1,800 = 72,000. Both methods agree.
Estimate: roughly 70,000 cups per day.
Key point: state assumptions, use two methods, and check consistency.`,
    },
  ],
  quiz: [
    { question: "In the Eisenhower matrix, where does 'learning a new skill for next month' belong?", options: ["Urgent and important", "Urgent, not important", "Important, not urgent", "Neither"], answer: 2, explanation: "Learning is important for growth but rarely urgent, so it should be scheduled." },
    { question: "You realise on Tuesday that a Friday deadline is at risk. When should you inform your lead?", options: ["Friday evening", "As soon as possible, with options", "After the deadline", "Never"], answer: 1, explanation: "Early warnings with options let the team adjust plans." },
    { question: "What is the main purpose of the 5 Whys technique?", options: ["To find the root cause of a problem", "To blame someone", "To estimate time", "To write documentation"], answer: 0, explanation: "Repeatedly asking why moves from symptoms to root cause." },
    { question: "Which is an example of confirmation bias?", options: ["Measuring before concluding", "Asking a colleague for review", "Testing edge cases", "Looking only for evidence that supports your first guess"], answer: 3, explanation: "Confirmation bias ignores evidence that contradicts your belief." },
    { question: "What is the Pomodoro technique?", options: ["Working 12 hours straight", "Doing all tasks at once", "25 minutes of focused work followed by a 5-minute break", "A tomato-based diet"], answer: 2, explanation: "Short focused sprints with breaks improve concentration." },
    { question: "In a code review, good teamwork means:", options: ["Criticising the person", "Critiquing the code respectfully and accepting feedback", "Approving everything to avoid conflict", "Ignoring comments"], answer: 1, explanation: "Reviews should focus on the code and be constructive in both directions." },
  ],
};
