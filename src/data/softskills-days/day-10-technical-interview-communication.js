export default {
  id: "day-10-technical-interview-communication",
  title: "Technical Interview Communication: Thinking Aloud, Explaining Projects and Handling \"I Don't Know\"",
  module: "Module 3: Interview Skills",
  day: 10,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Communicate like an engineer in technical rounds: clarify the problem, think aloud while coding, explain your project architecture clearly, accept hints gracefully and handle questions you cannot answer without losing confidence.",
  objectives: [
    "Clarify requirements and edge cases before solving a coding problem",
    "Think aloud in a structured way: approach, complexity, code, test",
    "Explain your project using a clear 5-part structure",
    "Handle 'I don't know' honestly while showing reasoning",
    "Use hints and feedback from the interviewer effectively",
  ],
  theory: [
    {
      heading: "Why Communication Matters in Technical Rounds",
      content: `Many candidates believe the technical round is only about the correct answer. In reality, interviewers evaluate how you think: do you understand the problem, can you break it down, can you explain trade-offs, and would they enjoy working with you on a real bug at 6 pm?\n\nA candidate who silently writes perfect code may score lower than one who explains a good approach clearly, makes a small mistake and fixes it after a hint. In real projects, you constantly discuss designs and code reviews, so communication is part of the technical skill.`,
      points: [
        "Problem understanding and clarifying questions",
        "Structured approach before coding",
        "Clear explanation of logic and complexity",
        "Testing your own code",
        "Collaboration: responding to hints and feedback",
      ],
    },
    {
      heading: "Clarify Before You Code",
      content: `Never start coding immediately. Repeat the problem in your own words and ask clarifying questions about input size, data types, edge cases and expected output. This shows maturity and avoids solving the wrong problem.\n\nFor example, for 'Find duplicates in an array': Is the array sorted? Can it contain negative numbers? What should I return: the first duplicate, all duplicates, or a count? Can I modify the array? What is the expected size, thousands or millions?`,
      points: [
        "Restate the problem",
        "Ask about input constraints and size",
        "Ask about edge cases: empty input, duplicates, negatives, null",
        "Confirm expected output format",
        "Walk through one example by hand",
      ],
      tip: "Two or three good clarifying questions are enough. Do not delay with ten.",
    },
    {
      heading: "Thinking Aloud: The Structure",
      content: `Thinking aloud means speaking your reasoning as you work, so the interviewer can follow and guide you. Use this flow: (1) Brute-force idea and its complexity, (2) Better approach and why it is better, (3) Confirm with the interviewer before coding, (4) Code while narrating key steps, (5) Dry-run with an example and edge cases, (6) State the final time and space complexity.\n\nAvoid long silences. If you need to think quietly, say so: 'Let me think about this for 30 seconds.' Then share your thoughts.`,
      points: [
        "'The simple approach is nested loops, O(n squared)...'",
        "'We can improve using a HashSet to get O(n) time with O(n) space...'",
        "'Shall I go ahead with this approach?'",
        "'Now let me dry-run with [2, 5, 2]...'",
        "'Edge case: empty array returns an empty list.'",
      ],
      tip: "Starting with brute force is fine. It shows you can solve it, then you optimise.",
    },
    {
      heading: "Explaining Your Project",
      content: `'Explain your project' is asked in almost every fresher interview, yet many students describe it poorly: they list technologies or jump into random details. Use a 5-part structure: **Problem** (what problem and for whom), **Solution** (what the app does, main features), **Architecture and tech stack** (front end, back end, database, flow of a request), **Your role** (modules you built personally), and **Challenges and results** (one technical challenge and how you solved it, plus outcomes).\n\nKeep the first explanation to about 2 minutes, then let the interviewer dig in. Be ready to draw a simple architecture diagram and the database tables.`,
      points: [
        "Problem: one or two lines",
        "Solution: 3-4 main features",
        "Architecture: client -> API -> database, with technologies",
        "Your role: be specific and honest",
        "Challenge + result: one good technical story",
      ],
      tip: "Prepare to answer: 'Why did you choose this technology?' and 'What would you improve if you had more time?'",
    },
    {
      heading: "Handling 'I Don't Know'",
      content: `You will face questions you cannot answer. Bluffing is the worst option, because interviewers usually know the answer and will follow up. A flat 'I don't know' is also weak. The best approach is honest + reasoning: admit you are not sure, share what you do know or how you would think about it, and, if possible, connect to a related concept.\n\nExample: 'I have not worked with Kafka directly. From what I understand, it is a message broker used for event streaming between services. In my project, I used RabbitMQ-like queuing through Celery with Redis, so I understand the concept of producers and consumers. I would be happy to learn Kafka.'`,
      points: [
        "Be honest: 'I am not sure about this'",
        "Reason: 'But I think it might work like...'",
        "Relate: connect to something you know",
        "Show learning attitude: 'I will read about it after this interview'",
        "Never make up an answer confidently",
      ],
    },
    {
      heading: "Taking Hints and Recovering from Mistakes",
      content: `If the interviewer gives a hint ('What if the array were sorted?'), it means they want you to succeed. Pause, think about why they said it, and say how it changes your approach. Thank them naturally.\n\nIf you find a bug in your own code, say so calmly: 'I see an issue here: the loop goes out of bounds when the array has one element. Let me fix that.' Finding and fixing your own bugs is a positive signal. If you are completely stuck, ask a specific question rather than staying silent.`,
      points: [
        "Treat hints as collaboration, not failure",
        "Narrate your fixes calmly",
        "Ask specific questions when stuck",
        "Stay positive even if a question goes badly; the next one is a fresh start",
      ],
    },
  ],
  examples: [
    {
      title: "Thinking Aloud on a Coding Question",
      scenario: "Question: 'Given an array of integers and a target, return the indices of two numbers that add up to the target.'",
      steps: [
        "Clarify inputs and outputs",
        "State brute force and complexity",
        "Propose optimised approach and confirm",
        "Code and dry-run",
        "State final complexity",
      ],
      code: `Candidate:
"Let me restate: I get an integer array and a target, and I return the two
indices whose values add to the target. Can I assume exactly one solution
exists? Can the same element be used twice? (No.) Can numbers be negative?"

"The brute-force way is to check every pair with two loops. That is
O(n squared) time and O(1) space.

A better way: as I loop, I store each number and its index in a HashMap.
For each number, I check whether target minus that number is already in the
map. That gives O(n) time and O(n) space. Shall I code this?"

(codes while narrating)
"Dry run: nums = [2, 7, 11, 15], target = 9.
i=0: need 7, map empty, store 2->0.
i=1: need 2, found at 0, return [0, 1]. Correct.
Edge case: if no pair exists, I return an empty array.
Final: O(n) time, O(n) space."`,
      result: "Interviewer sees clear reasoning, trade-off awareness and self-testing.",
      explanation: "The candidate never goes silent, gets buy-in before coding and validates the solution.",
    },
    {
      title: "Explaining a Project in 2 Minutes",
      scenario: "Interviewer: 'Explain your final-year project.'",
      steps: [
        "Problem",
        "Solution and features",
        "Architecture and tech stack",
        "Your role",
        "Challenge and result",
      ],
      code: `"Problem: In our college, students waited in long queues at the canteen
during the 20-minute break.

Solution: We built 'QuickBite', a web app where students pre-order food,
pay through UPI test mode and get a pickup token.

Architecture: React front end calls a Spring Boot REST API. The API stores
orders in MySQL. The canteen staff use an admin dashboard that refreshes
every 10 seconds to show new orders.

My role: I built the order and payment APIs and designed the database:
users, menu_items, orders and order_items tables.

Challenge: During testing, two students could order the last samosa at the
same time. I solved it using a database transaction with row locking on
the stock count.

Result: In a two-week pilot, about 150 students used it daily and average
waiting time dropped from 15 minutes to around 4."`,
      result: "The interviewer gets the full picture in two minutes and has multiple good follow-up topics.",
      explanation: "The structure moves from business problem to technology to personal contribution, which is exactly what interviewers want.",
    },
    {
      title: "Handling 'I Don't Know': Bad vs Good",
      scenario: "Question: 'What is the difference between optimistic and pessimistic locking?'",
      steps: [
        "Compare bluffing, giving up and honest reasoning",
      ],
      code: `BAD (bluff):
"Optimistic locking is when the database is optimistic that it will not
crash, and pessimistic is when it backs up data." (incorrect, confident)

BAD (give up):
"I don't know, sir." (silence)

GOOD:
"I have not studied these terms formally, but let me reason it out.
Pessimistic probably means we lock the row before updating, assuming
conflicts will happen, like the row locking I used in my canteen project.
Optimistic might mean we do not lock, but check at save time whether
someone else changed the data, maybe using a version number.
Is that the right direction?"`,
      result: "Even without prior knowledge, the candidate shows reasoning, links to experience and stays honest.",
      explanation: "Interviewers value honest reasoning far more than confident wrong answers. Here the reasoning happens to be correct.",
    },
    {
      title: "Using a Hint Gracefully",
      scenario: "The candidate is stuck finding the middle of a linked list in one pass.",
      steps: [
        "Interviewer gives a hint",
        "Candidate acknowledges and reasons with it",
      ],
      code: `Interviewer: "What if you used two pointers moving at different speeds?"

Candidate: "Oh, that helps, thank you. If a slow pointer moves one step and a
fast pointer moves two steps, when fast reaches the end, slow will be at the
middle. That is one pass, O(n) time and O(1) space. For an even length list,
I should confirm which middle you want: first or second?"`,
      result: "The interviewer sees a collaborative engineer who learns quickly.",
      explanation: "The candidate does not get defensive, builds on the hint and even asks a smart clarifying question.",
    },
  ],
  interview: [
    { q: "Explain your project.", a: `I use a five-part structure: the problem, the solution with main features, the architecture and tech stack, my specific role, and one challenge with the result. For example: our hostel complaint system replaced paper registers; students raise complaints on a React app, a Django API stores them in PostgreSQL, and wardens see a dashboard. I built the API and the notification module. The challenge was duplicate complaints, which I handled with a similarity check. Complaint resolution time dropped from about 5 days to 2.`, level: "Easy" },
    { q: "Why did you choose this technology for your project?", a: `I chose Spring Boot because our team knew Java, it provides ready support for REST APIs, security and database access through JPA, and it is widely used in the industry, so learning it adds value to my career. For the database, MySQL fit because our data was relational. If I rebuilt it today, I might consider PostgreSQL for better JSON support.`, level: "Medium" },
    { q: "What would you improve in your project if you had more time?", a: `Three things: add automated tests, because we tested mostly manually; add caching with Redis for the menu API, which is read very frequently; and deploy with Docker and a CI pipeline, so every push is tested and deployed automatically. These would make it more reliable and production-ready.`, level: "Medium" },
    { q: "What do you do when you do not know the answer to a technical question?", a: `I am honest that I do not know it fully, then I share my reasoning or related knowledge, and I show willingness to learn. I never bluff, because a wrong confident answer damages trust. Interviewers usually appreciate the thought process even if the final answer is incomplete.`, level: "Easy" },
    { q: "How do you approach a coding problem in an interview?", a: `First I clarify the problem and edge cases, then I walk through an example by hand. I explain the brute-force solution and its complexity, then optimise and confirm the approach with the interviewer. Then I code while explaining, dry-run with examples and edge cases, and finally state the time and space complexity.`, level: "Easy" },
    { q: "What was the most difficult bug you faced in your project?", a: `Our login worked locally but failed after deploying on the server. After checking logs, I found that the JWT secret was read from an environment variable that was not set on the server, so tokens could not be verified. I fixed it by configuring environment variables properly and added a startup check that fails clearly if required variables are missing. I learned to never rely on local-only configuration.`, level: "Medium" },
    { q: "Your teammate wrote most of the project code. What did you do?", a: `I will be honest about my contribution. My teammate built most of the front end. I designed the database schema, wrote the SQL queries and stored procedures for reports, and did the testing and documentation. I can explain the overall flow of the whole application, and in detail the database and reporting parts.`, level: "Hard" },
    { q: "How would you explain your project to a non-technical HR person?", a: `I would focus on the problem and benefit: 'Students used to wait 15 minutes in the canteen queue. Our app lets them order and pay in advance from their phone and just pick up the food. In our trial, waiting time came down to about 4 minutes.' No technical terms unless they ask.`, level: "Medium" },
    { q: "The interviewer says your solution is wrong. How do you react?", a: `I stay calm and ask what case fails, or I test with a few inputs myself to find the problem. I see it as feedback, not criticism. Once I find the issue, I explain the fix clearly. Showing how I debug under pressure is often more valuable than having been right the first time.`, level: "Medium" },
    { q: "Draw the architecture of your project.", a: `I draw boxes from left to right: the user's browser or mobile app, then the front end (React), an arrow labelled HTTPS/JSON to the back-end API (Spring Boot) with its main modules, an arrow to the database (MySQL) with key tables, and any external services like a payment gateway or email service. Then I narrate one request end to end, for example placing an order.`, level: "Hard" },
    { q: "Why is thinking aloud important in coding interviews?", a: `Because the interviewer evaluates my problem-solving process, not just the final code. When I think aloud, they can understand my approach, give hints if I go in the wrong direction, and see how I would collaborate in a real team. Silence gives them nothing to evaluate.`, level: "Easy" },
  ],
  practice: [
    {
      task: "Write a 2-minute explanation of your own final-year or best project using the 5-part structure (Problem, Solution, Architecture, Your role, Challenge + Result).",
      hint: "Use numbers in the result. Mention specific tables or APIs you built.",
      solution: `Model (library system):
Problem: Our college library tracked 12,000 books in registers; finding
availability took time and fines were calculated by hand.
Solution: A web app where students search books, reserve them and see due
dates; librarians issue and return books with barcode scanning.
Architecture: Angular front end -> ASP.NET Core Web API -> SQL Server.
Tables: Books, Members, Issues, Fines. Hosted on the college server.
My role: I built the Issue/Return APIs and the automatic fine calculation
using a scheduled job.
Challenge + Result: Barcode scanners sent extra newline characters that broke
search; I sanitised input in the API. After launch, issue time dropped from
about 3 minutes to 30 seconds per student.`,
    },
    {
      task: "Practise thinking aloud on 'Reverse a string without using built-in reverse functions'. Write the full narration including clarification, approach, code idea, dry run and complexity.",
      hint: "Ask about Unicode, empty strings and whether in-place is required.",
      solution: `"Let me clarify: input is a string, output is the reversed string. Should I
handle empty strings? Yes, return empty. Is in-place required? Strings are
immutable in Java and Python, so I will build a new one.

Approach: convert to a character array, use two pointers, left at 0 and right
at the end, swap and move inward until they meet. O(n) time, O(n) space for
the array.

Dry run: 'code' -> swap c,e -> 'eodc' -> swap o,d -> 'edoc'. Correct.
Edge cases: '' -> '', 'a' -> 'a'.
Final complexity: O(n) time, O(n) extra space."`,
    },
    {
      task: "Prepare 'I don't know' responses for three topics you have not studied (e.g. Kubernetes, GraphQL, CAP theorem). Use Honest + Reason + Relate + Learn.",
      hint: "Base the reasoning on what you do know; keep each under 45 seconds.",
      solution: `Kubernetes: "I have not used Kubernetes. I know it manages containers at
scale. I have used Docker Compose to run 2 containers together, so I assume
Kubernetes does this across many machines with auto-restart and scaling.
I plan to try Minikube next."

GraphQL: "I have not used GraphQL in a project. I understand it lets the
client ask for exactly the fields it needs, unlike REST where the server
fixes the response. I have built REST APIs, so I would like to compare
both."

CAP theorem: "I am not fully sure. I recall it is about Consistency,
Availability and Partition tolerance in distributed systems, and that you
cannot fully guarantee all three at once during a network partition. I would
like to read more about how databases like Cassandra handle it."`,
    },
    {
      task: "Do a mock technical round with a friend: one coding question (15 minutes) and one project explanation (5 minutes). Ask them to score you 1-5 on clarity, structure, silence handling and testing.",
      hint: "Use a shared Google Doc or a whiteboard. Record the session if possible.",
      solution: `Sample scorecard:
Clarifying questions: 4/5 (asked about negatives and empty input)
Approach explanation: 3/5 (did not state brute-force complexity)
Silence handling: 2/5 (went silent for 2 minutes while coding)
Testing: 4/5 (dry-run done, missed one edge case)
Project explanation: 4/5 (clear structure, role specific)
Action: practise narrating while typing, and always state complexity of
each approach. Repeat mock after 3 days.`,
    },
  ],
  quiz: [
    { question: "What should you do first when given a coding problem?", options: ["Start coding immediately", "Ask for the answer", "Clarify the problem and edge cases", "Stay silent and think for 10 minutes"], answer: 2, explanation: "Clarifying ensures you solve the right problem and shows maturity." },
    { question: "Which is the best response to a question you cannot answer?", options: ["Bluff confidently", "Admit it honestly and reason with related knowledge", "Say 'I don't know' and stay silent", "Change the topic"], answer: 1, explanation: "Honesty plus reasoning shows integrity and thinking ability." },
    { question: "In the 5-part project explanation, what comes right after 'Problem'?", options: ["Solution and features", "Your salary", "Challenges", "Team members' names"], answer: 0, explanation: "Problem, Solution, Architecture, Your role, Challenge + Result." },
    { question: "Why mention the brute-force approach first?", options: ["Interviewers want only brute force", "It saves time", "It is mandatory", "It shows you can solve it, then optimise with clear trade-offs"], answer: 3, explanation: "A working baseline followed by optimisation shows structured thinking." },
    { question: "An interviewer gives you a hint. What does it usually mean?", options: ["You have failed", "You should give up", "They want to help you reach the solution", "They are testing your patience"], answer: 2, explanation: "Hints are collaborative; using them well is a positive signal." },
    { question: "What should you do after writing your code?", options: ["Say 'done' immediately", "Dry-run it with examples and edge cases", "Ask for the next question", "Delete it"], answer: 1, explanation: "Testing your own code catches bugs and shows engineering discipline." },
  ],
};
