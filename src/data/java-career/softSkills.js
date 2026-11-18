// Soft skills, HR interview and communication practice data for Java freshers.
// Plain ES module, no imports.

export const softSkillModules = [
  {
    id: 'communication',
    title: 'Professional Communication',
    icon: '🗣️',
    summary: `Learn to speak and write clearly at work so that teammates, leads and clients understand you the first time.`,
    lessons: [
      {
        heading: 'Clear and simple is professional',
        content: `Many freshers think "professional English" means big words. It does not. Professional communication means the listener understands you quickly and knows what to do next. Use short sentences, common words and one idea per sentence.`,
        points: [
          'Start with the main point, then give details.',
          'Use simple words: "use" instead of "utilise", "start" instead of "commence".',
          'Give numbers and facts instead of vague words like "many" or "soon".',
          'End with a clear next step or question.',
        ],
        dos: ['Say "The login API is failing for 2 users since 10 AM."', 'Confirm what you understood by repeating it in your words.'],
        donts: ['Say "There is some issue, kindly do the needful."', 'Use slang or SMS language like "plz", "u", "thx" at work.'],
      },
      {
        heading: 'Active listening',
        content: `Good communicators listen more than they speak. In meetings and interviews, listen to the full question before answering. Take notes. If something is unclear, ask a polite question instead of guessing.`,
        points: [
          'Do not interrupt; wait for the speaker to finish.',
          'Nod or say "okay", "got it" to show you are following.',
          'Paraphrase: "So you want the report sorted by date, right?"',
          'Ask clarifying questions before you start the work, not after.',
        ],
      },
      {
        heading: 'Speaking to different audiences',
        content: `You will talk to developers, testers, managers and sometimes non-technical clients. Change your words for each audience. A developer wants technical detail. A manager wants status, risk and timeline. A client wants to know how it affects their business.`,
        dos: ['Explain technical terms with a simple example for non-technical people.', 'Give managers the summary first.'],
        donts: ['Use heavy jargon with a client.', 'Give a long technical story when someone asked only for status.'],
      },
      {
        heading: 'Politeness and tone',
        content: `Tone matters as much as words. "Why didn't you fix this?" sounds like blame. "Could we look at this together? It still seems to fail." sounds like teamwork. Use "please", "thank you", and "could you" naturally, without overdoing it.`,
        points: [
          'Use "we" for shared problems.',
          'Disagree with the idea, not the person.',
          'Keep a calm tone even when there is pressure.',
        ],
      },
    ],
    exercises: [
      {
        task: 'Rewrite this message professionally: "bro the build is broken again, fix it asap".',
        hint: 'State the problem, give a detail, and ask politely.',
        sample: `Hi Ravi, the build on the develop branch is failing since the last merge (around 3 PM). The error is in the UserService tests. Could you please take a look when you get a moment? Happy to help if needed.`,
      },
      {
        task: 'Explain what an API is to a non-technical person in 2-3 sentences.',
        hint: 'Use a real-life example like a restaurant waiter.',
        sample: `An API is like a waiter in a restaurant. You tell the waiter what you want, the waiter takes the request to the kitchen and brings back your food. In the same way, an API takes a request from one application to another and brings back the result.`,
      },
      {
        task: 'Your lead explains a task quickly. Write how you would confirm your understanding.',
        hint: 'Paraphrase the task and ask about anything unclear.',
        sample: `Just to confirm: I need to add a "forgot password" link on the login page, which sends a reset email using the existing mail service, and it should be ready for testing by Thursday. Should the reset link expire after some time?`,
      },
      {
        task: 'Convert this vague update into a clear one: "Work is going on, will finish soon."',
        hint: 'Mention what is done, what is pending and when.',
        sample: `I have finished the employee list API and its unit tests. The search filter is pending; I expect to finish it by tomorrow 1 PM. No blockers right now.`,
      },
    ],
  },
  {
    id: 'self-introduction',
    title: 'Self-Introduction ("Tell me about yourself")',
    icon: '🙋',
    summary: `Build a confident 60-90 second introduction that connects your education, skills and projects to the Java developer role.`,
    lessons: [
      {
        heading: 'Why this question matters',
        content: `"Tell me about yourself" is usually the first question. It sets the tone of the whole interview. The interviewer checks your communication, confidence and whether you can present yourself in a structured way. They also pick follow-up questions from what you say, so mention things you can talk about in depth.`,
      },
      {
        heading: 'A simple structure: Present - Past - Future',
        content: `Use this order to keep it short and clear.`,
        points: [
          'Present: who you are now - your name, degree, and what you are focusing on (Java full stack, for example).',
          'Past: education, key skills, one or two projects, internship or certifications.',
          'Future: why you want this role and what you want to learn and contribute.',
        ],
      },
      {
        heading: 'What to include and what to skip',
        content: `Keep it professional and relevant to the job.`,
        dos: [
          'Mention technical skills that match the job: Core Java, OOP, Collections, SQL, Spring Boot, Git.',
          'Name one project with your role and a result.',
          'Show enthusiasm for learning.',
          'Practise until it sounds natural, not memorised.',
        ],
        donts: [
          'Repeat your full resume line by line.',
          'Talk at length about family details, hobbies or marks of 10th standard unless asked.',
          'Speak for more than 2 minutes.',
          'Say "As you can see in my resume..."',
        ],
      },
      {
        heading: 'Handling a gap or a non-CS background',
        content: `If you have a gap year or come from a mechanical, civil or non-IT branch, mention it briefly and positively. Focus on what you did to build skills: courses, projects, practice. Example: "After my B.E. in Mechanical, I took a structured Java full-stack course and built two projects to switch into software."`,
      },
    ],
    exercises: [
      {
        task: 'Write your own 60-second introduction using Present - Past - Future.',
        hint: 'About 120-150 words. Mention one project.',
        sample: `Good morning. I am Priya Sharma, a recent B.Tech graduate in Computer Science, and I am focused on becoming a Java backend developer. During college I built a strong base in Core Java, OOP, Collections and SQL. I recently completed a Java full-stack training where I worked with Spring Boot, REST APIs and MySQL. My main project is a Library Management System where I built the REST APIs for book issue and return, and added validation and exception handling. I also use Git daily and practise problem solving on coding platforms. I enjoy breaking a problem into small steps and writing clean code. I am looking for a role where I can work on real backend applications, learn from experienced developers and grow into a reliable software engineer.`,
      },
      {
        task: 'Rewrite this weak opening: "Myself Rahul, I am from Pune, my father is a farmer, I have one sister."',
        hint: 'Start with your name and professional focus.',
        sample: `Good afternoon, I am Rahul Patil from Pune. I completed my B.Sc. in Computer Science this year and I am preparing for a career as a Java developer.`,
      },
      {
        task: 'Write 2 lines explaining a career switch from a non-IT branch.',
        hint: 'Be brief and focus on the actions you took.',
        sample: `I graduated in Electrical Engineering, but I found I enjoyed programming much more than core work. So I completed a six-month Java full-stack program and built two Spring Boot projects to make this switch.`,
      },
    ],
  },
  {
    id: 'hr-interview',
    title: 'HR Interview Skills',
    icon: '🤝',
    summary: `Understand what HR is really checking and answer common questions honestly, positively and with examples.`,
    lessons: [
      {
        heading: 'What HR is looking for',
        content: `The HR round checks whether you will fit the company and stay. They look at attitude, honesty, communication, willingness to learn and flexibility. Technical depth is not the main focus here.`,
        points: [
          'Attitude: are you positive and ready to learn?',
          'Stability: will you stay and grow with the company?',
          'Flexibility: are you open to relocation, shifts or new technologies?',
          'Honesty: do your answers match your resume?',
        ],
      },
      {
        heading: 'Strengths and weaknesses',
        content: `For strengths, choose 2-3 that matter for a developer and back each with a short example. For weakness, pick a real but non-critical one and say what you are doing to improve it. Avoid fake weaknesses like "I work too hard".`,
        dos: ['"I am consistent - I solved at least one coding problem a day for 6 months."', '"I used to hesitate to speak in groups, so I joined a weekly English speaking club."'],
        donts: ['Say "I have no weaknesses."', 'Mention a weakness that is core to the job, like "I do not like coding".'],
      },
      {
        heading: 'Research the company',
        content: `Before the interview, read the company website, what services or products they offer, their main clients or domains, and their values. Use this in answers like "Why do you want to join us?". Generic answers show you did not prepare.`,
      },
      {
        heading: 'Questions to ask at the end',
        content: `When HR asks "Do you have any questions?", always ask one or two. It shows interest.`,
        points: [
          'What does the training for freshers look like?',
          'What technologies would I work on in the first few months?',
          'How is performance reviewed for new joiners?',
          'What qualities help freshers succeed in this team?',
        ],
        donts: ['Ask about leaves or salary hike as the first question.', 'Say "No questions."'],
      },
    ],
    exercises: [
      {
        task: 'Answer: "What are your strengths?" with two strengths and examples.',
        hint: 'Strength + proof.',
        sample: `My first strength is consistency. For the last six months I have practised Java problems every day and completed over 200 problems. My second strength is that I learn quickly from documentation. In my final project, I had not used Spring Security before, but I read the official guide and added login with roles in about a week.`,
      },
      {
        task: 'Answer: "What is your weakness?"',
        hint: 'Real weakness + steps you are taking.',
        sample: `Earlier I used to spend too long trying to solve a problem alone before asking for help. In my project, this delayed one module by two days. Now I follow a simple rule: if I am stuck for more than an hour after trying, I write down what I tried and ask a teammate. It has saved me a lot of time.`,
      },
      {
        task: 'Write two good questions to ask HR at the end of the interview.',
        hint: 'Focus on learning and growth.',
        sample: `1. What does the onboarding and training plan look like for freshers joining as Java developers? 2. What would you expect from a new joiner in the first three months?`,
      },
    ],
  },
  {
    id: 'star-method',
    title: 'Behavioral Interviews & STAR Method',
    icon: '⭐',
    summary: `Answer "Tell me about a time when..." questions with a clear story using Situation, Task, Action and Result.`,
    lessons: [
      {
        heading: 'What are behavioral questions?',
        content: `Behavioral questions ask about your past behaviour to predict future behaviour. Examples: "Tell me about a time you faced a conflict", "Describe a time you missed a deadline". Freshers can use examples from college projects, internships, hackathons, part-time jobs or events.`,
      },
      {
        heading: 'The STAR structure',
        content: `STAR keeps your story short and focused.`,
        points: [
          'Situation: set the context in 1-2 sentences. Where, when, who.',
          'Task: what was your responsibility or the challenge?',
          'Action: what did YOU do? Use "I", give 2-3 specific steps. This is the longest part.',
          'Result: what happened? Give an outcome and what you learned.',
        ],
      },
      {
        heading: 'Common mistakes',
        content: `Most weak answers fail because they are vague or talk only about the team.`,
        dos: ['Use "I" for your own actions.', 'Keep the answer within 1-2 minutes.', 'End with a learning.'],
        donts: ['Say "We did everything" without explaining your part.', 'Give a hypothetical answer ("I would...") when asked about a real situation.', 'Blame teammates in your story.'],
      },
      {
        heading: 'Prepare a story bank',
        content: `Prepare 5-6 stories in advance and reuse them for different questions: a technical challenge, a team conflict, a failure or mistake, a time you led something, a tight deadline, and a time you learned something fast. One good story can answer several questions.`,
      },
    ],
    exercises: [
      {
        task: 'Write a STAR answer for: "Tell me about a challenging bug you fixed."',
        hint: 'Mention how you found the root cause.',
        sample: `Situation: In my final-year project, an online quiz app, scores were sometimes saved as zero. Task: I was responsible for the backend, so I had to find the cause before our demo in three days. Action: I added logs around the score calculation, reproduced the issue and found that the score was saved before the last answer was processed because of the order of method calls. I fixed the order and wrote a unit test for it. Result: The bug never appeared again, and the demo went smoothly. I learned to always reproduce a bug before changing code.`,
      },
      {
        task: 'Identify what is wrong: "We had a project, we all worked hard and we finished on time."',
        hint: 'Look for missing STAR parts.',
        sample: `It has no clear situation, no individual task, no specific actions by the speaker and no measurable result. It uses "we" throughout, so the interviewer cannot judge the speaker's contribution.`,
      },
      {
        task: 'List 5 stories from your life you can use in a story bank.',
        hint: 'Projects, events, internship, team work, failure.',
        sample: `1. Fixing the score bug in my quiz app project. 2. Organising the college coding contest. 3. Handling a teammate who stopped responding during a project. 4. Failing my first mock interview and improving. 5. Learning Spring Boot in two weeks for an internship task.`,
      },
    ],
  },
  {
    id: 'group-discussion',
    title: 'Group Discussion',
    icon: '👥',
    summary: `Learn how to enter, contribute to and conclude a group discussion with logic, respect and confidence.`,
    lessons: [
      {
        heading: 'What evaluators observe',
        content: `In a GD, evaluators are not only checking who speaks the most. They observe content, clarity, listening, teamwork and leadership.`,
        points: [
          'Relevant points with examples.',
          'Clear and calm speaking.',
          'Listening and building on others\' points.',
          'Bringing the group back to the topic.',
          'Respectful disagreement.',
        ],
      },
      {
        heading: 'How to start and enter',
        content: `If you start the GD, define the topic and give a direction: "Let us look at this from the point of view of students, companies and the government." If you cannot start, enter when someone finishes a point: "Adding to what Sneha said..." or "I would like to look at this from a different angle..."`,
      },
      {
        heading: 'Do and don\'t',
        content: `Simple rules make a big difference.`,
        dos: ['Speak 3-4 times with quality points.', 'Use examples from news or daily life.', 'Invite quiet members: "Arjun, what do you think?"', 'Keep eye contact with the group, not the evaluator.'],
        donts: ['Shout or interrupt repeatedly.', 'Use invented numbers to sound smart.', 'Attack a person: "You are wrong."', 'Stay silent for the whole discussion.'],
      },
      {
        heading: 'Concluding a GD',
        content: `If you get the chance to conclude, summarise both sides in 3-4 sentences without adding new points and without choosing a winner unless the group agreed. Example: "To sum up, the group felt that AI will change many jobs, but it will also create new ones. Most of us agreed that continuous learning is the key."`,
      },
    ],
    exercises: [
      {
        task: 'Write an opening statement for the GD topic "Work from home is better than work from office".',
        hint: 'Define the topic and suggest angles.',
        sample: `Good morning everyone. Work from home became common in recent years, and many companies now follow a hybrid model. I think we can discuss this from three angles: productivity, employee well-being and team collaboration. On productivity, many people save hours of travel time...`,
      },
      {
        task: 'Write a polite sentence to disagree with a group member.',
        hint: 'Acknowledge, then give your view.',
        sample: `I understand your point that online learning is cheaper, but I see it a little differently. Many students in villages still do not have stable internet, so for them it may not be equal access.`,
      },
      {
        task: 'Write a conclusion for the GD "Should coding be compulsory in schools?"',
        hint: 'Summarise both sides without new points.',
        sample: `To conclude, the group agreed that coding builds logical thinking and prepares students for the future. At the same time, we noted challenges like trained teachers and computer access. Overall, the group felt coding should be introduced step by step with proper infrastructure.`,
      },
    ],
  },
  {
    id: 'email-writing',
    title: 'Email & Business Writing',
    icon: '✉️',
    summary: `Write short, clear, polite emails and chat messages with a proper subject, greeting, body and closing.`,
    lessons: [
      {
        heading: 'Structure of a professional email',
        content: `Every work email should be easy to scan in 30 seconds.`,
        points: [
          'Subject: specific, e.g. "Leave request - 12 March" not "Request".',
          'Greeting: "Hi Ankit," or "Dear Ms. Rao," for formal emails.',
          'Opening line: state the purpose in one line.',
          'Body: details in short paragraphs or bullet points.',
          'Closing: clear next step + "Thanks and regards," + your name.',
        ],
      },
      {
        heading: 'Common mistakes freshers make',
        content: `Small mistakes make emails look careless.`,
        donts: [
          'Empty subject line.',
          '"Kindly do the needful" without saying what is needed.',
          'Writing everything in one long paragraph.',
          'Using ALL CAPS - it looks like shouting.',
          'Forgetting the attachment you mentioned.',
          'Reply-all when only one person needs the reply.',
        ],
        dos: ['Read the email once before sending.', 'Use To for action, CC for information.', 'Reply within one working day, even if only to say you will check.'],
      },
      {
        heading: 'Chat messages (Teams / Slack)',
        content: `Chat is faster but still professional. Do not send just "Hi" and wait. Send the full question in one message: "Hi Meera, I am getting a 401 error when I call the /orders API from Postman with my token. Could you check if my user has the right role?"`,
      },
      {
        heading: 'Writing a status report',
        content: `A good daily or weekly status update has three parts: Done, In Progress / Next, and Blockers. Keep each point to one line and mention ticket numbers when available.`,
      },
    ],
    exercises: [
      {
        task: 'Write a one-line subject for an email asking your lead to review your pull request.',
        hint: 'Be specific.',
        sample: `Subject: Review request - PR #42 Add pagination to Product API`,
      },
      {
        task: 'Rewrite: "sir plz approve my leave tmrw i have work at home".',
        hint: 'Subject, greeting, reason, date, closing.',
        sample: `Subject: Leave request for 15 March\n\nHi Suresh,\n\nI would like to request one day of leave on 15 March (Friday) due to a personal matter at home. I have completed my current task and will hand over the pending testing to Neha.\n\nPlease let me know if this is fine.\n\nThanks and regards,\nAmit`,
      },
      {
        task: 'Write a short daily status update.',
        hint: 'Done / Next / Blockers.',
        sample: `Done: Completed login API validation (JIRA-101). Next: Start unit tests for UserService. Blockers: None.`,
      },
    ],
  },
  {
    id: 'presentation',
    title: 'Presentation & Public Speaking',
    icon: '🎤',
    summary: `Present your project or a technical topic with a clear structure, simple slides and a confident voice.`,
    lessons: [
      {
        heading: 'Structure your talk',
        content: `Use a simple flow: tell them what you will tell them, tell them, then summarise. For a project demo: problem, solution, architecture, demo, challenges, learnings.`,
      },
      {
        heading: 'Slides that help, not distract',
        content: `Slides support you; they are not a script.`,
        dos: ['One idea per slide.', 'Use diagrams for architecture.', 'Large font, few words.', 'Test your demo before the presentation.'],
        donts: ['Paste paragraphs of text.', 'Read slides word by word.', 'Use too many animations.', 'Show code in tiny font.'],
      },
      {
        heading: 'Voice and pace',
        content: `Nervous speakers talk fast. Slow down, pause after key points and vary your tone. Pausing for one second is better than filling the gap with "um".`,
        points: ['Breathe before you begin.', 'Look at different people in the room.', 'Practise aloud at least three times.', 'Record yourself and listen once.'],
      },
      {
        heading: 'Handling questions',
        content: `Listen to the full question, repeat it if the room is large, and answer briefly. If you do not know, say "That is a good question. I am not sure right now; I will check and get back to you." Never make up an answer.`,
      },
    ],
    exercises: [
      {
        task: 'Write the outline of a 5-minute presentation on your final-year project.',
        hint: 'Problem, solution, tech, demo, learning.',
        sample: `1. Problem: Students waste time finding available library books. 2. Solution: A web-based Library Management System. 3. Tech stack: Java, Spring Boot, MySQL, React. 4. Architecture diagram: client - REST API - database. 5. Live demo: search, issue and return a book. 6. Challenges: handling concurrent issue requests. 7. Learnings and future scope.`,
      },
      {
        task: 'Write how you would respond to a question you cannot answer during a demo.',
        hint: 'Honest and positive.',
        sample: `That is a good question. I have not tested the system with that many users yet, so I do not want to guess. I will check how the connection pool behaves under load and share the result with you.`,
      },
      {
        task: 'Write a strong opening line for a talk on "Why Java is still popular".',
        hint: 'Start with a question or a relatable fact.',
        sample: `How many of you have used a banking app or booked a train ticket online this month? There is a good chance Java was running somewhere behind it. Today let us see why Java is still trusted after so many years.`,
      },
    ],
  },
  {
    id: 'body-language-virtual',
    title: 'Body Language & Video/Telephonic Interview Etiquette',
    icon: '🧍',
    summary: `Use posture, eye contact and voice to look confident, and prepare your setup for online and phone interviews.`,
    lessons: [
      {
        heading: 'Positive body language',
        content: `Your body speaks before you do.`,
        dos: ['Sit straight, lean slightly forward.', 'Keep natural eye contact.', 'Smile when greeting.', 'Keep hands visible and relaxed.'],
        donts: ['Cross your arms.', 'Shake your leg or tap the pen.', 'Look at the floor or ceiling while thinking for a long time.', 'Check your phone.'],
      },
      {
        heading: 'Video interview setup',
        content: `Prepare your setup 30 minutes before.`,
        points: [
          'Stable internet; keep mobile hotspot as backup.',
          'Quiet room, plain background, light on your face (not behind you).',
          'Camera at eye level; look into the camera when speaking.',
          'Test mic, camera and the meeting link in advance.',
          'Dress formally at least on the top half - but ideally fully.',
          'Keep your resume, a pen and water nearby. Close other apps and notifications.',
        ],
      },
      {
        heading: 'Telephonic interview tips',
        content: `On a phone call, your voice is everything. Stand or sit straight - it makes your voice more energetic. Smile while speaking; it can be heard. Keep your resume and notes in front of you. If the network is bad, politely say "Sorry, your voice is breaking. Could you please repeat the question?"`,
      },
      {
        heading: 'Online coding round etiquette',
        content: `In live coding interviews, think aloud. Explain your approach before typing, mention edge cases and test with a small example. If you are stuck, say what you are thinking - interviewers often give hints.`,
      },
    ],
    exercises: [
      {
        task: 'Make a checklist for the night before a video interview.',
        hint: 'Tech, documents, environment.',
        sample: `1. Test the meeting link and app. 2. Charge laptop and phone. 3. Keep hotspot ready. 4. Iron formal clothes. 5. Arrange a plain background and front light. 6. Keep resume, pen, notebook and water ready. 7. Inform family about the interview time to avoid noise.`,
      },
      {
        task: 'Your video freezes in the middle of an answer. What do you say when you reconnect?',
        hint: 'Calm, polite, offer to continue.',
        sample: `Sorry about that, my connection dropped for a moment. I was explaining how I used HashMap for caching in my project. Shall I continue from there?`,
      },
      {
        task: 'Write how you would "think aloud" for the problem "find the second largest number in an array".',
        hint: 'Approach, edge cases, complexity.',
        sample: `First I will clarify: can the array have duplicates or fewer than two elements? My approach is one pass with two variables, largest and second. For each number, if it is bigger than largest, I move largest to second and update largest; else if it is between them, I update second. This is O(n) time and O(1) space. Let me test with 10, 5, 20, 20.`,
      },
    ],
  },
  {
    id: 'teamwork-workplace',
    title: 'Teamwork, Time Management & Workplace Etiquette',
    icon: '🧩',
    summary: `Work well in an Agile team: give crisp stand-up updates, ask for help the right way and manage your time.`,
    lessons: [
      {
        heading: 'Daily stand-up meetings',
        content: `In Agile teams, the stand-up is a short daily meeting (often 15 minutes). Each person answers three questions: What did I do yesterday? What will I do today? Any blockers? Keep it under one minute.`,
        dos: ['"Yesterday I finished the validation for the register API. Today I will write tests for it. No blockers."'],
        donts: ['Give a long technical explanation in stand-up - take it offline.', 'Say "Same as yesterday" every day.'],
      },
      {
        heading: 'Asking for help the right way',
        content: `Asking for help is normal. Ask smartly so the other person can help quickly.`,
        points: [
          'Try first: search docs, logs and the codebase for 30-60 minutes.',
          'Explain the goal, what you tried and the exact error.',
          'Share screenshots or log snippets, not just "it is not working".',
          'Thank them and note the solution so you do not ask again.',
        ],
      },
      {
        heading: 'Time management',
        content: `Break big tasks into small ones and estimate each. Use a to-do list every morning. Work on the most important task when your energy is highest. If you see you will miss a deadline, inform your lead early - not on the last day.`,
        points: ['Use time blocks for focused coding.', 'Turn off non-urgent notifications.', 'Update your ticket status regularly.'],
      },
      {
        heading: 'Workplace etiquette',
        content: `Be on time for meetings, mute when not speaking in calls, respect others' time, keep your desk and code clean, and follow the team's coding standards and Git process. Never share passwords or client data, and do not push code directly to the main branch unless the process allows it.`,
      },
    ],
    exercises: [
      {
        task: 'Write your stand-up update: yesterday you fixed a bug in the cart API; today you will start the coupon feature; you are waiting for DB access.',
        hint: 'Yesterday / Today / Blockers.',
        sample: `Yesterday I fixed the quantity update bug in the cart API and raised the PR. Today I will start the coupon feature. Blocker: I am waiting for read access to the staging database; I have raised a request with the DevOps team.`,
      },
      {
        task: 'Write a message asking a senior for help with a NullPointerException.',
        hint: 'Goal, what you tried, exact error.',
        sample: `Hi Karthik, I am working on the order summary API (JIRA-214). I get a NullPointerException in OrderService line 58 when the customer has no address. I checked that the address field is optional in the entity and tried adding a null check, but the mapper still fails. Could you spare 10 minutes to look at it with me?`,
      },
      {
        task: 'You realise you will miss Friday\'s deadline. Write a message to your lead on Wednesday.',
        hint: 'Inform early, give reason, give new estimate.',
        sample: `Hi Pooja, a quick update on the report export feature. The PDF library needs extra configuration for Hindi fonts, which I did not expect. I think I will need until Monday noon to finish and test it. I can deliver the Excel export by Friday as planned. Please let me know if we should prioritise differently.`,
      },
    ],
  },
  {
    id: 'resume-profile',
    title: 'Resume, LinkedIn & GitHub Profile',
    icon: '📄',
    summary: `Create a one-page fresher resume and online profiles that clearly show your Java skills and projects.`,
    lessons: [
      {
        heading: 'Fresher resume structure',
        content: `Keep it to one page. Recruiters scan resumes quickly.`,
        points: [
          'Header: name, phone, professional email, LinkedIn, GitHub, city.',
          'Summary: 2-3 lines about your focus (Java backend developer).',
          'Skills: Java, OOP, Collections, JDBC, SQL, Spring Boot, REST, Git, HTML/CSS/JS.',
          'Projects: 2-3 projects with tech stack, your role and features.',
          'Education, internships, certifications, achievements.',
        ],
      },
      {
        heading: 'Writing project points',
        content: `Use action verbs and be specific. "Built REST APIs for book issue and return using Spring Boot and MySQL" is better than "Worked on a library project".`,
        dos: ['Start with verbs: Built, Designed, Implemented, Improved.', 'Mention the tech stack.', 'Only list skills you can answer questions on.'],
        donts: ['Use photos, fancy colours or tables that break ATS parsers.', 'Add skill bars like "Java 90%".', 'Copy a friend\'s project description.'],
      },
      {
        heading: 'LinkedIn profile',
        content: `Use a clear photo, a headline like "Java Developer | Spring Boot | SQL | Fresher", an About section in simple English, and add projects and certifications. Connect with classmates, trainers and recruiters, and share what you learn once in a while.`,
      },
      {
        heading: 'GitHub profile',
        content: `Interviewers may open your GitHub. Pin your best 3-4 repositories. Each should have a README with project description, tech stack, how to run, and screenshots. Commit regularly with meaningful messages like "Add validation to register API" instead of "update".`,
      },
    ],
    exercises: [
      {
        task: 'Rewrite this resume line: "Did a project on hospital management."',
        hint: 'Verb + what + tech + result.',
        sample: `Built a Hospital Management System using Spring Boot, MySQL and React with modules for patient registration, appointment booking and billing; implemented role-based login for admin and doctors.`,
      },
      {
        task: 'Write a LinkedIn headline for yourself.',
        hint: 'Role | key skills | status.',
        sample: `Aspiring Java Backend Developer | Core Java, Spring Boot, REST APIs, MySQL | Open to opportunities`,
      },
      {
        task: 'List the sections of a good GitHub README for your project.',
        hint: 'Think about what a reviewer needs.',
        sample: `1. Project title and one-line description. 2. Features. 3. Tech stack. 4. Screenshots. 5. How to run locally (prerequisites and steps). 6. API endpoints. 7. Future improvements.`,
      },
    ],
  },
  {
    id: 'confidence-stress',
    title: 'Confidence, Handling Stress & Rejection',
    icon: '💪',
    summary: `Build real confidence through preparation, manage interview stress and learn from rejections without losing motivation.`,
    lessons: [
      {
        heading: 'Confidence comes from preparation',
        content: `Confidence is not about pretending. It grows when you know your basics well and have practised answering aloud. Do mock interviews with friends, record yourself and revise core topics regularly.`,
      },
      {
        heading: 'Managing stress before and during interviews',
        content: `Some nervousness is normal and even helpful.`,
        points: [
          'Sleep well the night before; avoid last-minute cramming.',
          'Reach early or log in 10 minutes before.',
          'Take a slow deep breath before answering.',
          'It is fine to say "Let me think for a moment."',
          'If you make a mistake, correct it calmly and move on.',
        ],
      },
      {
        heading: 'Handling "I don\'t know"',
        content: `You will face questions you cannot answer. Be honest. Say what you do know: "I have not used Kafka, but I understand it is a message broker used for asynchronous communication. I would be happy to learn it." Honesty is better than guessing confidently and being wrong.`,
      },
      {
        heading: 'Learning from rejection',
        content: `Almost everyone faces rejections before their first job. Treat each interview as practice.`,
        dos: ['Write down the questions you could not answer and study them.', 'Ask for feedback politely if possible.', 'Keep a routine: learning, practice, applications.'],
        donts: ['Compare your journey with others on social media.', 'Stop applying after a few rejections.', 'Take rejection as a judgement of your worth.'],
      },
    ],
    exercises: [
      {
        task: 'Write how you would respond to a technical question you do not know.',
        hint: 'Honest + related knowledge + willingness to learn.',
        sample: `I have not worked with Docker yet. From what I have read, it packages an application with its dependencies into a container so it runs the same everywhere. It is on my learning list, and I would be glad to pick it up quickly.`,
      },
      {
        task: 'After a rejection, write a short reflection plan.',
        hint: 'What went well, what to improve, next actions.',
        sample: `Went well: self-introduction and project explanation. To improve: I could not explain HashMap internals and got nervous in SQL joins. Actions: revise HashMap internals and practise 10 join queries this week, then do one mock interview on Sunday.`,
      },
      {
        task: 'Write a polite email asking for feedback after a rejection.',
        hint: 'Thank them, ask for 1-2 points.',
        sample: `Subject: Thank you - Java Developer interview\n\nDear Ms. Iyer,\n\nThank you for the opportunity to interview for the Java Developer role. I understand I was not selected this time. If possible, could you share one or two areas I should improve? It would really help me prepare better.\n\nThanks and regards,\nVikas`,
      },
    ],
  },
  {
    id: 'salary-offer-first-90-days',
    title: 'Salary Discussion, Offer Letters & First 90 Days at a Job',
    icon: '💼',
    summary: `Discuss salary professionally, read your offer letter carefully and make a strong start in your first three months.`,
    lessons: [
      {
        heading: 'Talking about salary as a fresher',
        content: `For freshers, salary is often fixed by the company. Still, you may be asked about expectations. Research typical fresher packages for the role and city, and give a reasonable range or say you are open to the company's standard. Be polite and never sound demanding.`,
        dos: ['"I am open to the company\'s standard package for freshers. My main focus is learning and growth."', 'Ask what is fixed and what is variable.'],
        donts: ['Quote a number much higher than the market without reason.', 'Lie about another offer.'],
      },
      {
        heading: 'Reading the offer letter',
        content: `Read every line before accepting.`,
        points: [
          'CTC vs in-hand salary: CTC includes PF, gratuity, bonus, insurance etc.',
          'Joining date, location and role.',
          'Probation period and notice period.',
          'Service agreement or bond: duration and conditions.',
          'Training period and conditions to clear it.',
          'Documents needed on the joining day.',
        ],
      },
      {
        heading: 'First 30 days: learn',
        content: `Understand the product, codebase, tools and team. Set up your development environment, read documentation, attend all knowledge-transfer sessions, and take notes. Ask questions, and find out how code review and deployment work.`,
      },
      {
        heading: 'Days 31-90: contribute and build trust',
        content: `Pick small tasks and finish them well. Write clean code, add tests, update tickets, and respond to review comments positively. Be reliable: do what you say you will do. Ask your lead for feedback around the end of the first and third month.`,
        dos: ['Keep a work log of what you completed.', 'Volunteer for small tasks like documentation or bug fixes.'],
        donts: ['Take review comments personally.', 'Hide mistakes - report them early.'],
      },
    ],
    exercises: [
      {
        task: 'Answer: "What are your salary expectations?" as a fresher.',
        hint: 'Flexible, research-based, focused on growth.',
        sample: `As a fresher, my main priority is learning and building a strong career here. I have seen that the typical range for this role in this city is within the company's fresher band, and I am comfortable with your standard package.`,
      },
      {
        task: 'List 5 things you will check in your offer letter.',
        hint: 'Money, time, conditions.',
        sample: `1. CTC breakup and expected in-hand salary. 2. Joining date and location. 3. Probation and notice period. 4. Bond or service agreement details. 5. Training and documents required.`,
      },
      {
        task: 'Write a short plan for your first week at a new job.',
        hint: 'Setup, people, product, process.',
        sample: `Day 1-2: complete HR formalities, set up laptop, IDE, Git and VPN access. Day 3: meet team members and understand each person's role. Day 4: read the product documentation and run the application locally. Day 5: pick a small bug or documentation task and understand the code review process.`,
      },
    ],
  },
];

