export default {
  id: "day-07-linkedin-personal-branding-cover-letters",
  title: "LinkedIn Profile, Personal Branding, Cover Letters and Networking Messages",
  module: "Module 2: Professional Writing",
  day: 7,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Build a LinkedIn profile that recruiters find and trust, create a simple personal brand around your skills, write short cover letters that get read, and send networking and referral messages that people actually reply to.",
  objectives: [
    "Optimise LinkedIn headline, About, Experience, Projects and Skills sections",
    "Understand personal branding and post useful content as a student",
    "Write a short, tailored cover letter for an IT role",
    "Write connection requests, referral requests and follow-ups that get replies",
    "Avoid networking mistakes that annoy professionals",
  ],
  theory: [
    {
      heading: "Why LinkedIn Matters for Freshers",
      content: `LinkedIn is where recruiters search for candidates, where companies post off-campus openings, and where employees give referrals. Many recruiters in India search LinkedIn with keywords like 'Python fresher Pune' or 'Java Spring Boot 2026'. If your profile is incomplete, you will not appear in these searches.\n\nFor freshers, LinkedIn also works as a living portfolio: projects, certificates, posts about what you are learning and recommendations from internship mentors all build trust before the interview.`,
      points: [
        "Recruiters search by keywords, location and skills",
        "Referrals through employees are one of the fastest ways to get interviews",
        "A complete profile with photo gets far more views than an incomplete one",
        "Turn on 'Open to Work' (visible to recruiters only, if you prefer)",
      ],
    },
    {
      heading: "Profile Sections That Matter Most",
      content: `**Photo**: clear headshot, plain background, formal or smart-casual, smiling. **Banner**: simple image related to your field or a clean colour. **Headline**: this appears everywhere; do not leave it as 'Student at XYZ College'. Use role + skills + value: 'Aspiring Java Developer | Spring Boot, MySQL, REST APIs | Final-year B.Tech CSE'.\n\n**About**: 3-4 short paragraphs in first person: who you are, what you build, key skills, what you are looking for. **Experience**: internships with bullet points like your resume. **Projects**: with links. **Skills**: top 5 pinned, matching your target role. **Certifications** and **Recommendations** from mentors or professors.`,
      points: [
        "Headline: Target role | 3 skills | Status",
        "Custom URL: linkedin.com/in/firstname-lastname",
        "About: first person, specific, ends with what you are looking for",
        "Featured section: GitHub, portfolio, best project demo",
        "Skills: pin the 3 most relevant to your target role",
      ],
      tip: "Write the About section with keywords naturally included, because LinkedIn search reads it.",
    },
    {
      heading: "Personal Branding for Students",
      content: `Personal branding simply means: what people think of when they hear your name. For a student, it could be 'the person who explains SQL well' or 'the one who builds cool React projects'. You build it by consistently sharing useful work in one area.\n\nYou do not need to be an influencer. Post once every week or two: a project you completed, a concept you learned explained simply, a hackathon experience, or a certification with what you learned. Comment thoughtfully on posts from professionals in your field. Consistency matters more than viral posts.`,
      points: [
        "Choose 1-2 focus areas (e.g. Python + Data)",
        "Post learnings, projects, mistakes and fixes",
        "Use simple formatting: short lines, a hook, a lesson, a question",
        "Engage with comments; build relationships, not likes",
        "Keep everything professional; avoid political arguments",
      ],
      tip: "A post like 'I built X, here is what broke and how I fixed it' gets more respect than 'Happy to share I got a certificate'.",
    },
    {
      heading: "Cover Letters That Get Read",
      content: `Many Indian job portals and company sites ask for a cover letter or a 'Why should we hire you?' note. Most freshers paste a generic one-page letter. Recruiters prefer a short, specific note of 150-250 words.\n\nStructure: **Opening** (role you are applying for and one-line hook), **Why you** (2-3 relevant skills with proof), **Why them** (something specific about the company or role), **Closing** (availability and thanks). Mention the company name correctly; sending 'Dear TCS team' to Infosys is an instant rejection.`,
      points: [
        "150-250 words; 3-4 short paragraphs",
        "Specific to the company and role",
        "Proof, not adjectives: projects and numbers",
        "No repeating the whole resume",
        "Proofread names and role titles",
      ],
    },
    {
      heading: "Networking and Referral Messages",
      content: `Networking means building genuine professional relationships. LinkedIn connection notes have a short character limit, so be brief: who you are, why you are connecting. Never send just 'Hi' or 'Please give me a job'.\n\nFor referrals, first connect, then send a polite message with the specific job ID, a 2-line summary of your fit and your resume link. Make it easy for the person: they are busy and are doing you a favour. Thank them whether or not they refer you.`,
      points: [
        "Personalise: mention the common college, a post they wrote, or the team",
        "Be specific: job ID, role, location",
        "Make it easy: attach resume, give 2-line fit summary",
        "Follow up once after 5-7 days, then stop",
        "Always thank them",
      ],
      tip: "Alumni from your college are the most likely to reply. Use LinkedIn's Alumni tab on your college page.",
    },
    {
      heading: "Mistakes to Avoid",
      content: `Common LinkedIn mistakes: selfie or group photo as profile picture, headline 'Student', copying someone else's About section, adding skills you do not have, sending mass identical messages, messaging recruiters with 'Sir please job', and posting unprofessional content. Also avoid tagging 50 people in a certificate post.\n\nRemember that interviewers often check your LinkedIn before or during the interview. Make sure your profile matches your resume: same dates, same project names.`,
      points: [
        "Profile and resume must be consistent",
        "No 'Sir please job' messages",
        "No spam tagging",
        "Keep posts professional and positive",
      ],
    },
  ],
  examples: [
    {
      title: "LinkedIn Headline: Weak vs Strong",
      scenario: "A final-year B.Tech student wants to be found for Python and data roles.",
      steps: [
        "Include target role",
        "Add 3 key skills recruiters search for",
        "Add status or one proof point",
      ],
      code: `WEAK:
"Student at ABC Institute of Technology"

STRONG:
"Aspiring Data Analyst | Python, SQL, Power BI | Built 3 dashboards on real
retail data | B.Tech IT 2026"`,
      result: "The profile appears in recruiter searches for 'Data Analyst', 'Python', 'SQL' and 'Power BI'.",
      explanation: "The headline is indexed by LinkedIn search and is shown next to every comment and message, so it must carry keywords.",
    },
    {
      title: "LinkedIn About Section",
      scenario: "Writing a first-person About section for a Java fresher.",
      steps: [
        "Line 1: hook with who you are",
        "Paragraph 2: what you have built",
        "Paragraph 3: skills list",
        "Last line: what you are looking for and how to contact",
      ],
      code: `I am a final-year Computer Engineering student who enjoys building backend
systems that are simple, fast and secure.

Over the last two years I have built 3 projects with Java and Spring Boot,
including a library management system with REST APIs and JWT login, and a
bus-pass booking app used by 300+ students in my college. During my internship
at a Pune startup, I wrote APIs for their inventory module.

Skills: Core Java, Spring Boot, Hibernate/JPA, MySQL, REST APIs, Git, Postman,
basic Docker.

I am looking for Java Developer / Backend Engineer fresher roles from 2026.
Feel free to connect or email me at kunal.deshmukh@gmail.com.`,
      result: "Recruiters understand the profile in 20 seconds and have a clear way to contact.",
      explanation: "It is specific, uses keywords naturally and ends with a call to action.",
    },
    {
      title: "Short Cover Letter for an Off-Campus Role",
      scenario: "Applying for 'Associate Software Engineer' at a mid-size product company in Hyderabad.",
      steps: [
        "Mention role and source",
        "Give 2-3 proofs of fit",
        "Say why this company",
        "Close politely",
      ],
      code: `Dear Hiring Team,

I am applying for the Associate Software Engineer role (Job ID ASE-1192)
posted on your careers page. I am a 2026 B.Tech CSE graduate from JNTU
Hyderabad with hands-on experience in Python, Django and PostgreSQL.

In my final-year project, I built a clinic appointment system with SMS
reminders that a local clinic now uses for around 40 bookings a day. During my
internship at DataNest, I automated a weekly report with Python, saving the
team 3 hours every week.

I am excited about your company's work on healthcare scheduling software,
because it is close to the problems I enjoyed solving in my project.

Thank you for considering my application. I am available to join immediately.

Regards,
Srinivas Reddy | +91 90xxxxxx12 | github.com/srinivasr`,
      result: "About 170 words; specific, relevant and easy to read.",
      explanation: "The letter connects the candidate's proof to the company's domain, which a generic letter cannot do.",
    },
    {
      title: "Referral Request: Bad vs Good",
      scenario: "Asking a college senior working at Accenture for a referral.",
      steps: [
        "Send a connection request with a short note",
        "After they accept, send a specific referral request",
        "Follow up once if needed, then thank them",
      ],
      code: `BAD:
"Hi sir. Please refer me in your company. I need job urgently."

GOOD (connection note):
"Hi Rohan, I am a 2026 CSE student from VIT Pune (your college). I enjoyed
your post on learning Spring Boot. Would love to connect."

GOOD (after accepting):
"Hi Rohan, thanks for connecting! I noticed an opening for Associate
Software Engineer at Accenture (Job ID R00123456, Pune).
I know Java, Spring Boot and MySQL, and built a library REST API project
(github.com/neha/library-api). If you feel my profile fits, would you be
comfortable referring me? Resume: [link]. Thank you for your time either way!"`,
      result: "The senior can refer in 2 minutes because all details are ready.",
      explanation: "The good message builds a connection first, shows proof, gives the exact job ID and makes saying yes easy.",
    },
  ],
  interview: [
    { q: "I checked your LinkedIn. Why does it say 'Aspiring Data Analyst' while you applied for a Java role?", a: `That is a fair observation. I have worked on both data and Java projects, and earlier I was leaning towards data roles. Over the last six months, I have focused more on backend development with Java and Spring Boot, as you can see in my recent projects. I will update my headline to reflect that. I am genuinely interested in this Java role.`, level: "Hard" },
    { q: "How do you keep yourself updated with technology?", a: `I follow a few engineers and company tech blogs on LinkedIn and Medium, like the Swiggy and Flipkart engineering blogs. I also watch conference talks on YouTube and complete small projects with anything new I learn. I share my learnings on LinkedIn once every two weeks, which forces me to understand topics properly.`, level: "Easy" },
    { q: "What is personal branding and why does it matter?", a: `Personal branding is the reputation and image people associate with your name professionally. It matters because recruiters and hiring managers look you up online. A consistent profile showing your projects and learning builds trust even before the interview and can bring opportunities to you.`, level: "Easy" },
    { q: "Have you ever got any opportunity through networking?", a: `Yes. I commented on a post by a data engineer at a fintech startup about SQL optimisation and we had a short discussion. Later I messaged him for advice, and he informed me about an internship opening in his team. I applied, cleared the test and did a two-month internship there.`, level: "Medium" },
    { q: "What would you write in a cover letter for this role?", a: `I would keep it short: the role I am applying for, two or three proofs that I fit, like my Spring Boot project and internship, something specific I like about the company, such as your work in payments, and a polite closing. I would not repeat my full resume.`, level: "Medium" },
    { q: "How many connections do you have on LinkedIn and how did you build them?", a: `I have around 600 connections, mostly classmates, alumni, professionals in Java and data roles, and recruiters. I connect with a personal note explaining why, and I engage with their posts. I prefer meaningful connections over a large number.`, level: "Easy" },
    { q: "Is it okay to ask a stranger on LinkedIn for a referral?", a: `It is okay if done respectfully. I would first connect with a personal note, show genuine interest, and then ask with all details ready: job ID, a short summary of my fit and my resume. I accept a 'no' politely. Alumni or people whose content I have engaged with are better to approach than complete strangers.`, level: "Medium" },
    { q: "What do you post on LinkedIn?", a: `I post about projects I complete, concepts I learn (like explaining SQL window functions with an example), and lessons from hackathons. I try to make each post useful to other students. I avoid controversial topics and keep it professional.`, level: "Easy" },
    { q: "Your LinkedIn says you interned for 3 months but your resume says 2 months. Why?", a: `Thank you for pointing that out. The internship was officially 2 months, and I continued for an extra 3 weeks part-time to finish a feature, which I included on LinkedIn. I should make it consistent; I will update both to show '2 months full-time + 3 weeks part-time' with the exact dates.`, level: "Hard" },
    { q: "How would you introduce yourself to a senior professional at a tech meetup?", a: `I would greet them, give a short introduction, and connect to something relevant: 'Hi, I am Aman, a final-year CS student working on Python and data projects. I really liked your talk on data pipelines, especially the part about Airflow. Could I ask how you would suggest a fresher learn it?' Then I would listen more than talk and ask to connect on LinkedIn.`, level: "Medium" },
  ],
  practice: [
    {
      task: "Write three LinkedIn headlines for yourself: one for a developer role, one for a data role, one for a testing role.",
      hint: "Format: Target role | 3 skills | proof or status. Stay under 220 characters.",
      solution: `Developer: "Aspiring Backend Developer | Java, Spring Boot, MySQL | Built REST
APIs for 2 live college apps | B.Tech CSE 2026"

Data: "Aspiring Data Analyst | SQL, Python, Power BI | Analysed 50K+ rows of
retail sales data | B.Tech IT 2026"

Testing: "QA Engineer (Fresher) | Manual Testing, Selenium, Java, JIRA |
Wrote 150+ test cases for e-commerce project | B.Sc CS 2026"`,
    },
    {
      task: "Write your LinkedIn About section in 120-180 words using the 4-part structure.",
      hint: "Hook, what you built, skills, what you are looking for + contact.",
      solution: `I enjoy turning messy data into simple dashboards that help people make
decisions.

I am a final-year B.Tech IT student from Indore. I have built three data
projects, including a Power BI sales dashboard on 10,000 retail orders and a
Python script that cleans hospital appointment data. During my internship at
a logistics startup, I automated their daily delivery report using Python and
Pandas, saving the operations team about an hour each day.

Skills: SQL (MySQL, PostgreSQL), Python (Pandas, NumPy, Matplotlib), Power BI,
Excel (Pivot tables, XLOOKUP), Git.

I am looking for Data Analyst or Business Analyst fresher roles starting
2026. Happy to connect with people working in analytics.
Email: tanvi.jain@gmail.com`,
    },
    {
      task: "Write a cover letter (under 200 words) for a 'Graduate Engineer Trainee' role at an IT services company.",
      hint: "Role + hook, 2 proofs, why the company (training, client variety), closing.",
      solution: `Dear Hiring Manager,

I am applying for the Graduate Engineer Trainee role advertised on Naukri.
I am a 2026 B.E. Electronics graduate from Coimbatore who has moved
fully into software through projects and certifications.

I have built a hostel complaint-tracking web app using Java, Spring Boot and
MySQL, used by 250 students in my hostel. I also cleared the Oracle Java
SE 17 certification and solved over 200 coding problems on HackerRank.

Your company's structured training programme and the chance to work with
global clients across domains is exactly the environment where I want to
start my career.

Thank you for your consideration. I am available to join from June 2026 and
open to relocation anywhere in India.

Regards,
Divya Krishnan | +91 94xxxxxx88 | linkedin.com/in/divya-krishnan`,
    },
    {
      task: "Write a connection note (under 300 characters) and a follow-up referral message to an alumnus working at Infosys.",
      hint: "Personalise using the common college or their post; keep the referral message specific.",
      solution: `Connection note:
"Hi Meera, I am a final-year CSE student from SPPU, same college as you.
Your post on preparing for the Infosys SP role was really helpful. I would be
glad to connect!"

Referral message (after acceptance):
"Thanks for connecting, Meera! I am applying for the Infosys Specialist
Programmer role (Job ID INFSY-SP-2026). I have 400+ LeetCode problems solved,
a Spring Boot project (github.com/aditya/bookhub) and a 2-month internship.
If you think my profile fits, could you please refer me? Resume: [link].
Thanks a lot for your time!"

Follow-up after 6 days (only once):
"Hi Meera, just a gentle follow-up on my earlier message. Totally understand
if you are busy. Thank you!"`,
    },
  ],
  quiz: [
    { question: "Which LinkedIn headline is best for a fresher?", options: ["Student", "Looking for job", "Engineer at Home", "Aspiring Java Developer | Spring Boot, MySQL, REST APIs | B.Tech CSE 2026"], answer: 3, explanation: "It contains a target role and searchable skills." },
    { question: "What is the ideal length of a fresher cover letter?", options: ["20-30 words", "800-1000 words", "150-250 words", "Two full pages"], answer: 2, explanation: "Short and specific letters are more likely to be read." },
    { question: "Before asking someone for a referral, what should you have ready?", options: ["Nothing; just ask", "Job ID, short fit summary and resume link", "Your 10th mark sheet", "A list of all your friends"], answer: 1, explanation: "Making it easy for the referrer increases the chance they will help." },
    { question: "Which is a good personal branding activity for students?", options: ["Sharing what you built and learned regularly", "Posting political arguments", "Tagging 50 people on every certificate", "Copying others' posts"], answer: 0, explanation: "Consistent, useful sharing builds a professional reputation." },
    { question: "Why must your LinkedIn and resume be consistent?", options: ["LinkedIn requires it", "It improves internet speed", "It is not important", "Interviewers compare them, and mismatches reduce trust"], answer: 3, explanation: "Mismatched dates or projects raise credibility questions." },
    { question: "How many times should you follow up on an unanswered referral request?", options: ["Every day", "Never message at all", "Once, after about 5-7 days", "Ten times"], answer: 2, explanation: "One polite follow-up is professional; more becomes spam." },
  ],
};
