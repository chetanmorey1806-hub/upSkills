export default {
  id: "day-06-resume-cv-writing-freshers",
  title: "Resume / CV Writing for Freshers: ATS-Friendly Format, Projects and Action Verbs",
  module: "Module 2: Professional Writing",
  day: 6,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Create a one-page, ATS-friendly fresher resume that gets shortlisted: correct section order, strong project descriptions, action verbs with measurable results, keyword matching with the job description, and the mistakes recruiters reject instantly.",
  objectives: [
    "Understand how recruiters and Applicant Tracking Systems (ATS) screen resumes",
    "Use a clean one-page format with the right section order for freshers",
    "Write project and internship bullets using action verb + task + result",
    "Tailor keywords to each job description without lying",
    "Avoid common resume mistakes that cause rejection",
  ],
  theory: [
    {
      heading: "How Resumes Are Screened",
      content: `For a single campus or off-campus opening, companies receive hundreds or thousands of resumes. Most large companies and job portals (Naukri, LinkedIn, company career sites using Workday, Taleo, Greenhouse or Darwinbox) use an **Applicant Tracking System (ATS)**. The ATS reads your resume, extracts text and matches it with keywords from the job description.\n\nAfter that, a recruiter typically spends only 6-10 seconds on the first scan. They look at your name, degree, skills, projects and any internship. If these are not easy to find, your resume is skipped, even if you are talented.`,
      points: [
        "Stage 1: ATS parses and ranks by keyword match",
        "Stage 2: Recruiter scans for 6-10 seconds",
        "Stage 3: Hiring manager reads in detail before the interview",
        "Your resume must pass all three: machine-readable, scannable, detailed",
      ],
    },
    {
      heading: "ATS-Friendly Format",
      content: `ATS software struggles with fancy designs. Use a simple single-column layout, standard fonts (Calibri, Arial, Garamond) in size 10-12, clear section headings, and save as PDF unless the portal asks for Word. Avoid tables for main content, text boxes, images, icons, skill-rating bars, headers and footers containing important information, and multi-column Canva templates.\n\nKeep it to one page for freshers. Use consistent date formats and bullet styles. File name should be professional: 'Priya_Sharma_Resume_Java.pdf'.`,
      points: [
        "Single column, standard fonts, 10-12 pt",
        "Standard headings: Education, Skills, Projects, Experience, Certifications",
        "No photos (unless specifically requested), no graphics, no skill bars",
        "One page for freshers; PDF format",
        "Professional email and LinkedIn/GitHub links",
      ],
      tip: "Test ATS readability: copy all text from your PDF and paste into Notepad. If the order is jumbled, the ATS will also read it jumbled.",
    },
    {
      heading: "Section Order for Freshers",
      content: `For freshers, the order should highlight your strongest proof of skill. A typical order is: **Header** (name, phone, email, LinkedIn, GitHub, city), **Summary** (2-3 lines, optional but useful), **Education**, **Technical Skills**, **Projects**, **Internships/Experience**, **Certifications**, **Achievements**, and optionally **Extracurriculars**.\n\nIf you have a strong internship, place it above projects. Do not include 'Declaration', 'Father's name', 'Date of birth', 'Marital status', or 'Hobbies' unless the company specifically asks. These waste space.`,
      points: [
        "Header: name, phone, professional email, LinkedIn, GitHub/portfolio, city",
        "Summary: role target + top skills + one highlight",
        "Education: degree, college, year, CGPA (if 7+); 12th and 10th briefly",
        "Skills: grouped (Languages, Frameworks, Databases, Tools)",
        "Projects: 2-3 strongest with bullets",
      ],
    },
    {
      heading: "Writing Strong Project and Internship Bullets",
      content: `The biggest difference between an average and a great fresher resume is how projects are described. Weak bullets list responsibilities: 'Worked on front end'. Strong bullets follow **Action Verb + What you did + Technology + Result**.\n\nWhenever possible, add a number: users, time saved, accuracy, records, percentage improvement, team size. Even academic projects can have numbers: 'tested with 500 sample records', 'reduced page load from 4s to 1.5s', 'model accuracy 91%'.`,
      points: [
        "Weak: 'Responsible for database.'",
        "Strong: 'Designed a normalised MySQL schema with 8 tables, reducing duplicate data in student records.'",
        "Include tech stack in brackets or a line under the project title",
        "Add GitHub or live demo link for each project if available",
        "2-4 bullets per project; each bullet one or two lines",
      ],
      tip: "Formula: Verb + Task + Tool + Result. 'Built a REST API in Spring Boot that serves 1,000+ product records with pagination.'",
    },
    {
      heading: "Action Verbs and Keywords",
      content: `Start every bullet with a strong past-tense action verb. Avoid 'Responsible for', 'Worked on', 'Helped in', 'Did'. Useful verbs: Developed, Built, Designed, Implemented, Automated, Optimised, Reduced, Improved, Analysed, Integrated, Deployed, Tested, Led, Collaborated, Presented.\n\nKeywords come from the job description. If a JD for a Python developer mentions 'Django', 'REST APIs', 'PostgreSQL', 'Git' and 'unit testing', and you genuinely know them, make sure those exact words appear in your skills and project bullets. Create small variations of your resume for different roles (Java developer, Data analyst, Testing).`,
      points: [
        "Development: Developed, Built, Implemented, Integrated, Deployed",
        "Improvement: Optimised, Reduced, Improved, Automated, Streamlined",
        "Analysis: Analysed, Visualised, Identified, Evaluated",
        "Leadership: Led, Coordinated, Mentored, Organised",
        "Only include keywords you can answer questions about",
      ],
    },
    {
      heading: "Common Fresher Resume Mistakes",
      content: `Recruiters see the same mistakes again and again. Listing 20 technologies including ones touched once ('C, C++, Java, Python, R, Go, Kotlin, Swift...'). Spelling mistakes ('Pyhton', 'Mangodb'). Copying project descriptions from GitHub templates. Objective statements like 'To work in a challenging environment for the growth of the organisation'. Two to three pages for a fresher. Inconsistent formatting. Wrong or unprofessional email ('cutepriya1999@...').\n\nThe most dangerous mistake is lying: adding skills or projects you cannot explain. Interviewers pick items from your resume and go deep. One weak answer on something you listed damages your credibility for the whole interview.`,
      points: [
        "Typos and wrong capitalisation (javascript vs JavaScript, Mysql vs MySQL)",
        "Generic objective statements",
        "Too many skills with no proof",
        "Missing links to GitHub / LinkedIn",
        "Fake projects or exaggerated roles",
      ],
      tip: "Every line on your resume is a possible interview question. If you cannot speak for 2 minutes on it, remove it.",
    },
  ],
  examples: [
    {
      title: "Weak vs Strong Project Description",
      scenario: "A final-year student describing an e-commerce project.",
      steps: [
        "Identify what the weak version is missing",
        "Rewrite using Verb + Task + Tool + Result",
        "Add tech stack and link",
      ],
      code: `WEAK:
E-commerce Website
- Made an e-commerce website.
- Worked on front end and back end.
- Used many technologies.

STRONG:
ShopEasy - E-commerce Web App | React, Node.js, Express, MongoDB | github.com/ravi/shopeasy
- Built a full-stack shopping app with product search, cart and Razorpay
  test-mode payment for 200+ products.
- Designed REST APIs in Express with JWT authentication and role-based
  access for admin and customers.
- Reduced product page load time from 3.8s to 1.2s using image compression
  and lazy loading.`,
      result: "The recruiter immediately sees full-stack skills, security knowledge and performance awareness.",
      explanation: "Specific verbs, technologies and measurable results give the recruiter and ATS exactly what they look for.",
    },
    {
      title: "Complete One-Page Fresher Resume (Text Layout)",
      scenario: "A B.Tech IT fresher targeting Python/Data roles.",
      steps: [
        "Header with contact links",
        "Short summary targeted to the role",
        "Education, Skills, Projects, Internship, Certifications, Achievements",
      ],
      code: `ANJALI MISHRA
Lucknow | +91 98xxxxxx21 | anjali.mishra@gmail.com
linkedin.com/in/anjalimishra | github.com/anjalim

SUMMARY
Final-year B.Tech IT student skilled in Python, SQL and Power BI, with an
internship in data automation. Seeking a Data Analyst / Python Developer role.

EDUCATION
B.Tech, Information Technology - AKTU, Lucknow      2022-2026 | CGPA 8.3
Class XII (CBSE) - 88%  |  Class X (CBSE) - 91%

TECHNICAL SKILLS
Languages: Python, SQL, Java (basic)
Libraries/Tools: Pandas, NumPy, Matplotlib, Power BI, Excel, Git
Databases: MySQL, PostgreSQL

PROJECTS
Crop Price Predictor | Python, Scikit-learn, Flask
- Trained a Random Forest model on 5 years of mandi price data (45,000 rows),
  achieving 89% accuracy on test data.
- Deployed the model as a Flask web app with a simple form for farmers.

Sales Dashboard | Power BI, MySQL
- Built an interactive dashboard showing region-wise sales, top products and
  monthly trends for a sample retail dataset of 10,000 orders.

INTERNSHIP
Data Intern - FinServe Solutions, Noida (Remote)            Jun-Jul 2025
- Automated a daily Excel report using Python and Pandas, saving the team
  about 1 hour per day.

CERTIFICATIONS
Google Data Analytics (Coursera) | Microsoft PL-300 (in progress)

ACHIEVEMENTS
- Solved 300+ problems on LeetCode and HackerRank (5-star SQL)
- 2nd place, Smart India Hackathon internal round 2024`,
      result: "Clean, single-column, keyword-rich and fits on one page.",
      explanation: "Each section adds proof of skills. There are no wasted lines like declaration or father's name.",
    },
    {
      title: "Tailoring Skills to a Job Description",
      scenario: "JD for 'Java Developer Trainee' asks for: Core Java, OOP, Spring Boot, MySQL, REST APIs, Git, Agile.",
      steps: [
        "Highlight keywords in the JD",
        "Check which you genuinely know",
        "Use the exact same words in skills and bullets",
      ],
      code: `BEFORE (generic):
Skills: Programming, Web development, Databases, Teamwork

AFTER (tailored, honest):
Skills: Core Java, OOP, Spring Boot, REST APIs, MySQL, Git, Postman
Project bullet: "Developed REST APIs using Spring Boot and MySQL for a
library management system; managed code with Git in a 4-member team
following weekly sprints (Agile)."`,
      result: "Higher ATS match score and recruiter can instantly connect resume to the role.",
      explanation: "ATS looks for exact terms. 'Databases' does not match 'MySQL'. Tailoring is matching words, not inventing skills.",
    },
    {
      title: "Fixing a Generic Objective",
      scenario: "Replacing a cliché objective with a targeted summary.",
      steps: [
        "Remove the generic objective",
        "Write: target role + top skills + one proof point",
      ],
      code: `BEFORE:
"Objective: To work in a challenging and dynamic environment where I can
utilise my skills for the growth of the organisation and myself."

AFTER:
"Summary: Computer Engineering graduate (2026) with hands-on experience in
Java, Spring Boot and MySQL through 3 projects and a 2-month internship.
Looking for a backend developer role."`,
      result: "The summary tells the recruiter in 5 seconds what you want and what you offer.",
      explanation: "Generic objectives appear on thousands of resumes and say nothing. A summary is specific and evidence-based.",
    },
  ],
  interview: [
    { q: "Walk me through your resume.", a: `I go section by section in about 90 seconds: my degree and college, my core skills, then my strongest project with my role and result, my internship and what I delivered, and one achievement. I end with what role I am looking for. I do not read the resume; I highlight the key points and connect them to the job.`, level: "Easy" },
    { q: "Which project on your resume are you most proud of and why?", a: `My crop price predictor, because it solved a real problem I saw in my village where farmers sell at low prices without knowing market trends. I handled the data cleaning of 45,000 rows and model training. It taught me that cleaning data takes more time than building the model, and that a simple interface matters for real users.`, level: "Medium" },
    { q: "You have listed Docker in your skills. How have you used it?", a: `I used Docker in my final-year project to containerise our Flask app and MySQL database using a docker-compose file, so every teammate could run the full app with one command. I know how to write a Dockerfile, build and run images, map ports and use volumes. I have not used it in production or with Kubernetes yet.`, level: "Medium" },
    { q: "Why is your CGPA low?", a: `My CGPA is 6.8. In my second year, I focused heavily on learning development outside the syllabus and my grades dropped. I realised I needed better balance, and from fifth semester onwards my SGPA has been above 7.8. Meanwhile, the practical skills I built are visible in my projects and internship. I have learned to manage priorities better.`, level: "Hard" },
    { q: "What is an ATS and how did you make your resume ATS-friendly?", a: `An Applicant Tracking System is software companies use to parse and filter resumes by keywords. I used a single-column layout, standard headings, no tables or images, standard fonts, and I included keywords from the job description that genuinely match my skills. I also checked readability by pasting the PDF text into Notepad.`, level: "Medium" },
    { q: "There is a gap on your resume. Can you explain?", a: `After graduating in 2024, I took one year to prepare for government exams while also learning Python and SQL. When I did not clear the final stage, I decided to fully commit to IT and completed two projects and a certification during that period. I have mentioned these on my resume so the gap shows learning, not inactivity.`, level: "Medium" },
    { q: "Why have you not included hobbies or personal details?", a: `I wanted to keep the resume to one page and focus on information relevant to the job. Personal details like date of birth or father's name are not needed for screening. I am happy to share my interests in the interview; for example, I play chess and teach coding to school kids on weekends.`, level: "Easy" },
    { q: "Your resume says you led a team. What exactly did you do?", a: `I led a team of four in our final-year project. I divided tasks based on each person's strengths, set up a GitHub repository with branch rules, held 15-minute review calls twice a week, and handled our presentations to the guide. When one teammate fell behind on the backend, I paired with him for two evenings to finish it. We submitted a week early.`, level: "Hard" },
    { q: "How many pages should a fresher resume be?", a: `One page. A fresher's relevant information comfortably fits on one page if it is focused. A longer resume usually means unnecessary details. Recruiters scan quickly, so one well-structured page is more effective.`, level: "Easy" },
    { q: "What is the difference between a resume and a CV?", a: `In India, the words are often used interchangeably. Technically, a resume is a short (1-2 page) summary tailored for a job, while a CV (curriculum vitae) is a detailed record of academic history, research and publications, used mainly for academic and research roles or in some countries. For IT jobs, a resume is expected.`, level: "Medium" },
    { q: "If I ask you to remove one skill from your resume, which one would it be and why?", a: `I would remove C++, because I used it only for DSA practice in my first year and I am now much stronger in Java. I would rather the resume reflect what I can confidently discuss in depth.`, level: "Hard" },
  ],
  practice: [
    {
      task: "Rewrite these weak bullets: (1) 'Worked on login page.' (2) 'Responsible for testing.' (3) 'Did data analysis in Excel.'",
      hint: "Use Verb + Task + Tool + Result. Add a realistic number.",
      solution: `(1) Developed a secure login page in React with form validation and JWT-based
    authentication, supporting 3 user roles.
(2) Wrote and executed 120 manual test cases for the checkout module,
    identifying 14 bugs before the release demo.
(3) Analysed 6 months of sales data (8,000 rows) in Excel using pivot tables
    and XLOOKUP, identifying the top 10 products contributing 60% of revenue.`,
    },
    {
      task: "Pick a real job description (from Naukri or LinkedIn) for a fresher role. List 8 keywords and map each to a line on your resume.",
      hint: "Look in 'Requirements' and 'Skills' sections. If you do not have a skill, mark it as a learning gap; do not add it.",
      solution: `Sample JD: Associate Software Engineer (Python)
Keyword -> Resume line
1. Python -> Skills + Crop Predictor project
2. Django -> Clinic Appointment project (Django)
3. REST APIs -> 'Built REST endpoints with Django REST Framework'
4. PostgreSQL -> Skills (added; used in clinic project)
5. Git -> 'Managed code with Git and GitHub pull requests'
6. Unit testing -> 'Wrote 25 unit tests using pytest' (added after doing it)
7. Linux -> Skills: basic Linux commands
8. AWS -> GAP: not known yet; plan to complete AWS Cloud Practitioner`,
    },
    {
      task: "Write a 2-line professional summary for three different target roles: Java Developer, Data Analyst, QA/Test Engineer.",
      hint: "Each summary: degree/year + 3 relevant skills + one proof + target role.",
      solution: `Java Developer: B.Tech CSE (2026) with strong Core Java, Spring Boot and
MySQL skills, demonstrated through a library management REST API project.
Seeking a Java backend developer role.

Data Analyst: B.Tech IT (2026) skilled in SQL, Excel and Power BI, with an
internship automating sales reports. Seeking a Data Analyst role.

QA Engineer: B.Sc CS (2026) with knowledge of manual testing, Selenium WebDriver
and Java, having written 120+ test cases for an e-commerce project.
Seeking a QA / Test Engineer role.`,
    },
    {
      task: "Audit your current resume against this checklist and fix every 'No'.",
      hint: "Be strict. Ask a friend to do the 10-second scan test too.",
      solution: `Checklist:
[ ] One page?
[ ] Single column, no tables/images/skill bars?
[ ] Professional email and LinkedIn/GitHub links?
[ ] Summary instead of generic objective?
[ ] Skills grouped and matching the target JD?
[ ] 2-3 projects with Verb + Task + Tool + Result bullets?
[ ] At least 3 numbers/metrics across the resume?
[ ] No declaration, DOB, father's name, marital status?
[ ] No spelling errors (JavaScript, MySQL, GitHub capitalised correctly)?
[ ] File named Firstname_Lastname_Resume_Role.pdf?
10-second test: friend should identify your target role, top 3 skills and
best project in 10 seconds.`,
    },
  ],
  quiz: [
    { question: "What does ATS stand for?", options: ["Automatic Test System", "Application Transfer Service", "Applicant Tracking System", "Advanced Talent Search"], answer: 2, explanation: "ATS software parses and filters resumes for recruiters." },
    { question: "Which layout is most ATS-friendly?", options: ["Two-column Canva design with icons", "Single-column with standard headings", "Resume as an image", "Table-based layout with skill bars"], answer: 1, explanation: "Single-column, plain layouts are parsed correctly by ATS." },
    { question: "Which project bullet is strongest?", options: ["Built REST APIs in Spring Boot serving 1,000+ product records with pagination.", "Worked on backend.", "Responsible for APIs.", "Did many things in the project."], answer: 0, explanation: "It uses an action verb, technology and a measurable result." },
    { question: "Which item should usually be removed from a fresher's IT resume?", options: ["GitHub link", "Projects", "Technical skills", "Declaration and father's name"], answer: 3, explanation: "These personal details are not needed for screening and waste space." },
    { question: "How should you use keywords from a job description?", options: ["Copy the entire JD into your resume", "Add every keyword even if you do not know it", "Use exact terms for skills you genuinely have", "Ignore the JD"], answer: 2, explanation: "Match honest skills with the exact JD wording for ATS and recruiters." },
    { question: "Ideal resume length for a fresher?", options: ["Two pages", "One page", "Three pages", "As long as possible"], answer: 1, explanation: "A focused one-page resume is the standard for freshers." },
  ],
};