export const hrQuestions = [
  {
    q: 'Tell me about yourself.',
    category: 'Introduction',
    tip: 'Checks communication, structure and whether your profile matches the role.',
    sample: `I am Neha Kulkarni, a 2024 B.E. Computer Engineering graduate from Pune, and I want to build my career as a Java backend developer. I have a good base in Core Java, OOP, Collections and SQL, and I have worked with Spring Boot and REST APIs during my full-stack training. My main project is an Expense Tracker where I built REST APIs with Spring Boot and MySQL, added JWT login and wrote unit tests with JUnit. I use Git for version control and solve coding problems regularly to improve my logic. I enjoy understanding how things work inside, like how HashMap stores data. I am looking for a role where I can work on real applications, learn from senior developers and grow into a dependable engineer.`,
    keywords: ['graduate', 'Core Java', 'Spring Boot', 'project', 'REST APIs', 'learn', 'role'],
  },
  {
    q: 'Walk me through your resume.',
    category: 'Introduction',
    tip: 'Checks whether you can explain your journey in order and connect each step.',
    sample: `Sure. I completed my B.Sc. in Computer Science in 2024 with a focus on programming subjects. In my final year I realised I enjoy backend development, so I joined a Java full-stack program where I learned Core Java, JDBC, Spring Boot, REST APIs, MySQL and basic React. I built two projects: a Library Management System and an Online Quiz App. In the quiz app I designed the database tables and wrote the APIs for scoring. I also completed a one-month internship where I fixed bugs and wrote SQL queries for reports. Each step has moved me closer to backend development, which is why I applied for this role.`,
    keywords: ['degree', 'training', 'projects', 'internship', 'my role', 'backend'],
  },
  {
    q: 'What are your strengths?',
    category: 'Strengths & Weaknesses',
    tip: 'Checks self-awareness; every strength needs a short proof.',
    sample: `My first strength is consistency. I set a goal to solve at least one coding problem every day and I have kept it up for about six months. My second strength is problem solving. In my project, when the API response was slow, I checked the queries, found a missing index and fixed it. My third strength is that I am a quick learner. I learned Spring Data JPA in about two weeks by reading documentation and building small examples. I believe these will help me become productive quickly in your team.`,
    keywords: ['consistency', 'problem solving', 'quick learner', 'example', 'project', 'team'],
  },
  {
    q: 'What is your greatest weakness?',
    category: 'Strengths & Weaknesses',
    tip: 'Checks honesty and whether you work on improving yourself.',
    sample: `My weakness was public speaking. In college I avoided presentations because I got nervous in front of a group. I realised that as a developer I will need to explain my work in meetings and demos. So I joined a weekly speaking club and volunteered to present our final-year project. I still feel a little nervous, but I can now present clearly and answer questions. I keep practising by explaining technical topics to my friends.`,
    keywords: ['real weakness', 'realised', 'steps taken', 'practice', 'improvement'],
  },
  {
    q: 'Why should we hire you?',
    category: 'Company & Role',
    tip: 'Checks whether you can match your skills to the job needs.',
    sample: `You are looking for a Java developer who knows the fundamentals and can learn fast. I have a strong base in Core Java, OOP and SQL, and practical experience building REST APIs with Spring Boot through my projects. I have shown that I can learn new tools quickly, like learning JPA in two weeks for my project. I am also a team player, and I communicate my progress clearly. As a fresher I bring energy and commitment, and I am ready to put in the effort to become a valuable member of your team.`,
    keywords: ['match', 'Core Java', 'projects', 'learn fast', 'team player', 'commitment'],
  },
  {
    q: 'Why do you want to join our company?',
    category: 'Company & Role',
    tip: 'Checks whether you researched the company.',
    sample: `I read about your company and saw that you work on banking and insurance applications built mainly on Java and Spring. That matches the skills I have been building. I also noticed you have a structured training program for freshers, which is important to me because I want to learn the right way from the start. The chance to work on large applications used by many people is exciting, and I see a long-term learning path here.`,
    keywords: ['research', 'domain', 'Java', 'training', 'growth', 'long-term'],
  },
  {
    q: 'Where do you see yourself in five years?',
    category: 'Career Goals',
    tip: 'Checks ambition, realism and stability.',
    sample: `In five years, I see myself as a strong backend developer who understands the full application, from database design to deployment. I would like to be someone the team trusts with important modules, and I hope to guide new freshers the way seniors will guide me. I want to learn system design, microservices and cloud along the way. I would like to grow within one organisation where I can see my work making an impact.`,
    keywords: ['backend developer', 'responsibility', 'learn', 'mentor', 'grow', 'organisation'],
  },
  {
    q: 'What are your short-term and long-term goals?',
    category: 'Career Goals',
    tip: 'Checks whether you have a clear plan.',
    sample: `My short-term goal is to join a good team, complete the training well and start contributing to real projects within a few months. I want to become confident with the company's codebase, tools and processes. My long-term goal is to become a senior developer with strong knowledge of system design and cloud technologies, and later take up a technical lead role where I can design solutions and mentor others.`,
    keywords: ['short-term', 'contribute', 'training', 'long-term', 'senior developer', 'mentor'],
  },
  {
    q: 'Why did you choose Java?',
    category: 'Career Goals',
    tip: 'Checks genuine interest in your chosen technology.',
    sample: `I started with C in college, but when I learned Java I liked how object-oriented concepts made programs easier to organise. Java is strongly typed, so many mistakes are caught early, and it has a huge ecosystem like Spring Boot and Hibernate. It is also widely used in enterprise applications like banking and e-commerce, so there are good career opportunities. The more I built projects with it, the more I enjoyed it.`,
    keywords: ['object-oriented', 'ecosystem', 'Spring Boot', 'enterprise', 'enjoy', 'projects'],
  },
  {
    q: 'Are you willing to relocate?',
    category: 'Salary & Logistics',
    tip: 'Checks flexibility.',
    sample: `Yes, I am willing to relocate. At the start of my career, I think learning and the right opportunity are more important than location. I have discussed this with my family and they support me. If I may ask, which locations are possible for this role, so I can plan accordingly?`,
    keywords: ['yes', 'flexible', 'opportunity', 'family support', 'plan'],
  },
  {
    q: 'Are you comfortable working in night shifts or rotational shifts?',
    category: 'Salary & Logistics',
    tip: 'Checks flexibility and honesty about constraints.',
    sample: `Yes, I am comfortable with shifts if the project needs it. I understand that many projects support clients in different time zones. I will manage my routine and health so that I can give my best in any shift. If there is any rotation schedule, I would like to know it in advance so I can plan well.`,
    keywords: ['comfortable', 'project needs', 'clients', 'time zones', 'plan'],
  },
  {
    q: 'What are your salary expectations?',
    category: 'Salary & Logistics',
    tip: 'Checks whether you are realistic and not money-focused only.',
    sample: `As a fresher, my main focus is learning and building a strong foundation. I have looked at typical packages for entry-level Java developers and I understand your company has a standard fresher package. I am comfortable with that. I am more interested in the work, the training and the growth opportunities here.`,
    keywords: ['fresher', 'learning', 'research', 'standard package', 'growth'],
  },
  {
    q: 'Are you okay with signing a service agreement (bond)?',
    category: 'Salary & Logistics',
    tip: 'Checks commitment; it is fine to ask for details.',
    sample: `I understand that companies invest in training freshers, so a service agreement is reasonable. I am planning to build my career for the long term, so it is not a concern for me. Could you please share the duration and the main conditions, so I can understand it clearly before signing?`,
    keywords: ['understand', 'training investment', 'long term', 'duration', 'conditions'],
  },
  {
    q: 'Tell me about a time you worked in a team.',
    category: 'Behavioral',
    tip: 'Checks collaboration; use STAR and show your own role.',
    sample: `In my final-year project, our team of four built an online quiz application. I handled the backend APIs, while others worked on the UI, database and testing. Midway, the UI and backend were not matching because we had not agreed on the API format. I suggested we write a simple API contract document with request and response examples. We reviewed it together in one meeting. After that, integration became smooth and we finished a week before the deadline. I learned that clear agreements early save a lot of time later.`,
    keywords: ['team', 'my role', 'problem', 'suggested', 'result', 'learned'],
  },
  {
    q: 'Describe a conflict with a team member and how you handled it.',
    category: 'Behavioral',
    tip: 'Checks maturity; never blame, focus on the solution.',
    sample: `During a college project, one teammate wanted to use MongoDB while I preferred MySQL. We argued for a day and work stopped. I suggested we list our requirements first. We saw that our data had clear relationships like students, courses and marks, which suited a relational database. I explained this calmly and also agreed to use his idea of caching search results. He agreed with the plan, and we finished on time. I learned to discuss facts and requirements instead of personal preferences.`,
    keywords: ['disagreement', 'listened', 'requirements', 'calm', 'compromise', 'learned'],
  },
  {
    q: 'Tell me about a failure and what you learned from it.',
    category: 'Behavioral',
    tip: 'Checks honesty and growth mindset.',
    sample: `In my first campus placement drive, I cleared the aptitude test but failed the technical interview. I could not explain basic OOP concepts properly, even though I had used them in code. It was disappointing. I made a list of every question I could not answer and revised the concepts by writing small programs and explaining them aloud. I also did weekly mock interviews with friends. In the next interviews, I could explain OOP clearly with examples. I learned that knowing how to code and knowing how to explain are different skills.`,
    keywords: ['failure', 'honest', 'analysed', 'action', 'improved', 'learned'],
  },
  {
    q: 'Tell me about a time you learned something new quickly.',
    category: 'Behavioral',
    tip: 'Checks learning ability, which matters most for freshers.',
    sample: `During my internship, I was asked to add file upload to an existing Spring Boot application in one week. I had never done file handling in Spring. I first read the official guide, then built a small separate example to understand MultipartFile. After that I added the feature to the real project with size validation. I finished in five days and my mentor approved it with small changes. I learned that building a tiny example first helps me learn faster.`,
    keywords: ['new technology', 'deadline', 'documentation', 'small example', 'delivered', 'learned'],
  },
  {
    q: 'Describe a situation where you took initiative.',
    category: 'Behavioral',
    tip: 'Checks ownership.',
    sample: `In our college, students had to check a notice board every day for placement updates, and many missed deadlines. I suggested building a simple web page where the placement cell could post updates. With the coordinator's permission, I built it using Spring Boot and a simple HTML front end over two weekends. The placement cell started using it, and students could see updates on their phones. It taught me to look for small problems that I can solve with technology.`,
    keywords: ['noticed a problem', 'suggested', 'built', 'permission', 'impact', 'ownership'],
  },
  {
    q: 'Tell me about a time you had to meet a tight deadline.',
    category: 'Stress & Pressure',
    tip: 'Checks planning and calmness under pressure.',
    sample: `Two days before our project review, we found that the report module was not working. I made a list of the remaining tasks and divided them by priority with my teammate. I fixed the report query while he tested the other modules. We kept short check-ins every few hours. We finished the fix the night before and did one full test run in the morning. The review went well. I learned that breaking work into small pieces and communicating often reduces panic.`,
    keywords: ['deadline', 'prioritised', 'divided work', 'communication', 'delivered', 'calm'],
  },
  {
    q: 'How do you handle pressure or stress?',
    category: 'Stress & Pressure',
    tip: 'Checks whether you have healthy, practical methods.',
    sample: `When I feel pressure, I first write down all the tasks and pick the most important one. Focusing on one thing at a time reduces stress for me. I also take short breaks and keep my sleep regular, because I make more mistakes when I am tired. If something is beyond my control, I inform the right person early. During my final exams and project submission together, this approach helped me manage both well.`,
    keywords: ['list tasks', 'prioritise', 'one at a time', 'breaks', 'inform early', 'example'],
  },
  {
    q: 'What will you do if you cannot solve a problem at work?',
    category: 'Situational',
    tip: 'Checks independence balanced with asking for help.',
    sample: `First I will try on my own: read the error carefully, check the logs, search the documentation and look at similar code in the project. I will give it a reasonable amount of time. If I am still stuck, I will ask a senior, explaining what I tried and the exact error, so they can help quickly. After it is solved, I will note the solution so I do not repeat the mistake.`,
    keywords: ['try first', 'logs', 'documentation', 'ask senior', 'what I tried', 'note solution'],
  },
  {
    q: 'What would you do if your manager gives you a task you have never done before?',
    category: 'Situational',
    tip: 'Checks attitude towards new challenges.',
    sample: `I would take it as a chance to learn. First I would make sure I clearly understand the requirement and the deadline. Then I would study the basics through documentation or internal examples and build a small proof of concept. I would share my progress early with my manager so any wrong direction is corrected quickly. If I needed help, I would ask a colleague who has done similar work.`,
    keywords: ['opportunity', 'understand requirement', 'learn', 'proof of concept', 'update early'],
  },
  {
    q: 'What would you do if you found a bug in production that you caused?',
    category: 'Situational',
    tip: 'Checks honesty and responsibility.',
    sample: `I would inform my lead immediately, because hiding it would make it worse. I would explain what is affected and how, and suggest a quick fix or rollback if possible. After the issue is fixed, I would find the root cause, add a test case so it does not happen again and share the learning with the team. Taking responsibility quickly is the right thing to do.`,
    keywords: ['inform immediately', 'responsibility', 'impact', 'fix', 'root cause', 'test case'],
  },
  {
    q: 'What would you do if a teammate is not doing their share of work?',
    category: 'Situational',
    tip: 'Checks maturity and teamwork.',
    sample: `I would first talk to the teammate privately and politely to understand the reason. Maybe they are stuck or have personal issues. I would offer help if they are stuck. If the problem continues and affects the deadline, I would discuss it with the team lead in a factual way, focusing on the work and not on blaming the person.`,
    keywords: ['talk privately', 'understand reason', 'offer help', 'escalate', 'factual', 'no blame'],
  },
  {
    q: 'If you get a better offer after joining, what will you do?',
    category: 'Situational',
    tip: 'Checks loyalty and stability.',
    sample: `When I accept an offer, I make a commitment. I choose a company after thinking about the role, training and growth, not only salary. So once I join, I will focus on learning and contributing here. I believe growth comes from building skills and trust in one place, and that will bring better opportunities within the company over time.`,
    keywords: ['commitment', 'growth', 'learning', 'stability', 'trust'],
  },
  {
    q: 'Do you prefer working alone or in a team?',
    category: 'Behavioral',
    tip: 'Checks flexibility; the best answer shows both.',
    sample: `I am comfortable with both. For focused coding tasks, I like to work independently and take ownership. But software is built by teams, so I enjoy discussing designs, reviewing code and solving problems together. In my project, I wrote my APIs on my own but worked closely with the front-end developer to integrate them. I think a good developer needs both skills.`,
    keywords: ['both', 'independent', 'ownership', 'collaboration', 'code review', 'example'],
  },
  {
    q: 'How do you keep your technical skills updated?',
    category: 'Career Goals',
    tip: 'Checks self-learning habit.',
    sample: `I follow a simple routine. I solve coding problems regularly, read the official Java and Spring documentation when I learn a feature, and watch conference talks on topics like Java features. I also build small projects to try new things, for example I recently built a small app to learn Spring Boot validation. I keep my code on GitHub so I can track my learning.`,
    keywords: ['routine', 'documentation', 'practice', 'small projects', 'GitHub', 'new features'],
  },
  {
    q: 'What do you know about our company?',
    category: 'Company & Role',
    tip: 'Checks preparation; mention services, domains and values.',
    sample: `I understand that your company is an IT services company that builds and maintains software for clients in banking, retail and healthcare. You have development centres in several Indian cities and serve global clients. I also read about your focus on cloud migration and digital projects, and your values around client focus and learning. This mix of domains and technologies is a big reason I applied.`,
    keywords: ['services', 'clients', 'domains', 'technologies', 'values', 'reason'],
  },
  {
    q: 'What do you understand about the role of a Java developer?',
    category: 'Company & Role',
    tip: 'Checks whether you understand the job beyond writing code.',
    sample: `A Java developer designs, writes, tests and maintains applications, mostly on the backend. This includes writing business logic, building REST APIs, working with databases using SQL or JPA, and fixing bugs. It also involves reviewing code, writing unit tests, using Git and working with testers and analysts to understand requirements. Good developers also care about code quality, performance and security.`,
    keywords: ['backend', 'REST APIs', 'database', 'testing', 'Git', 'code quality'],
  },
  {
    q: 'Do you have any questions for us?',
    category: 'Company & Role',
    tip: 'Checks interest; always ask one or two thoughtful questions.',
    sample: `Yes, thank you. I have two questions. First, what does the training and onboarding look like for freshers who join as Java developers? Second, what kind of projects or technologies would a new joiner usually start with? I would like to prepare well before joining, so any suggestion on what to learn would also be helpful.`,
    keywords: ['training', 'onboarding', 'projects', 'technologies', 'prepare'],
  },
  {
    q: 'Why is there a gap in your education or career?',
    category: 'Introduction',
    tip: 'Checks honesty and how you used the time.',
    sample: `After graduation, I took about a year to prepare for a government exam. It did not work out, and I decided to move into software development, which I had always enjoyed. In the last eight months I completed a Java full-stack course and built two projects with Spring Boot and MySQL. That year taught me discipline and how to study consistently, which helped me learn programming quickly.`,
    keywords: ['honest', 'reason', 'decision', 'course', 'projects', 'discipline'],
  },
  {
    q: 'What motivates you?',
    category: 'Career Goals',
    tip: 'Checks what drives you to perform.',
    sample: `I feel motivated when I solve a problem that I was stuck on and see my code work as expected. I also enjoy learning something new and then using it in a real project. Knowing that people actually use what I build, even in a small way, gives me a lot of satisfaction. That is why I want to work on real-world applications.`,
    keywords: ['solving problems', 'learning', 'impact', 'users', 'satisfaction'],
  },
  {
    q: 'How do you handle criticism or code review comments?',
    category: 'Behavioral',
    tip: 'Checks openness to feedback.',
    sample: `I see feedback as free learning. During my internship, my mentor commented that my methods were too long and hard to test. At first I felt a bit low, but then I asked him for an example of how to split them. I refactored the code into smaller methods and added tests. Since then, I keep methods short from the start. I thank reviewers and ask questions if I do not understand a comment.`,
    keywords: ['feedback', 'learning', 'example', 'refactored', 'improved', 'thank'],
  },
  {
    q: 'How do you prioritise when you have multiple tasks?',
    category: 'Stress & Pressure',
    tip: 'Checks time management.',
    sample: `I list all the tasks with their deadlines and impact. Urgent and important tasks come first. If two tasks clash, I check with my lead about which one matters more for the team instead of guessing. I break big tasks into smaller ones and block time for focused work. I also update the status regularly so everyone knows where things stand.`,
    keywords: ['list', 'deadlines', 'impact', 'check with lead', 'break down', 'status update'],
  },
  {
    q: 'What is your biggest achievement so far?',
    category: 'Strengths & Weaknesses',
    tip: 'Checks what you value; connect it to skills for the job.',
    sample: `My biggest achievement is building my final-year project, a Hospital Appointment System, which was selected as one of the best projects in our department. I designed the database, built the REST APIs in Spring Boot and handled the double-booking problem using proper checks and transactions. It was the first time I built a complete working system, and it gave me confidence that I can handle real backend work.`,
    keywords: ['achievement', 'project', 'my role', 'challenge', 'recognised', 'confidence'],
  },
  {
    q: 'Are you applying to other companies?',
    category: 'Salary & Logistics',
    tip: 'Checks honesty and how serious you are about this company.',
    sample: `Yes, like most freshers, I am applying to a few companies to find the right start. But this role interests me a lot because it focuses on Java backend development and your training program is strong. If I get this opportunity, I would be happy to commit to it.`,
    keywords: ['honest', 'few companies', 'interest', 'Java backend', 'commit'],
  },
  {
    q: 'How would your friends or teammates describe you?',
    category: 'Strengths & Weaknesses',
    tip: 'Checks self-awareness and how you work with others.',
    sample: `I think they would describe me as reliable and helpful. In my project team, my friends knew that if I took a task, it would be done on time. Many classmates came to me before exams to understand Java concepts, and I enjoyed explaining them. They might also say I am a little too detail-oriented sometimes, but that helps me catch bugs early.`,
    keywords: ['reliable', 'helpful', 'example', 'team', 'detail-oriented'],
  },
  {
    q: 'What would you do if you disagree with your manager\'s technical decision?',
    category: 'Situational',
    tip: 'Checks respectful communication.',
    sample: `I would first make sure I fully understand the reason behind the decision, because the manager may have information I do not. If I still think there is a better option, I would share my view privately with facts or a small example, not in a way that sounds like a challenge. If the manager still decides to go ahead, I would support the decision and do my best work.`,
    keywords: ['understand reason', 'facts', 'respectful', 'privately', 'support decision'],
  },
  {
    q: 'How do you handle a situation when you are given unclear requirements?',
    category: 'Situational',
    tip: 'Checks whether you clarify instead of assuming.',
    sample: `I do not start coding on assumptions. I write down my understanding and the open questions, then confirm with the person who gave the requirement, like the business analyst or lead. Sometimes I show a quick sample input and output to make it clear. Once it is confirmed, I note it in the ticket so everyone has the same understanding.`,
    keywords: ['clarify', 'questions', 'confirm', 'example', 'document', 'no assumptions'],
  },
  {
    q: 'You have an interview tomorrow and another company gives you an offer today. What do you do?',
    category: 'Stress & Pressure',
    tip: 'Checks decision-making and professionalism.',
    sample: `I would thank the company for the offer and ask for the date by which I need to respond. Then I would attend tomorrow's interview as planned. After that, I would compare both options based on role, learning, training and growth, and decide within the given time. I would inform both companies honestly about my decision.`,
    keywords: ['thank', 'response date', 'compare', 'role', 'growth', 'honest'],
  },
  {
    q: 'What does success mean to you?',
    category: 'Career Goals',
    tip: 'Checks values and maturity.',
    sample: `For me, success means steady growth. In the short term, it means becoming good at my work so my team can depend on me. In the long term, it means building software that many people use and helping juniors grow. I also think success includes a balanced life, where I keep learning and stay healthy.`,
    keywords: ['growth', 'dependable', 'impact', 'helping others', 'learning', 'balance'],
  },
];

