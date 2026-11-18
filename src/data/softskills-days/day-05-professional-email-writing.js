export default {
  id: "day-05-professional-email-writing",
  title: "Professional Email Writing: Structure, Tone, Follow-ups and Common Emails",
  module: "Module 2: Professional Writing",
  day: 5,
  level: "Beginner",
  duration: "2 hours",
  summary: "Write clear, polite and effective professional emails: subject lines, greetings, structure, tone, follow-ups, and ready-to-use formats for leave requests, apologies, escalations and replies to HR.",
  objectives: [
    "Structure an email with subject, greeting, purpose, details, action and sign-off",
    "Write specific subject lines that get opened and answered",
    "Use the right tone: polite, direct and professional",
    "Write follow-up, leave, apology and escalation emails",
    "Use To, CC and BCC correctly and avoid common email mistakes",
  ],
  theory: [
    {
      heading: "Why Email Still Matters",
      content: `In IT companies, email is the official record. Chat (Teams, Slack) is for quick conversations, but decisions, approvals, leave requests, client communication and escalations happen over email. Your first contact with recruiters, your offer letter acceptance, and your onboarding are all by email.\n\nA badly written email can create confusion, delay work or make you look careless in front of a client. A good email is short, clear, polite and tells the reader exactly what you need.`,
      points: [
        "Email = written record; write as if your manager and client will both read it",
        "Chat for quick questions; email for decisions, approvals and external communication",
        "Your email ID itself should be professional: firstname.lastname@gmail.com",
      ],
    },
    {
      heading: "Structure of a Professional Email",
      content: `Every professional email follows a simple structure. **Subject line**: specific summary. **Greeting**: 'Hi Priya,' or 'Dear Mr. Sharma,'. **Opening line**: the purpose in one sentence. **Body**: details in short paragraphs or bullet points. **Call to action**: what you need and by when. **Closing**: 'Thanks' or 'Regards', followed by your name and signature.\n\nKeep paragraphs to 2-3 lines. Use bullet points for multiple items. Put the most important information at the top; busy readers may only read the first two lines.`,
      points: [
        "Subject: specific and searchable",
        "Greeting: match formality to the reader",
        "Purpose first, details second",
        "Clear action and deadline",
        "Signature: name, role, team/college, phone",
      ],
      tip: "BLUF: Bottom Line Up Front. Put your main request in the first two lines.",
    },
    {
      heading: "Subject Lines That Work",
      content: `A subject line should tell the reader what the email is about and whether action is needed, without opening it. Vague subjects like 'Hi', 'Doubt', 'Urgent' or an empty subject get ignored or lost.\n\nGood subject lines include the topic, a key detail and sometimes the action: 'Leave request: 12-13 March (Rahul Verma)', 'Action needed: Approve DB access for QA server by Friday', 'Application for Java Developer role - Ref ID 4521'.`,
      points: [
        "Bad: 'Hi', 'Doubt', 'Urgent!!!', 'Regarding'",
        "Good: 'Request: Laptop replacement - Asset ID 7782'",
        "Good: 'Interview confirmation - Python Developer - 18 Nov, 11 am'",
        "Use prefixes like 'Action needed', 'FYI', 'Reminder' when helpful",
      ],
    },
    {
      heading: "Tone: Polite, Direct and Professional",
      content: `Professional tone is polite but not overly formal or flowery. Indian students often write in an old-fashioned style: 'Respected Sir, I humbly beg to state that...' or 'Kindly do the needful.' Modern corporate emails are simpler: 'Hi Rajesh, Could you please share the test report by 4 pm today?'\n\nAvoid ALL CAPS (it feels like shouting), too many exclamation marks, SMS language ('pls', 'u', 'thx'), emojis in formal emails, and emotional words. If you are upset, wait 30 minutes before sending.`,
      points: [
        "Use 'Could you please...' instead of 'You must...'",
        "Use 'I noticed...' instead of 'You made a mistake...'",
        "Use 'Thanks for your patience' instead of 'Sorry for the delay' repeatedly",
        "No 'pls', 'u', 'r', 'asap!!!'",
      ],
      tip: "Read your email once as the receiver. If any line could sound rude, soften it.",
    },
    {
      heading: "To, CC, BCC and Reply-All",
      content: `**To**: people who must read and act. **CC**: people who should be informed but need not act (like your manager on a client update). **BCC**: hidden recipients, used for mass emails to protect privacy. **Reply-All**: only when everyone in the thread needs your reply.\n\nAttachments: mention them in the body ('Please find attached the test report') and attach before you write the body, so you do not forget. Name files clearly: 'RahulVerma_Resume_Java.pdf', not 'final_final2.pdf'.`,
      points: [
        "Do not CC the manager to 'complain' about a colleague in the first email",
        "Avoid unnecessary Reply-All in large groups",
        "Check recipient names twice before sending, especially external emails",
      ],
    },
    {
      heading: "Follow-ups, Leave, Apology and Escalation Emails",
      content: `**Follow-up**: send after 2-3 working days if there is no reply; reply on the same thread, briefly restate the request. **Leave request**: dates, reason (short), work handover and availability. **Apology**: own the mistake, explain the fix, prevent recurrence; no long excuses. **Escalation**: used when an issue is blocking work and normal requests failed; state facts, impact, what you tried, and the help needed, without blaming anyone.\n\nThese four types cover most situations a fresher faces in the first year.`,
      points: [
        "Follow-up: polite, short, same thread",
        "Leave: apply in advance, mention handover",
        "Apology: own it, fix it, prevent it",
        "Escalation: facts, impact, attempts, request; no blame",
      ],
      tip: "Escalation is not complaining. It is asking for help to unblock work, with facts.",
    },
  ],
  examples: [
    {
      title: "Bad vs Good Email to HR After Shortlisting",
      scenario: "You received an email from Infosys HR asking you to confirm your interview slot.",
      steps: [
        "Reply on the same thread",
        "Thank them and confirm date, time and mode",
        "Mention any document requested",
        "Sign off with full name and contact",
      ],
      code: `BAD:
Subject: (no subject)
"ok sir i will come. thx"

GOOD:
Subject: Re: Interview Schedule - Systems Engineer - 20 Nov

Dear Ms. Mehta,

Thank you for shortlisting me for the Systems Engineer role.
I confirm my availability for the virtual interview on 20 November at
10:30 am. I have attached my updated resume as requested.

Please let me know if you need any other documents.

Regards,
Aditya Kulkarni
B.Tech CSE, 2026 | +91 98xxxxxx10`,
      result: "HR sees a professional, reliable candidate before the interview even starts.",
      explanation: "The good version confirms specific details, references the attachment and has a proper signature. The bad version looks careless.",
    },
    {
      title: "Leave Request Email",
      scenario: "You are a trainee and need two days' leave for your sister's wedding.",
      steps: [
        "Clear subject with dates and your name",
        "State the dates and short reason",
        "Mention work status and handover",
        "Mention availability for urgent issues",
      ],
      code: `Subject: Leave Request: 12-13 December (Sneha Patil)

Hi Anil,

I would like to request leave on 12 and 13 December for my sister's
wedding in Nashik.

My current task, the employee report API, will be completed and pushed for
review by 11 December. Kiran has agreed to handle any review comments while
I am away.

I will be reachable on phone for anything urgent.

Thanks,
Sneha Patil
Trainee - Java Team`,
      result: "Manager can approve quickly because the work impact is already handled.",
      explanation: "A leave email that addresses handover removes the manager's main worry. It is short and applied in advance.",
    },
    {
      title: "Apology Email After a Mistake",
      scenario: "You accidentally deployed a build to the QA server with a wrong config, and testers lost two hours.",
      steps: [
        "Acknowledge the mistake clearly",
        "State the impact honestly",
        "Explain what has been fixed",
        "Explain how you will prevent it",
      ],
      code: `Subject: Issue on QA server this morning - fixed

Hi team,

This morning I deployed build 2.3.1 to the QA server with the wrong database
configuration. Because of this, testing was blocked from 10 am to 12 pm.
I apologise for the disruption.

The correct configuration has been deployed, and the server is working
normally since 12:05 pm.

To avoid this in future, I have added a config check step to my deployment
checklist and will get a quick review from Ravi before QA deployments.

Thanks for your patience,
Manoj`,
      result: "Team trust is maintained because the mistake was owned and fixed transparently.",
      explanation: "A good apology is short, specific and focused on the fix and prevention, not excuses.",
    },
    {
      title: "Polite Follow-up and Escalation",
      scenario: "You asked the infra team for database access 3 days ago. No reply. Your task is blocked.",
      steps: [
        "Day 3: send a polite follow-up on the same thread",
        "Day 5: escalate to the infra lead, CC your manager, with facts and impact",
      ],
      code: `FOLLOW-UP (same thread):
Subject: Re: Request: Read access to QA_SALES database
Hi Rakesh,
Just following up on my request below for read access to QA_SALES.
I need it to start testing the sales report module. Could you please
let me know if anything else is needed from my side?
Thanks, Pallavi

ESCALATION:
Subject: Help needed: QA_SALES DB access pending since 4 Nov
Hi Sunita,
I raised a request for read access to QA_SALES on 4 Nov (ticket INF-2231)
and followed up on 7 Nov. The access is still pending.
Impact: Testing of the sales report module is blocked, and the release
planned for 15 Nov may be delayed.
Could you please help prioritise this request?
CC: Anil (my manager)
Thanks, Pallavi`,
      result: "The issue gets resolved without anyone feeling blamed.",
      explanation: "The escalation lists facts (dates, ticket), impact and a clear request. It is polite and gives the other side a chance to act.",
    },
  ],
  interview: [
    { q: "What are the key elements of a professional email?", a: `A clear subject line, appropriate greeting, the purpose in the first line, details in short paragraphs or bullets, a clear action with deadline, a polite closing and a signature with name and contact details. It should be concise, correct and courteous.`, level: "Easy" },
    { q: "What is the difference between CC and BCC?", a: `CC sends a copy to people who should be informed; all recipients can see who is CC'd. BCC sends a hidden copy; other recipients cannot see BCC addresses. BCC is useful for mass emails to protect privacy, like sending an event invite to 200 students.`, level: "Easy" },
    { q: "Write a subject line for an email requesting a deadline extension.", a: `'Request: Extension for Payment Module delivery to 22 Nov'. It states the request, the work item and the new date, so the reader understands it without opening the email.`, level: "Easy" },
    { q: "Your client sent an angry email about a bug in production. How will you reply?", a: `I would reply quickly to acknowledge, even before the fix is ready: thank them for reporting, apologise for the inconvenience, confirm that the team is investigating and give a time for the next update. I would keep the tone calm and avoid defending or blaming. Once fixed, I would send a summary of the root cause, the fix and prevention steps. I would also keep my manager in CC.`, level: "Hard" },
    { q: "When should you escalate an issue?", a: `When the issue is blocking work or affecting a deadline, and normal requests and follow-ups have not worked within a reasonable time. Before escalating, I make sure I have facts: what was requested, when, follow-ups done, and the impact. I escalate to the next level politely, without blaming.`, level: "Medium" },
    { q: "What common mistakes do people make in emails?", a: `Vague subject lines, forgetting attachments, long paragraphs, SMS language, wrong recipient names, unnecessary Reply-All, writing angrily, using phrases like 'do the needful' without specifying what is needed, and not proofreading. I always re-read before sending.`, level: "Medium" },
    { q: "How long should you wait before following up?", a: `Usually two to three working days for normal requests. For urgent issues, a follow-up after a few hours or a quick call is fine. For job applications, wait about a week. Always follow up on the same thread so the context is available.`, level: "Easy" },
    { q: "How do you write an email to someone senior you have never met?", a: `I keep it respectful and short. I use 'Dear Mr./Ms. Lastname', introduce myself in one line with context, state the purpose clearly, make it easy to respond, and thank them for their time. I avoid long background stories.`, level: "Medium" },
    { q: "Email or chat: which one would you use to inform your manager about a 3-day leave?", a: `Email, because leave is an official request that needs a record and approval. I might also send a short chat message saying 'I have sent you a leave request email for 12-14 Dec' so it is noticed quickly.`, level: "Medium" },
    { q: "Why should you not write 'Kindly do the needful'?", a: `Because it does not say what action is needed. The reader has to guess. It is also outdated and not understood by many international clients. It is better to state the exact action: 'Could you please approve the access request by Friday?'`, level: "Easy" },
    { q: "How do you handle a situation where you sent an email to the wrong person?", a: `If the mail system allows, I recall it immediately. If not, and the content is not sensitive, I send a short note: 'Please ignore my previous email; it was sent to you by mistake.' If it contained confidential information, I inform my manager immediately so it can be handled properly. Then I resend to the correct person.`, level: "Hard" },
  ],
  practice: [
    {
      task: "Write an email to your project manager requesting one extra day to complete a task, giving a reason and a new date.",
      hint: "Subject with request and date, reason in one line, current status, new date, offer an alternative.",
      solution: `Subject: Request: One-day extension for Login API (new date: 21 Nov)

Hi Prakash,

I would like to request one more day to complete the Login API, moving the
deadline from 20 Nov to 21 Nov.

The core login and JWT parts are done and tested. The remaining work is
the password reset flow, which took longer because the email service
credentials were shared only this afternoon.

If 20 Nov is critical, I can deliver the login part today and the reset
flow tomorrow. Please let me know what works best.

Thanks,
Harsh`,
    },
    {
      task: "Rewrite this email professionally: 'Respected sir, i am having doubt in the assignment pls revert asap. Kindly do the needful. thx'",
      hint: "Add a subject, specific question, polite tone, no SMS language.",
      solution: `Subject: Question about Assignment 3 - Normalization

Dear Prof. Joshi,

I have a question about Assignment 3. In question 2, should we normalise the
table up to 3NF or BCNF?

Could you please clarify by Thursday, as the submission is due on Friday?

Thank you,
Riya Desai
TE Computer, Roll No. 42`,
    },
    {
      task: "Write a thank-you email to an interviewer within 24 hours of your interview.",
      hint: "Thank them, mention one specific topic discussed, restate interest, keep it under 120 words.",
      solution: `Subject: Thank you - Data Analyst Interview on 18 Nov

Dear Ms. Rao,

Thank you for taking the time to speak with me yesterday about the Data
Analyst role.

I especially enjoyed our discussion about how your team uses Power BI to
track store-level sales across Maharashtra. It confirmed my interest in
working on real retail data.

I look forward to hearing about the next steps.

Best regards,
Omkar Jadhav
+91 98xxxxxx45`,
    },
    {
      task: "Write a polite escalation email: your laptop has not been allocated for 5 days after joining and you cannot start training.",
      hint: "Facts with dates, ticket number, impact, specific request, CC your manager.",
      solution: `Subject: Help needed: Laptop not allocated since joining (Ticket IT-5521)

Hi Ramesh,

I joined on 10 Nov as a Graduate Trainee and raised ticket IT-5521 for
laptop allocation on the same day. I followed up on 12 Nov. The laptop is
still not allocated.

Impact: I am unable to access the training portal and have missed two
online modules of the Java batch.

Could you please help prioritise this or arrange a temporary laptop?

CC: Kavita (Training Coordinator)

Thanks,
Ankit Singh
Employee ID: 225671`,
    },
  ],
  quiz: [
    { question: "Which subject line is best?", options: ["Hi", "Leave request: 12-13 Dec (Sneha Patil)", "Urgent!!!", "Regarding"], answer: 1, explanation: "It is specific, searchable and tells the purpose without opening the email." },
    { question: "What does BLUF stand for in email writing?", options: ["Bottom Line Up Front", "Be Light, Use Facts", "Brief Lines, Useful Format", "Business Letter Usual Format"], answer: 0, explanation: "Put the main request or conclusion at the start." },
    { question: "Who should be in CC?", options: ["People who must act", "Hidden recipients", "Nobody, ever", "People who should be informed"], answer: 3, explanation: "CC is for people who need visibility but not action." },
    { question: "What is the right structure for an apology email?", options: ["Long explanation of excuses", "Blame the tool", "Own the mistake, state the fix, explain prevention", "Avoid mentioning the issue"], answer: 2, explanation: "Own it, fix it, prevent it builds trust." },
    { question: "When is escalation appropriate?", options: ["Immediately for any small delay", "When work is blocked and follow-ups have not worked", "Never", "Only to complain about a colleague"], answer: 1, explanation: "Escalate with facts when normal channels have not resolved a blocking issue." },
    { question: "Which phrase is most professional?", options: ["Could you please share the report by 4 pm today?", "Pls revert asap", "Kindly do the needful", "Send fast"], answer: 0, explanation: "It is polite, specific and has a clear deadline." },
  ],
};