export const gdTopics = [
  {
    topic: 'Artificial Intelligence will take away more jobs than it creates',
    type: 'Technology',
    for: ['Repetitive tasks like data entry and basic support are being automated.', 'Companies may hire fewer people for the same work.', 'Workers with low digital skills may find it hard to switch roles.', 'Change is happening faster than many training systems can adapt.'],
    against: ['New roles like AI engineers, data annotators and prompt designers are emerging.', 'AI tools increase productivity, which can help businesses grow and hire.', 'History shows technology often changes jobs rather than removing work altogether.', 'Human skills like creativity, judgement and empathy remain important.'],
    conclusion: 'AI will change the nature of many jobs; whether it creates more or fewer depends on how quickly people and institutions reskill.',
  },
  {
    topic: 'Work from home is better than work from office',
    type: 'Business',
    for: ['Saves travel time and cost.', 'Gives flexibility to manage personal responsibilities.', 'Companies can hire talent from any city.', 'Fewer office distractions for focused work.'],
    against: ['Harder for freshers to learn from seniors.', 'Team bonding and quick discussions suffer.', 'Work-life boundaries can blur.', 'Not everyone has a quiet space or stable internet at home.'],
    conclusion: 'A hybrid model that combines focus time at home with collaboration days in office may balance both sides.',
  },
  {
    topic: 'Social media does more harm than good',
    type: 'Social',
    for: ['Spreads fake news quickly.', 'Can be addictive and affect mental health.', 'Privacy concerns and data misuse.', 'Encourages comparison and unrealistic expectations.'],
    against: ['Connects people across distances.', 'Helps small businesses reach customers.', 'Gives a voice to people and social causes.', 'Useful for learning and professional networking.'],
    conclusion: 'Social media is a tool; responsible use, digital literacy and sensible regulation decide whether it helps or harms.',
  },
  {
    topic: 'Should coding be compulsory in schools?',
    type: 'Technology',
    for: ['Builds logical and problem-solving skills.', 'Prepares students for a digital economy.', 'Early exposure helps students discover interest.', 'Coding is useful in many fields, not only IT.'],
    against: ['Many schools lack computers and trained teachers.', 'Students already have a heavy syllabus.', 'Not every student needs to become a programmer.', 'Quality may suffer if introduced without planning.'],
    conclusion: 'Basic computational thinking is valuable for all, but it should be introduced gradually with proper infrastructure and teacher training.',
  },
  {
    topic: 'Startups vs MNCs: which is better for freshers?',
    type: 'Business',
    for: ['Startups give wider responsibility and faster learning.', 'Freshers get to see the full product lifecycle.', 'Direct access to founders and decision-makers.', 'Possibility of quick growth if the startup succeeds.'],
    against: ['MNCs offer structured training and processes.', 'Better job security and stable salary.', 'Strong brand name helps future job switches.', 'Clear career paths and mentorship programs.'],
    conclusion: 'Both have value; the right choice depends on the fresher\'s risk appetite, learning style and career goals.',
  },
  {
    topic: 'Digital payments in India: boon or bane?',
    type: 'Current Affairs',
    for: ['Fast and convenient transactions, even for small amounts.', 'Brings more people into the formal economy.', 'Reduces the need to carry cash.', 'Helps small vendors accept payments easily.'],
    against: ['Online fraud and scams are a growing concern.', 'Older people and rural users may struggle with technology.', 'Dependence on network and server availability.', 'Privacy and data security risks.'],
    conclusion: 'Digital payments are largely a boon, but they need strong security, awareness programmes and support for less digitally skilled users.',
  },
  {
    topic: 'Are online degrees as valuable as regular degrees?',
    type: 'Social',
    for: ['Accessible to working people and remote students.', 'Usually more affordable.', 'Learners can study at their own pace.', 'Many reputed universities now offer online programmes.'],
    against: ['Less hands-on practice and lab work.', 'Limited peer interaction and networking.', 'Some employers still prefer regular degrees.', 'Needs strong self-discipline to complete.'],
    conclusion: 'Online degrees are becoming more accepted; their value depends on the institution\'s quality and the learner\'s skills.',
  },
  {
    topic: 'Data privacy is a myth in the digital age',
    type: 'Technology',
    for: ['Many apps collect more data than they need.', 'Users accept terms and conditions without reading them.', 'Data breaches are reported regularly.', 'Personal data is used for targeted advertising.'],
    against: ['Data protection laws are becoming stronger.', 'Users can control permissions and settings.', 'Encryption protects many communications.', 'Awareness about privacy is growing.'],
    conclusion: 'Privacy is not a myth but it needs effort from governments, companies and users together.',
  },
  {
    topic: 'Freshers should focus on skills rather than marks',
    type: 'Abstract',
    for: ['Companies test practical skills in interviews.', 'Projects show real ability better than marks.', 'Technology changes quickly; skills must be updated.', 'Skills help in daily work after joining.'],
    against: ['Marks show discipline and consistency.', 'Many companies have a minimum percentage criteria.', 'Strong fundamentals from academics support skills.', 'Marks matter for higher studies.'],
    conclusion: 'Marks open the first door, but skills decide how far a fresher goes; both deserve attention.',
  },
  {
    topic: 'Electric vehicles are the future of Indian transport',
    type: 'Current Affairs',
    for: ['Lower running cost compared to petrol and diesel.', 'Less air pollution in cities.', 'Reduces dependence on imported fuel.', 'Government support and incentives.'],
    against: ['Charging infrastructure is still limited.', 'Higher upfront cost.', 'Battery disposal and mining concerns.', 'Electricity is still largely generated from coal.'],
    conclusion: 'EVs are an important part of the future, but success needs charging networks, cleaner power and affordable batteries.',
  },
  {
    topic: 'Failure is the stepping stone to success',
    type: 'Abstract',
    for: ['Failures teach lessons that success cannot.', 'Many successful people failed several times first.', 'Builds resilience and patience.', 'Encourages experimentation and innovation.'],
    against: ['Repeated failure without learning leads nowhere.', 'Some failures are very costly.', 'Failure can damage confidence if not handled well.', 'Success also depends on planning, not only trying again.'],
    conclusion: 'Failure helps only when we reflect and learn from it; it is a teacher, not a guarantee.',
  },
  {
    topic: 'Is a four-day work week practical in India?',
    type: 'Business',
    for: ['Better work-life balance and less burnout.', 'Could improve focus and productivity.', 'Attracts and retains talent.', 'Saves commuting time and office costs.'],
    against: ['Longer working hours on the remaining days.', 'Not suitable for client-facing and service roles.', 'Manufacturing and essential services cannot stop.', 'Global clients expect availability.'],
    conclusion: 'It may work for some knowledge-work roles as a pilot, but cannot be applied uniformly across all industries.',
  },
  {
    topic: 'Cashless economy: is India ready?',
    type: 'Current Affairs',
    for: ['Rapid growth in UPI usage.', 'Smartphones are widely available.', 'Transparency and reduced tax evasion.', 'Convenience for urban users.'],
    against: ['Many rural areas have weak connectivity.', 'Digital literacy gaps.', 'Cyber fraud risks.', 'Cash is still preferred in many small transactions.'],
    conclusion: 'India is moving towards a less-cash economy, but a fully cashless one needs better infrastructure and awareness.',
  },
  {
    topic: 'Technology has made us less social',
    type: 'Social',
    for: ['People spend more time on screens than with family.', 'Face-to-face conversations are reducing.', 'Online friendships can be shallow.', 'Notifications interrupt real interactions.'],
    against: ['Video calls keep families connected across cities.', 'Online communities support people with shared interests.', 'Technology helps organise social events.', 'Introverts find it easier to connect online.'],
    conclusion: 'Technology changes how we socialise; balance and mindful use decide whether it brings us closer or apart.',
  },
  {
    topic: 'Should social media platforms be regulated by the government?',
    type: 'Current Affairs',
    for: ['Controls fake news and hate speech.', 'Protects children and vulnerable users.', 'Makes platforms accountable.', 'Protects user data.'],
    against: ['Risk to free speech.', 'Regulation may be misused.', 'Slows innovation.', 'Platforms operate globally; rules are hard to enforce.'],
    conclusion: 'Some regulation is needed for safety and accountability, but it must protect freedom of expression and be transparent.',
  },
  {
    topic: 'Hard work vs smart work',
    type: 'Abstract',
    for: ['Smart work saves time by focusing on what matters.', 'Using tools and automation increases output.', 'Planning avoids wasted effort.', 'Smart work prevents burnout.'],
    against: ['Hard work builds the base for smart work.', 'Some skills need hours of practice.', 'Shortcuts can reduce quality.', 'Consistency often beats cleverness.'],
    conclusion: 'The best results come from hard work guided by smart planning; one without the other is incomplete.',
  },
  {
    topic: 'Open source software: should companies contribute?',
    type: 'Technology',
    for: ['Companies use open source heavily and should give back.', 'Improves the company\'s reputation among developers.', 'Helps attract talent.', 'Shared improvements benefit everyone.'],
    against: ['Costs time and money.', 'Risk of exposing internal knowledge.', 'Maintaining projects needs long-term commitment.', 'Not every company has spare capacity.'],
    conclusion: 'Contributing to open source can be a good investment when it is planned and aligned with business goals.',
  },
  {
    topic: 'Should companies prefer certifications over degrees?',
    type: 'Business',
    for: ['Certifications show specific, current skills.', 'Faster and cheaper to obtain.', 'Useful for career switchers.', 'Updated with new technologies.'],
    against: ['Degrees build broader fundamentals.', 'Certifications can be cleared by memorising.', 'Degrees show long-term commitment.', 'Some roles legally require degrees.'],
    conclusion: 'Degrees and certifications complement each other; employers should look at actual skills tested in interviews.',
  },
  {
    topic: 'Brain drain: should India worry?',
    type: 'Current Affairs',
    for: ['Talented people trained in India work abroad.', 'Loss of potential innovators and researchers.', 'Public money spent on education benefits other countries.', 'Fewer experienced leaders at home.'],
    against: ['Remittances support the economy.', 'Many professionals return with global experience.', 'Global networks help Indian businesses.', 'Opportunities in India are growing.'],
    conclusion: 'India should focus on creating opportunities so that talent chooses to stay or return, turning brain drain into brain gain.',
  },
  {
    topic: 'Is the gig economy good for young professionals?',
    type: 'Business',
    for: ['Flexible working hours.', 'Opportunity to earn while studying.', 'Exposure to many clients and projects.', 'Low entry barriers.'],
    against: ['No job security or fixed income.', 'Limited benefits like insurance and PF.', 'Less structured learning.', 'Can be hard to plan long-term careers.'],
    conclusion: 'The gig economy offers flexibility but needs social security measures; young professionals should use it wisely alongside skill building.',
  },
  {
    topic: 'Cybersecurity awareness should be taught to every citizen',
    type: 'Technology',
    for: ['Online fraud often targets uninformed users.', 'More services are moving online.', 'Basic habits prevent many attacks.', 'Protects families and small businesses.'],
    against: ['Hard to reach everyone with training.', 'Technology changes faster than awareness programmes.', 'Responsibility should also lie with banks and platforms.', 'Too much fear may stop people from using digital services.'],
    conclusion: 'Basic cybersecurity awareness is essential, along with stronger protections from service providers.',
  },
  {
    topic: 'Leaders are born, not made',
    type: 'Abstract',
    for: ['Some people naturally have confidence and charisma.', 'Early personality traits show leadership.', 'Natural communicators influence others easily.', 'Some people enjoy taking charge from childhood.'],
    against: ['Leadership skills can be learned and practised.', 'Many leaders grew through experience and mistakes.', 'Training and mentorship develop leaders.', 'Situations create leaders.'],
    conclusion: 'Some traits may be natural, but most leadership qualities are developed through experience, learning and effort.',
  },
  {
    topic: 'Should mobile phones be banned in classrooms?',
    type: 'Social',
    for: ['Reduces distraction.', 'Improves attention and interaction.', 'Prevents cheating.', 'Reduces cyberbullying in school hours.'],
    against: ['Phones can be used as learning tools.', 'Useful for emergencies.', 'Students need to learn responsible use.', 'Digital resources support learning.'],
    conclusion: 'Instead of a complete ban, schools can create clear rules on when and how phones may be used.',
  },
  {
    topic: 'Automation in testing will replace manual testers',
    type: 'Technology',
    for: ['Automated tests run faster and repeatedly.', 'Reduces human error in regression testing.', 'Fits well with CI/CD pipelines.', 'Saves cost over the long term.'],
    against: ['Exploratory and usability testing need humans.', 'Someone must design and maintain automation.', 'New features often need manual checks first.', 'Testers can upskill to automation roles.'],
    conclusion: 'Automation will change the tester\'s role, not remove it; testers who learn automation will be in demand.',
  },
  {
    topic: 'Money is the best motivator at work',
    type: 'Abstract',
    for: ['Salary meets basic needs and goals.', 'Bonuses encourage performance.', 'Fair pay shows the company values employees.', 'Low pay leads people to leave.'],
    against: ['Recognition and respect also motivate.', 'Learning and growth matter, especially for freshers.', 'Good managers and culture keep people engaged.', 'Meaningful work gives long-term satisfaction.'],
    conclusion: 'Money is an important motivator, but long-term motivation comes from growth, recognition and a healthy work culture.',
  },
];

export const emailTasks = [
  {
    title: 'Leave request',
    scenario: 'You need one day of leave next Monday for a family function. Write to your team lead.',
    mustInclude: ['subject line', 'date of leave', 'reason in brief', 'handover of pending work', 'polite closing'],
    sample: `Subject: Leave request for Monday, 18 March\n\nHi Rohan,\n\nI would like to request one day of leave on Monday, 18 March, as I need to attend a family function.\n\nMy current task (JIRA-210, product search API) will be completed by Friday. If anything urgent comes up, Sneha is aware of the code changes and can help.\n\nPlease let me know if this is okay.\n\nThanks and regards,\nAarav`,
  },
  {
    title: 'Asking for help on a technical issue',
    scenario: 'You are stuck with a database connection error in a Spring Boot app. Write to a senior developer.',
    mustInclude: ['subject line', 'what you are working on', 'exact error', 'what you have tried', 'specific request'],
    sample: `Subject: Help needed - DB connection error in Order Service\n\nHi Kavya,\n\nI am setting up the Order Service locally and the application fails to start with this error:\n"Communications link failure - Connection refused"\n\nWhat I have tried:\n- Checked that MySQL is running on port 3306\n- Verified the username and password in application.properties\n- Restarted the MySQL service\n\nCould you please spare 10 minutes today to look at it with me? I think I may be missing a configuration step.\n\nThanks,\nRitesh`,
  },
  {
    title: 'Thank-you email after an interview',
    scenario: 'You had a technical interview yesterday. Send a thank-you email to the interviewer or HR.',
    mustInclude: ['subject line', 'thanks for the opportunity', 'one specific point from the interview', 'interest in the role', 'closing'],
    sample: `Subject: Thank you - Java Developer interview on 12 March\n\nDear Ms. Menon,\n\nThank you for taking the time to interview me yesterday for the Java Developer role. I enjoyed our discussion about how your team uses Spring Boot microservices for the payments platform.\n\nThe conversation increased my interest in the role, and I would be glad to contribute and learn as part of your team.\n\nLooking forward to hearing from you.\n\nBest regards,\nSaurabh Joshi`,
  },
  {
    title: 'Accepting a job offer',
    scenario: 'You received an offer letter and want to accept it and confirm the joining date.',
    mustInclude: ['subject line', 'acceptance', 'joining date', 'gratitude', 'question about next steps'],
    sample: `Subject: Acceptance of offer - Associate Software Engineer\n\nDear HR Team,\n\nThank you for offering me the position of Associate Software Engineer. I am happy to accept the offer and confirm that I will join on 1 July at the Pune office.\n\nPlease let me know the documents I need to bring on the joining day and any formalities I should complete before that.\n\nI am looking forward to starting my career with the company.\n\nThanks and regards,\nAnjali Deshmukh`,
  },
  {
    title: 'Daily status update',
    scenario: 'Your lead asked everyone to send an end-of-day status email.',
    mustInclude: ['subject line with date', 'completed tasks', 'in-progress tasks', 'blockers', 'plan for tomorrow'],
    sample: `Subject: Status update - 14 March\n\nHi Team,\n\nCompleted:\n- JIRA-301: Added validation to employee registration API\n- Fixed review comments on PR #58\n\nIn progress:\n- JIRA-305: Pagination for employee list (about 60% done)\n\nBlockers:\n- None\n\nPlan for tomorrow:\n- Finish JIRA-305 and write unit tests\n\nThanks,\nManoj`,
  },
  {
    title: 'Informing about a delay',
    scenario: 'You will not finish the report module by the agreed Friday deadline because a third-party library has issues.',
    mustInclude: ['subject line', 'early information', 'reason', 'new estimate', 'what can still be delivered'],
    sample: `Subject: Update on report module - revised timeline\n\nHi Deepa,\n\nI wanted to inform you early that the PDF report module may not be ready by Friday as planned. The PDF library we chose does not support the table layout we need, and I am testing an alternative.\n\nThe Excel export is complete and can be released on Friday. I expect to finish the PDF export by Tuesday, including testing.\n\nPlease let me know if you would like me to prioritise anything differently.\n\nRegards,\nVivek`,
  },
  {
    title: 'Requesting access',
    scenario: 'You need access to the Git repository and the test database to start your task. Write to the IT/DevOps team.',
    mustInclude: ['subject line', 'what access is needed', 'why', 'manager approval reference', 'thanks'],
    sample: `Subject: Access request - Git repo and test DB for Inventory project\n\nHi DevOps Team,\n\nI have joined the Inventory project team this week. Could you please provide me with:\n1. Developer access to the inventory-service Git repository\n2. Read/write access to the inventory test database\n\nMy manager, Mr. Prakash Nair, has approved this request (he is in CC).\n\nThank you for your help.\n\nRegards,\nSahil Gupta\nAssociate Software Engineer`,
  },
  {
    title: 'Following up on an application',
    scenario: 'You applied for a Java developer role two weeks ago and have not heard back.',
    mustInclude: ['subject line', 'reference to the role and date applied', 'brief reminder of fit', 'polite request for update'],
    sample: `Subject: Follow-up on Java Developer application (applied on 2 March)\n\nDear Hiring Team,\n\nI applied for the Java Developer (Fresher) role on 2 March and wanted to follow up on my application.\n\nI have hands-on experience with Core Java, Spring Boot and MySQL through two projects, and I am very interested in this opportunity.\n\nCould you please let me know if there is any update on the selection process? I have attached my resume again for your reference.\n\nThank you for your time.\n\nRegards,\nPrateek Singh`,
  },
  {
    title: 'Meeting request',
    scenario: 'You want 30 minutes with your lead to discuss the design for a new feature.',
    mustInclude: ['subject line', 'purpose', 'proposed time options', 'agenda', 'closing'],
    sample: `Subject: Meeting request - design discussion for coupon feature\n\nHi Arjun,\n\nCould we have a 30-minute meeting to discuss the design for the coupon feature before I start coding?\n\nAgenda:\n1. Database tables for coupons\n2. Validation rules (expiry, minimum order value)\n3. API endpoints\n\nI am available tomorrow at 11 AM or 3 PM. Please let me know which works for you, or suggest another time.\n\nThanks,\nRiya`,
  },
  {
    title: 'Apologising for a mistake',
    scenario: 'You accidentally deployed an untested change to the test server, and the testers lost two hours of work.',
    mustInclude: ['subject line', 'clear apology', 'what happened', 'what was done to fix it', 'how you will prevent it'],
    sample: `Subject: Apology - test server issue this morning\n\nHi QA Team,\n\nI am sorry for the test server issue this morning. I deployed my branch without running the full test suite, which broke the login flow and blocked your testing for about two hours.\n\nI have rolled back the change, and the server has been stable since 11:30 AM. The issue is now fixed in my branch and all tests pass.\n\nFrom now on, I will run the full test suite and get a review before deploying to the shared server.\n\nApologies again for the trouble.\n\nRegards,\nNikhil`,
  },
];

export const starQuestions = [
  {
    q: 'Tell me about a time you solved a difficult technical problem.',
    sample: {
      situation: 'In my e-commerce project, the product listing page took several seconds to load once we added sample data.',
      task: 'I was responsible for the backend, so I had to make the API faster before our project review.',
      action: 'I enabled SQL logging and saw that one query ran for every product to fetch its category (the N+1 problem). I changed it to a join fetch, added pagination and created an index on the category column.',
      result: 'The page loaded almost instantly in our tests, and our guide appreciated the fix. I learned to check the actual queries before guessing the cause.',
    },
  },
  {
    q: 'Describe a time you worked under a tight deadline.',
    sample: {
      situation: 'Three days before our final-year project submission, our tester found that the payment module failed for some orders.',
      task: 'I had to fix the bug and make sure nothing else broke before submission.',
      action: 'I reproduced the bug, found that decimal amounts were rounded wrongly, and switched to BigDecimal. I wrote test cases for different amounts and asked a teammate to retest all flows.',
      result: 'We submitted one day early with all tests passing. I learned to handle money with BigDecimal and to test edge cases early.',
    },
  },
  {
    q: 'Tell me about a conflict in your team and how you resolved it.',
    sample: {
      situation: 'In a college hackathon, two teammates disagreed on whether to build a mobile app or a web app.',
      task: 'As the team coordinator, I needed to get a decision quickly because we had only 24 hours.',
      action: 'I asked each to list pros and cons in 10 minutes. We compared them against the judging criteria and our skills. The web app was faster for us to build, so I suggested a responsive web app that works on mobile too.',
      result: 'Both agreed, we finished on time and reached the final round. I learned that using clear criteria reduces personal arguments.',
    },
  },
  {
    q: 'Give an example of a mistake you made and how you handled it.',
    sample: {
      situation: 'During my internship, I pushed code that changed a shared configuration file by mistake.',
      task: 'The other developers\' local setups started failing, and I needed to fix it quickly.',
      action: 'I informed my mentor immediately, reverted the change, and told the team what had happened. Then I learned to use .gitignore and local profiles for personal settings.',
      result: 'The issue was fixed within an hour. My mentor appreciated that I reported it early. I now review my changes with git diff before every commit.',
    },
  },
  {
    q: 'Tell me about a time you learned a new technology quickly.',
    sample: {
      situation: 'In my training program, our project needed JWT-based login, which none of us had used.',
      task: 'I volunteered to implement the authentication in one week.',
      action: 'I read the Spring Security documentation, built a small separate demo first, then added JWT generation and validation to our project with role checks.',
      result: 'Login and role-based access worked by the deadline, and I explained it to my team in a short session. I learned that a small demo first speeds up learning.',
    },
  },
  {
    q: 'Describe a time you took initiative without being asked.',
    sample: {
      situation: 'Our project team was wasting time because everyone set up the database differently.',
      task: 'Nobody was assigned to fix this, but I felt it was slowing us down.',
      action: 'I wrote a SQL script to create tables with sample data and a short README with setup steps, and shared it in our group.',
      result: 'New setups took minutes instead of hours, and our guide asked other teams to follow the same practice.',
    },
  },
  {
    q: 'Tell me about a time you helped a teammate.',
    sample: {
      situation: 'A classmate in my project team was struggling with Java Collections and was behind on his module.',
      task: 'I wanted to help him catch up without doing his work for him.',
      action: 'I spent two evenings explaining List, Set and Map with small examples, and then pair-programmed with him on the first part of his module.',
      result: 'He completed his module on time and later helped others. I also understood Collections more deeply by teaching.',
    },
  },
  {
    q: 'Describe a time you received critical feedback.',
    sample: {
      situation: 'In my internship, my mentor reviewed my first pull request and left many comments.',
      task: 'I needed to fix the comments and improve my coding style.',
      action: 'I read every comment, asked questions where I was unsure, refactored long methods into smaller ones and added meaningful names and tests.',
      result: 'My next pull requests had far fewer comments, and my mentor noted the improvement in my final review.',
    },
  },
  {
    q: 'Tell me about a time you had to handle multiple tasks at once.',
    sample: {
      situation: 'In my final semester, I had exams, a project deadline and placement preparation at the same time.',
      task: 'I needed to manage all three without dropping any.',
      action: 'I made a weekly plan with fixed time blocks: mornings for exam study, afternoons for the project and one hour every night for coding practice. I reviewed the plan every Sunday.',
      result: 'I passed my exams with good marks, submitted the project on time and cleared two placement tests.',
    },
  },
  {
    q: 'Give an example of when you showed leadership.',
    sample: {
      situation: 'I was part of the organising team for our college coding contest.',
      task: 'I was asked to lead the technical team of five students.',
      action: 'I divided work into question setting, testing and platform setup, held short daily check-ins, and ran a full trial contest two days before.',
      result: 'The contest ran smoothly with many participants and no technical issues. I learned how planning and regular check-ins keep a team aligned.',
    },
  },
  {
    q: 'Tell me about a time you failed to meet expectations.',
    sample: {
      situation: 'In my first mock interview conducted by our training institute, I scored poorly in the technical round.',
      task: 'I had to improve before the actual placement drives started in a month.',
      action: 'I listed every question I missed, revised those topics with code examples and practised explaining answers aloud with a friend twice a week.',
      result: 'In the next mock interview I was rated well, and I felt much more confident in real interviews.',
    },
  },
  {
    q: 'Describe a situation where you had to work with unclear requirements.',
    sample: {
      situation: 'Our guide asked us to build a "simple reporting feature" for our attendance project.',
      task: 'I was responsible for it, but it was not clear what reports were needed.',
      action: 'I wrote down three possible reports with sample outputs and showed them to the guide in a short meeting to confirm.',
      result: 'He picked two of them and added one detail. We built exactly what was needed, with no rework.',
    },
  },
  {
    q: 'Tell me about a time you improved a process.',
    sample: {
      situation: 'In our team project, we were testing APIs manually every time after a change.',
      task: 'I wanted to reduce the repeated testing effort.',
      action: 'I created a Postman collection with all API requests and wrote JUnit tests for the main service methods, then showed the team how to run them.',
      result: 'Testing after changes became much faster and we caught two bugs before the demo.',
    },
  },
  {
    q: 'Describe a time you had to explain something technical to a non-technical person.',
    sample: {
      situation: 'During a college project showcase, a visitor from a non-IT background asked how our app keeps passwords safe.',
      task: 'I had to explain hashing in simple terms.',
      action: 'I compared hashing to making a fruit juice: you can make juice from fruit, but you cannot get the fruit back from the juice. I said we store only the "juice" of the password.',
      result: 'The visitor understood and appreciated it. I learned that simple analogies make technical ideas easy to understand.',
    },
  },
  {
    q: 'Tell me about a time you went beyond your assigned work.',
    sample: {
      situation: 'During my internship, I was asked to fix a bug in the user profile page.',
      task: 'After fixing it, I noticed similar validation was missing in two other forms.',
      action: 'I informed my mentor, and with his approval, I added the same validation to the other forms and wrote tests for all three.',
      result: 'The team avoided similar bugs in those forms, and my mentor gave me a more complex task next because he trusted my work.',
    },
  },
];

export const fillerWords = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'so', 'literally', 'i mean', 'kind of', 'sort of', 'right'];
