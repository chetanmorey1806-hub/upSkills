// HR and communication round guide per company, for Indian freshers.
// Keys must match ids in src/pages/PlacementTools.jsx COMPANIES.
// Based on well-known public information. Hiring patterns change every year:
// always confirm with the official careers page and your offer letter.

export const COMPANY_HR = {
  'tcs-nqt': {
    name: 'TCS',
    overview:
      'Tata Consultancy Services is India\'s largest IT services company and part of the Tata Group. Freshers usually join as Ninja, Digital or Prime through the TCS NQT, with Digital and Prime offered to candidates who clear the advanced section and a tougher interview. HR looks for clear communication, willingness to relocate and work in any technology, stable academics and a genuine attitude to learn.',
    process: [
      {
        round: 'TCS NQT (online)',
        what: 'A proctored online test with a Foundation section (numerical, verbal, reasoning) and an Advanced section (advanced quantitative / reasoning and coding). Your score decides whether you are considered for Ninja, Digital or Prime.',
        tips: [
          'Attempt the Advanced section seriously even if you only target Ninja, because it opens Digital / Prime interviews.',
          'Check your laptop, webcam and internet a day before; proctoring violations can cancel the attempt.',
          'There is usually no heavy negative marking, so do not leave questions blank unless the instructions say otherwise.',
        ],
      },
      {
        round: 'Technical Interview (TR)',
        what: 'Questions on your final-year project, one programming language of your choice, OOP, DBMS / SQL, basic OS and networking. Digital / Prime panels may ask you to write code or solve a puzzle.',
        tips: [
          'Pick ONE language you are strongest in and say it clearly at the start.',
          'Be able to explain your project end to end in 2 minutes, including your own contribution.',
          'If you do not know something, say so honestly and explain how you would find out.',
        ],
      },
      {
        round: 'Managerial Round (MR)',
        what: 'Often combined with TR or HR. A senior person checks situational judgement, teamwork, handling pressure and how you think about clients and deadlines.',
        tips: [
          'Use short real examples from college projects, events or internships (situation, action, result).',
          'Show flexibility: shifts, relocation, any technology.',
        ],
      },
      {
        round: 'HR Interview',
        what: 'Introduction, why TCS, strengths / weaknesses, relocation, night shift, service agreement, documents and gap / backlog questions if any.',
        tips: [
          'Keep your answers consistent with your resume and application form.',
          'Read about TCS values and the Tata Group before the interview.',
          'Keep your original documents and photocopies ready, even for virtual interviews.',
        ],
      },
      {
        round: 'Offer, onboarding and ILP',
        what: 'Selected candidates usually receive an offer letter on the NextStep portal, complete background verification and then join the Initial Learning Program (ILP), which may be online or at a TCS training centre.',
        tips: [
          'Keep checking the NextStep portal and your email; joining updates come there.',
          'Clear all backlogs before joining, as the offer is usually conditional on that.',
        ],
      },
    ],
    commTest: null,
    values: [
      'Integrity: do the right thing even when nobody is watching.',
      'Leading change: be open to new technologies and ways of working.',
      'Excellence: aim for quality in every deliverable.',
      'Respect for the individual: teamwork and inclusion.',
      'Learning and sharing: continuous upskilling (for example through internal learning platforms).',
      'Part of the Tata Group, known for ethics and giving back to society through trusts.',
    ],
    hrQuestions: [
      {
        q: 'Tell me about yourself.',
        a: 'Good morning. I am Rohan Patil, a final-year B.E. Computer Engineering student from Pune with around 7.8 CGPA. My strongest language is Java and I am comfortable with SQL. In my final-year project, a hostel complaint management system, I built the backend APIs in Spring Boot with MySQL, which reduced complaint tracking from a paper register to a simple dashboard. Outside academics I was the coordinator of our college coding club, where I organised two hackathons, which taught me planning and handling people. I am now looking to start my career in a company like TCS where I can work on real client projects and keep learning new technologies.',
        avoid: 'Do not repeat your resume line by line, talk about family background at length, or go beyond 2 minutes.',
      },
      {
        q: 'Why do you want to join TCS?',
        a: 'Three reasons. First, TCS works with clients across banking, retail, telecom and many other domains, so as a fresher I get exposure to many kinds of projects. Second, the Initial Learning Program and internal learning platforms mean I will be trained properly before I go on a project, which matters a lot when you are starting out. Third, being part of the Tata Group, TCS is known for ethics and stability, and I want to start my career in a company with strong values. I also see that people grow inside TCS by moving across technologies and roles, which suits me because I want long-term growth, not just a first job.',
        avoid: 'Do not say "because it is the biggest company" or "job security" only, or "my friends are there". Do not mention salary.',
      },
      {
        q: 'Are you willing to relocate to any location in India?',
        a: 'Yes, I am. I understand that project allocation depends on business needs and I see relocation as a chance to work with different teams and become independent. I have already stayed in a hostel for four years, so I am used to managing on my own.',
        avoid: 'Do not say "yes" and then add conditions like "but I prefer only Pune". If you truly cannot relocate, be honest, but know it may affect selection.',
      },
      {
        q: 'Are you comfortable working in night shifts or rotational shifts?',
        a: 'Yes. Many TCS clients are in the US, UK and Europe, so support and some project work naturally follow their time zones. I am comfortable working in shifts when the project needs it, and I will plan my routine and health accordingly.',
        avoid: 'Do not ask "will I get night shift allowance" in the interview, or show reluctance like "only if compulsory".',
      },
      {
        q: 'What do you know about TCS?',
        a: 'TCS is a Tata Group company and India\'s largest IT services firm, with a global presence and a very large employee base. It provides IT services, consulting and business solutions to clients in domains like banking and financial services, retail, manufacturing and life sciences. It also has its own products and platforms, for example TCS BaNCS for banking and iON for assessments and digital learning, which is also the platform used for the NQT. TCS is known for its Tata values and for investing a lot in employee learning.',
        avoid: 'Do not quote exact revenue or headcount numbers unless you are sure; wrong numbers hurt more than no numbers.',
      },
      {
        q: 'What are your strengths?',
        a: 'My main strength is that I learn quickly and in a structured way. For example, I had not used Spring Boot before my final-year project, but within two weeks I built a working REST API by following documentation and small practice projects. My second strength is consistency: I maintained a daily DSA practice for over six months, which improved my problem solving a lot.',
        avoid: 'Do not list five adjectives like "hardworking, honest, punctual" without any example.',
      },
      {
        q: 'What is your weakness?',
        a: 'I used to find it difficult to say no, so I took on too many tasks during college fests and sometimes my own project work got delayed. I have worked on this by keeping a simple to-do list with priorities and telling people honestly when I cannot take on more. It has made me better at planning.',
        avoid: 'Do not say "I am a perfectionist" or "I work too hard". Do not mention a weakness that is core to the job, like "I do not like coding".',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'In five years I see myself as a strong technical professional in TCS, someone the team trusts with critical modules, and ideally leading a small module or mentoring new joiners. I would also like to have gained domain knowledge in an area like banking or retail and a couple of relevant certifications, so that I add value to the client and not just write code.',
        avoid: 'Do not say "I will be doing an MBA", "I will start my own company" or "I want to go abroad".',
      },
      {
        q: 'Do you have any problem signing the service agreement?',
        a: 'No, I do not. I understand the company invests time and money in training freshers through the ILP, so it is fair to expect a commitment. I am looking for a long-term career here, so I am comfortable with the terms mentioned in the offer letter.',
        avoid: 'Do not argue about the agreement or ask how to break it. Read the actual terms in your offer letter before you sign.',
      },
      {
        q: 'Are you ready to work on any technology, even if it is not what you studied?',
        a: 'Yes. In college I learnt that technologies change quickly, and what matters is the fundamentals: programming logic, databases and problem solving. If I am given a technology like mainframe, testing or SAP, I will learn it seriously because every technology that a client pays for is valuable. My final-year project itself used a framework I learnt from scratch.',
        avoid: 'Do not say "I only want to work in Java / development, not testing or support".',
      },
      {
        q: 'Tell me about a time you worked in a team and faced a conflict.',
        a: 'In our final-year project, two team members disagreed on whether to use MongoDB or MySQL. It started delaying our work. I suggested that each of them list the requirements our app actually had. Our data was clearly relational, students, rooms and complaints, so MySQL made more sense, and the person who wanted MongoDB agreed once it was based on facts. We finished the database design in two days after that.',
        avoid: 'Do not blame teammates or say "I just did the whole work myself".',
      },
      {
        q: 'Why should we hire you?',
        a: 'I meet the basic requirement of strong fundamentals in programming and databases, which I have shown in my NQT and technical round. Beyond that, I have actually built and deployed a project, so I understand how code works in a real application. I am flexible about location, shift and technology, and I learn fast. I believe that combination will let me become productive quickly after the ILP.',
        avoid: 'Do not say "because I need this job" or compare yourself with other candidates.',
      },
      {
        q: 'Do you have any backlogs or gaps in your education?',
        a: 'Honest version: Yes, I had one backlog in Engineering Mathematics in the second year, which I cleared in the next attempt. It taught me to plan revision better, and my later semesters show improvement. (If you have a gap: I had a one-year gap after 12th because of a health issue / preparing for an entrance exam. During that time I also learnt basic programming, which is how I developed interest in computers.)',
        avoid: 'Never hide a backlog or gap; background verification will find it. Do not give long emotional stories.',
      },
      {
        q: 'What is your final-year project and what was your role?',
        a: 'My project is a hostel complaint management system. Students raise complaints like electrical or plumbing issues from a web form, wardens assign them to staff, and students can track the status. I was responsible for the backend: designing the MySQL tables and writing the Spring Boot REST APIs for creating, assigning and closing complaints. The hardest part was making sure only the correct roles could change a complaint\'s status, which I solved with role-based checks in the service layer.',
        avoid: 'Do not claim you did everything or describe the project only in buzzwords. Be ready for follow-up questions on every technology you name.',
      },
      {
        q: 'How do you handle pressure or tight deadlines?',
        a: 'I break the work into small tasks and finish the most important ones first. During our project demo week, our login module broke two days before review. I listed what was essential for the demo, fixed login first, and postponed nice-to-have features. We presented on time. I also believe in informing people early if a deadline is at risk, instead of waiting until the last minute.',
        avoid: 'Do not say "I never feel pressure".',
      },
      {
        q: 'What do you know about the Tata Group and its values?',
        a: 'The Tata Group is one of India\'s oldest and most respected business groups, with companies in steel, automobiles, power, hospitality and IT. A large share of the group\'s holding company is owned by charitable trusts, so profits support education, health and social causes. Values like integrity, responsibility and excellence are central to the group, and that is one reason I want to work at TCS.',
        avoid: 'Do not confuse group companies or give wrong facts; keep it simple if unsure.',
      },
      {
        q: 'Do you have any questions for us?',
        a: 'Yes, thank you. Could you tell me what kind of learning or certifications a fresher is encouraged to complete during the first year? And what qualities do you see in freshers who grow quickly in TCS?',
        avoid: 'Do not ask about salary hikes, leaves or work from home first. Do not say "no questions".',
      },
    ],
    documents: [
      '10th and 12th (or diploma) marksheets and certificates',
      'All semester marksheets of graduation and degree / provisional certificate (if available)',
      'Government photo ID such as Aadhaar card and PAN card',
      'Passport (if you have one; may be asked for)',
      'TCS NextStep application / CT reference number and the interview call letter',
      'Gap certificate or affidavit if you have an education gap, as per the instructions',
      'Recent passport-size photographs and an updated resume',
    ],
    policies: [
      'Relocation: you are usually expected to work at any TCS location in India based on project needs.',
      'Shifts: some projects follow client time zones, so rotational or night shifts may apply.',
      'Service agreement: freshers usually sign a service agreement; the exact terms are in your offer letter, so read it carefully.',
      'Training: freshers usually go through the Initial Learning Program (ILP), online or at a training centre, before project allocation.',
      'Joining is usually conditional on clearing all backlogs and passing background verification.',
      'Joining dates can vary; follow updates on the NextStep portal and official email only.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },

  infosys: {
    name: 'Infosys',
    overview:
      'Infosys is a leading Indian IT services and consulting company headquartered in Bengaluru. Freshers usually join as Systems Engineer, with higher roles like Digital Specialist Engineer and Specialist Programmer for candidates who clear harder coding rounds. HR looks for communication, learnability, flexibility and alignment with Infosys values.',
    process: [
      {
        round: 'Online assessment',
        what: 'Usually reasoning, mathematical ability, verbal ability and pseudocode / puzzle sections. For Specialist Programmer and Digital Specialist roles there is a separate, harder coding test (for example through HackWithInfy or InfyTQ-style routes).',
        tips: [
          'Verbal ability in Infosys tests can be tough; practise reading comprehension and sentence correction.',
          'Pseudocode questions test output tracing; practise loops, recursion and bitwise basics.',
          'Read the official instructions for each section; sectional time limits are common.',
        ],
      },
      {
        round: 'Technical + HR interview',
        what: 'Often a single interview covering your project, one programming language, OOP, DBMS / SQL and HR questions. Specialist roles may have a deeper technical round with live coding.',
        tips: [
          'Be strong on OOP concepts with simple real examples.',
          'Expect "write a query" or "write a small program" questions.',
          'Speak clearly; communication is judged throughout.',
        ],
      },
      {
        round: 'Offer and training at Mysuru',
        what: 'Selected candidates usually receive an offer letter and later attend foundation training, traditionally at the Infosys Global Education Centre in Mysuru, which may also be partly online.',
        tips: [
          'The training has assessments; clearing them is usually required to continue, so take it seriously.',
          'Keep your documents ready for verification at joining.',
        ],
      },
    ],
    commTest: null,
    values: [
      'C-LIFE: Client value, Leadership by example, Integrity and transparency, Fairness, Excellence.',
      'Strong focus on learning: the Mysuru training campus is one of the largest corporate training centres.',
      'Founded by N. R. Narayana Murthy and co-founders; known for corporate governance.',
      'Infosys Foundation works on education, healthcare and rural development.',
    ],
    hrQuestions: [
      {
        q: 'Tell me about yourself.',
        a: 'I am Sneha Kulkarni, a final-year B.Tech IT student from Nagpur. My core strength is Python and SQL. In my final-year project I built a student attendance analytics dashboard: attendance data from Excel sheets is cleaned with Pandas, stored in MySQL and shown in a simple Flask web app so faculty can see defaulters weekly. I have also completed an online course on data structures and solved around 200 problems on coding platforms. I enjoy explaining things, which is why I was a peer mentor for juniors in programming labs. I want to start my career at Infosys because of its strong training and the chance to work on real client problems.',
        avoid: 'Do not memorise word by word and sound robotic; do not give unrelated personal details.',
      },
      {
        q: 'Why Infosys?',
        a: 'Infosys is known for the quality of its fresher training. The foundation program in Mysuru is one of the largest corporate training programs in the world, and as a fresher, being trained properly before I join a project is important to me. Infosys also works heavily on digital areas like cloud, data and AI for global clients, so I can grow into those areas. Finally, Infosys has a reputation for governance and values, the C-LIFE values, and I want to work in a company where integrity is taken seriously.',
        avoid: 'Do not say "Mysuru campus looks nice" or "for the brand name" only.',
      },
      {
        q: 'What do you know about Infosys?',
        a: 'Infosys is an Indian multinational IT services and consulting company headquartered in Bengaluru, founded by N. R. Narayana Murthy and six others. It serves clients worldwide in banking, retail, energy, manufacturing and more. Infosys has platforms like Infosys Cobalt for cloud and Infosys Topaz for AI, and it has the Infosys Finacle banking product. It is also known for Infosys Springboard, its free learning platform, and the Infosys Foundation, which supports education and healthcare.',
        avoid: 'Avoid quoting exact numbers you are unsure about, or confusing Infosys with other companies.',
      },
      {
        q: 'Are you willing to relocate?',
        a: 'Yes. Infosys has development centres in many cities, and I understand that I will be placed where the project needs me. I am comfortable moving, and I see it as a chance to work with different teams.',
        avoid: 'Do not put conditions on relocation unless you truly must, and then say it honestly.',
      },
      {
        q: 'The training at Mysuru has strict assessments. How will you handle it?',
        a: 'I will treat the training like the first project of my job. I will keep up with daily topics, practise coding every day and revise before each assessment instead of the night before. In college I managed semester exams along with project work, so I am used to continuous evaluation. If I struggle with a topic, I will ask trainers and batchmates early.',
        avoid: 'Do not say "I will manage somehow" or treat training as a holiday.',
      },
      {
        q: 'What are your strengths?',
        a: 'I am good at breaking a problem into steps. In my analytics project, the raw attendance data had different formats in every class sheet. Instead of fixing them manually, I listed the different formats and wrote one cleaning function for each, which made the process repeatable. My second strength is communication: as a lab peer mentor I learnt to explain the same concept in different ways until the student understood.',
        avoid: 'Do not list qualities without proof.',
      },
      {
        q: 'What is your weakness?',
        a: 'I sometimes spend too long researching the best approach before I start, which slowed me down early in my project. Now I set a time limit: I research for a fixed time, pick the simplest approach that works, and improve it later. This has helped me deliver faster.',
        avoid: 'Do not choose a fake weakness or a deal-breaker like "I cannot work in teams".',
      },
      {
        q: 'Tell me about a time you learnt something new quickly.',
        a: 'For my project I needed to build a web interface, but I only knew Python scripting. I had about ten days. I followed the official Flask tutorial, built a small to-do app first to understand routing and templates, and then applied the same pattern to my dashboard. In ten days we had a working interface for our review.',
        avoid: 'Do not give an example with no clear timeline or outcome.',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'I see myself as a skilled engineer in Infosys who has delivered on real client projects, gained expertise in an area such as data engineering or cloud, and has a couple of certifications. I would like to be the person in my team who juniors come to for help, and to be ready for a technical lead or senior role.',
        avoid: 'Do not say you plan to leave for higher studies or abroad soon.',
      },
      {
        q: 'Would you be okay working in any technology or in testing / support?',
        a: 'Yes. I know that projects need many skills, and testing and support teach you how real systems behave and fail. Strong fundamentals will help me in any technology, and I am confident I can learn whatever the project needs.',
        avoid: 'Do not say "I only want development".',
      },
      {
        q: 'Describe a situation where you showed leadership.',
        a: 'In our department tech fest, the volunteer who was managing the coding event registration dropped out a day before. I took over, created a Google Form, divided work among three volunteers for registration, seating and judging, and made a simple sheet to track scores. The event ran on time with about 120 participants.',
        avoid: 'Do not describe leadership as only "I was the class representative" with no action.',
      },
      {
        q: 'How do you handle criticism?',
        a: 'I try to separate the feedback from my feelings and focus on what can be improved. In my second project review, our guide said our database design had too much duplicate data. Initially I was disappointed, but I read about normalisation, redesigned the tables and the final review went much better. Now I actively ask for feedback early.',
        avoid: 'Do not say "I never get criticised".',
      },
      {
        q: 'What do you understand by integrity at the workplace?',
        a: 'Integrity means being honest even when it is not convenient: reporting your real progress, admitting a mistake early so the team can fix it, not copying code without permission and protecting client data. In IT services, clients trust us with sensitive data, so integrity is not optional. This is also part of Infosys C-LIFE values.',
        avoid: 'Do not give only a dictionary definition.',
      },
      {
        q: 'Why should we hire you?',
        a: 'I have strong basics in Python, SQL and OOP, I have built a working project with real data, and I have a habit of continuous learning. I communicate clearly, which matters with global clients. I am flexible about location and technology. I am confident that with Infosys training I can become productive quickly.',
        avoid: 'Do not sound arrogant or desperate.',
      },
      {
        q: 'Do you have any plans for higher studies?',
        a: 'Not at the moment. I want to gain solid industry experience first. If I study further later, I would prefer part-time certifications or programs that add to my work, and many companies, including Infosys, support continuous learning.',
        avoid: 'Do not say "I have applied for MS abroad" if you want this job; it signals you will leave soon.',
      },
      {
        q: 'Explain your project to a non-technical person.',
        a: 'Teachers maintain attendance in different Excel sheets, so finding which students are below 75 percent takes a lot of time. My project collects all those sheets, cleans them automatically and shows one page where a teacher can see, for each subject, who is at risk. The teacher can then warn the student early instead of at the end of the semester.',
        avoid: 'Do not use jargon like "ETL pipeline with REST endpoints" for this question.',
      },
      {
        q: 'Do you have any questions for us?',
        a: 'Yes. What does a typical first year look like for a Systems Engineer after training? And are there internal opportunities to move into specialised roles through certifications?',
        avoid: 'Do not ask about salary or leave first.',
      },
    ],
    documents: [
      '10th and 12th (or diploma) marksheets and passing certificates',
      'All semester marksheets and degree / provisional certificate',
      'Aadhaar card, PAN card and other government ID as asked',
      'Passport-size photographs',
      'Offer letter and any registration / candidate ID from the Infosys portal',
      'Education gap declaration if applicable',
      'Medical fitness or other forms if mentioned in the joining kit',
    ],
    policies: [
      'Relocation: you may be posted to any Infosys development centre in India.',
      'Training: freshers usually attend foundation training, traditionally in Mysuru; continuing employment usually depends on clearing training assessments.',
      'Service agreement / bond: if applicable, the terms are stated in your offer letter; read them carefully.',
      'Shifts: some projects may need shift work based on client time zones.',
      'Joining dates can vary by batch; follow only official Infosys emails and the candidate portal.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },

  wipro: {
    name: 'Wipro',
    overview:
      'Wipro is a major Indian IT services and consulting company headquartered in Bengaluru. Freshers usually join as Project Engineer through the Elite National Talent Hunt (NTH), and some programs like WILP let students work while pursuing an M.Tech. HR looks for communication (including written English), flexibility, honesty and alignment with the Spirit of Wipro values.',
    process: [
      {
        round: 'Online assessment',
        what: 'Usually aptitude (quantitative, logical, verbal), a written communication task such as an essay, and coding questions.',
        tips: [
          'The essay is judged on grammar, structure and staying on topic; write a short intro, 2-3 body paragraphs and a conclusion.',
          'Practise easy to medium coding questions in one language.',
          'Manage time per section; sections are usually timed separately.',
        ],
      },
      {
        round: 'Technical interview',
        what: 'Project discussion, programming basics, OOP, DBMS, sometimes a simple coding problem or output question.',
        tips: [
          'Revise every technology mentioned on your resume.',
          'Practise writing small programs on paper or in a plain editor.',
        ],
      },
      {
        round: 'HR interview',
        what: 'Often combined with the technical round. Covers introduction, why Wipro, relocation, shifts, service agreement and general behaviour questions.',
        tips: [
          'Know the Spirit of Wipro values.',
          'Answer bond / relocation questions positively but honestly.',
        ],
      },
    ],
    commTest: {
      name: 'Written communication test (essay)',
      parts: [
        {
          part: 'Essay writing',
          how: 'You get a topic (for example technology, education or social issues) and must write a short essay within a word range and time limit.',
          tip: 'Plan for one minute: 1 intro line, 2-3 points with examples, 1 conclusion. Simple correct English scores better than complex wrong English.',
        },
        {
          part: 'Grammar and clarity',
          how: 'The essay is checked for grammar, spelling, sentence structure and relevance.',
          tip: 'Use short sentences, avoid SMS spellings and re-read once before submitting.',
        },
      ],
    },
    values: [
      'Spirit of Wipro: Be passionate about clients\' success, Be global and responsible, Treat each person with respect, Unyielding integrity in everything we do.',
      'Five Habits often mentioned: being respectful, being responsive, always communicating, demonstrating ownership, building trust.',
      'Known for sustainability and the work of the Azim Premji Foundation in education.',
    ],
    hrQuestions: [
      {
        q: 'Tell me about yourself.',
        a: 'I am Akash Verma from Indore, completing my B.E. in Electronics and Telecommunication with about 7.5 CGPA. Although my branch is ETC, I have built strong programming skills in C++ and Python and solved over 250 problems on coding platforms. My final-year project is a smart energy meter using an ESP32 that sends power usage to a web dashboard, where I wrote both the device code and the Python backend. I was also part of the NSS unit, which taught me to work with diverse people. I am looking to start my career with Wipro as a Project Engineer and grow in software.',
        avoid: 'Do not apologise for your branch; show what you did to build software skills.',
      },
      {
        q: 'Why Wipro?',
        a: 'Wipro works with global clients on cloud, cybersecurity, data and engineering services, so freshers get exposure to a wide range of work. I also value that Wipro clearly states its values in the Spirit of Wipro, especially unyielding integrity, and is known for responsible business and the education work of the Azim Premji Foundation. As a fresher I want a company that trains me well and where values are taken seriously, and Wipro fits that.',
        avoid: 'Do not say "I applied everywhere and Wipro called me".',
      },
      {
        q: 'What do you know about Wipro?',
        a: 'Wipro is an Indian multinational IT, consulting and business process services company headquartered in Bengaluru. It started as a vegetable oil company in 1945 and later moved into IT under Azim Premji. Today it serves clients across banking, healthcare, energy, retail and manufacturing. Its culture is defined by the Spirit of Wipro, and the Azim Premji Foundation is well known for work in school education.',
        avoid: 'Do not invent numbers like headcount or revenue.',
      },
      {
        q: 'Are you ready to sign a service agreement?',
        a: 'Yes. I understand that the company trains freshers and invests in them, so a commitment is reasonable. I intend to build a long-term career, so I am comfortable with the terms in the offer letter. I will read them carefully before signing.',
        avoid: 'Do not ask how to exit the bond or show unwillingness.',
      },
      {
        q: 'Are you willing to relocate and work in shifts?',
        a: 'Yes. I understand projects are allocated by business need and many clients are in other time zones. I am flexible with both location and shifts.',
        avoid: 'Do not say yes and then ask for a specific city.',
      },
      {
        q: 'You are from a non-CS branch. Why IT?',
        a: 'During my second year, I wrote a small Python script to plot readings from a sensor experiment, and I enjoyed it much more than the hardware itself. After that I learnt C++ and DSA seriously and built software parts in all my projects. My electronics background actually helps me understand systems, IoT and embedded work, which many IT clients need.',
        avoid: 'Do not say "because IT pays more" or "core jobs are not available".',
      },
      {
        q: 'What are your strengths and weaknesses?',
        a: 'My strength is persistence. In my energy meter project the ESP32 kept disconnecting from Wi-Fi, and I spent three days testing until I found that a blocking delay in my loop was causing it; replacing it with a non-blocking timer fixed it. My weakness is that I used to hesitate to speak in large groups. I joined the college debate circle to practise and I am much more comfortable now, though I am still working on it.',
        avoid: 'Do not choose clichés.',
      },
      {
        q: 'Tell me about a mistake you made and what you learnt.',
        a: 'In my third-year mini project I did not use Git, and one day I overwrote a working file with a broken version just before review. We lost half a day rebuilding it. Since then I use Git for every project and commit after every working step. It was a small mistake but it changed how I work.',
        avoid: 'Do not say "I have never made a mistake".',
      },
      {
        q: 'How do you keep yourself updated with technology?',
        a: 'I follow official documentation and engineering blogs, I do one small practice project whenever I learn something new, and I regularly solve coding problems. Recently I learnt basic Docker by containerising my Flask backend.',
        avoid: 'Do not say only "I watch YouTube".',
      },
      {
        q: 'What does integrity mean to you?',
        a: 'Integrity means doing the right thing consistently: giving honest status updates, admitting mistakes, not taking credit for others\' work and protecting confidential information. In my project report I clearly credited the open-source library we used instead of presenting it as our own code. Unyielding integrity is also one of the Spirit of Wipro values.',
        avoid: 'Do not give an abstract answer without any example.',
      },
      {
        q: 'Describe a time you worked under pressure.',
        a: 'Two days before our project expo, our display module stopped working. I divided the problem: my teammate checked wiring while I checked code. We found a loose connection and a wrong pin number. We fixed both and also prepared a backup demo using the web dashboard alone. The expo went well.',
        avoid: 'Do not exaggerate the story.',
      },
      {
        q: 'How would you handle a disagreement with your manager?',
        a: 'I would first make sure I fully understand the manager\'s reasoning. If I still think there is a better approach, I would share it privately with facts, for example time or risk. If the manager still decides otherwise, I would follow the decision fully and give my best, because the manager may have context I do not have.',
        avoid: 'Do not say "I will escalate to HR" or "I will do it my way".',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'I want to be a trusted engineer in my project, with expertise in an area like cloud or IoT platforms, a few certifications and the ability to lead a module. If programs like WILP are available, I would also like to continue learning formally while working.',
        avoid: 'Do not say you plan to leave for a startup or abroad.',
      },
      {
        q: 'Why should we hire you?',
        a: 'I have a strong programming base despite being from a non-CS branch, which shows I can learn on my own. I have built an end-to-end project involving hardware, backend and dashboard. I am flexible with location, shifts and technology, and I communicate clearly. I believe I can become productive quickly.',
        avoid: 'Do not say "I am the best candidate".',
      },
      {
        q: 'What motivates you?',
        a: 'Seeing something I built actually being used. When our department lab assistant started using our energy dashboard to check usage, it felt more rewarding than the marks. In a job, solving a real client problem gives me the same motivation.',
        avoid: 'Do not say "only money".',
      },
      {
        q: 'Do you have any questions for us?',
        a: 'Yes. What does the training plan look like for Project Engineers before project allocation? And what skills should I start learning now to be ready on day one?',
        avoid: 'Do not ask about salary first.',
      },
    ],
    documents: [
      '10th, 12th / diploma and all semester marksheets',
      'Degree or provisional certificate (if issued)',
      'Aadhaar card, PAN card and other photo ID',
      'Passport-size photographs and updated resume',
      'Offer letter / registration ID from the Wipro portal',
      'Gap declaration and backlog clearance proof if applicable',
    ],
    policies: [
      'Service agreement: freshers usually sign one; the exact terms and amount are in the offer letter, so check it carefully.',
      'Relocation: you may be posted anywhere in India based on project needs.',
      'Shifts: rotational shifts may apply for some projects.',
      'Training: there is usually a fresher training period before project allocation.',
      'WILP and similar work-integrated programs, if offered, usually have their own separate terms; read them before choosing.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },

  accenture: {
    name: 'Accenture',
    overview:
      'Accenture is a global professional services company with a large delivery presence in India. Freshers usually join as Associate Software Engineer (ASE) or in higher roles such as Advanced ASE after an additional coding round. HR looks for spoken English, confidence, adaptability and comfort working with global clients.',
    process: [
      {
        round: 'Cognitive and technical assessment',
        what: 'Usually English ability, critical reasoning and problem solving, abstract reasoning, and technical topics like common applications, MS Office, pseudocode, networking and cloud basics.',
        tips: [
          'Read the official instructions; many sections are elimination rounds.',
          'Practise MS Office and basic cloud / networking questions, which surprise many students.',
        ],
      },
      {
        round: 'Coding assessment',
        what: 'Usually two coding questions in a language of your choice, judged on test cases.',
        tips: [
          'Practise array, string and simple math problems.',
          'Handle edge cases: empty input, single element, large values.',
        ],
      },
      {
        round: 'Communication assessment',
        what: 'An automated spoken English test (similar in style to Versant) checking pronunciation, fluency, grammar and listening.',
        tips: [
          'Use a quiet room and a good headset.',
          'Speak at a natural pace; do not rush or go silent.',
        ],
      },
      {
        round: 'Interview (technical + HR)',
        what: 'Usually a single virtual interview with project questions, basic technical concepts and HR questions.',
        tips: [
          'Be confident and clear; communication is weighted heavily.',
          'Know Accenture\'s core values and the fact that it is a professional services company.',
        ],
      },
    ],
    commTest: {
      name: 'Communication assessment (automated spoken English)',
      parts: [
        {
          part: 'Reading aloud',
          how: 'Read sentences shown on screen clearly.',
          tip: 'Read the sentence once in your head first, then speak at a steady pace.',
        },
        {
          part: 'Repeat sentences',
          how: 'Listen to a sentence and repeat it exactly.',
          tip: 'Focus on meaning chunks; if you miss a word, keep the flow rather than stopping.',
        },
        {
          part: 'Sentence builds / jumbled phrases',
          how: 'Rearrange short phrases you hear into a correct sentence and say it.',
          tip: 'Listen for the subject and verb first; build around them.',
        },
        {
          part: 'Conversations / short answers',
          how: 'Listen to a short conversation and answer a question about it.',
          tip: 'Answer briefly; one or two words are often enough.',
        },
        {
          part: 'Passage reconstruction / retelling',
          how: 'Listen to or read a short passage and retell it in your own words.',
          tip: 'Keep the main points in order; simple grammar is fine.',
        },
        {
          part: 'Open questions',
          how: 'Speak for a short time on a simple personal or opinion question.',
          tip: 'Use a simple structure: opinion, one reason, one example, a closing line.',
        },
      ],
    },
    values: [
      'Core values: Client value creation, One global network, Respect for the individual, Best people, Integrity, Stewardship.',
      'Strong focus on inclusion and diversity.',
      'Large investment in training and reskilling, including AI and cloud.',
      'Purpose often stated as delivering on the promise of technology and human ingenuity.',
    ],
    hrQuestions: [
      {
        q: 'Introduce yourself.',
        a: 'Hello, I am Priya Nair, a final-year B.Sc. Computer Science student from Kochi. I am comfortable in Java and JavaScript and recently built a full-stack event booking website using React and Node.js with MongoDB, which my college club now uses for workshop registrations. I also completed a cloud fundamentals certification to understand how applications are deployed. I enjoy presenting and have anchored our department events, which helped my communication. I want to start my career with Accenture because I want to work with global clients and new technologies like cloud and AI.',
        avoid: 'Do not read from a script on screen in a virtual interview; it is noticeable.',
      },
      {
        q: 'Why Accenture?',
        a: 'Accenture is not just an IT company but a professional services company that combines technology, consulting and operations. That means even as an engineer I will see how technology solves actual business problems. Accenture also invests heavily in learning, especially in cloud and AI, and works with many large global clients. I also connect with its focus on inclusion and respect for the individual, which I think creates a good place for freshers to grow.',
        avoid: 'Do not describe Accenture as an Indian IT company; it is a global company with large Indian operations.',
      },
      {
        q: 'What do you know about Accenture?',
        a: 'Accenture is a global professional services company providing strategy and consulting, technology, operations and other services. It has one of its largest workforces in India, with delivery centres in cities like Bengaluru, Hyderabad, Pune, Chennai, Mumbai and Gurugram. Its core values include client value creation, one global network, respect for the individual, best people, integrity and stewardship.',
        avoid: 'Do not quote exact employee numbers you are unsure about.',
      },
      {
        q: 'Are you comfortable working in any technology, location and shift?',
        a: 'Yes. Accenture works on many platforms like Java, .NET, SAP, Salesforce, cloud and testing. I am open to any of them because strong fundamentals transfer. I am also comfortable relocating and working in shifts if the client needs it.',
        avoid: 'Do not say "only development in Java".',
      },
      {
        q: 'What is your greatest strength?',
        a: 'Adaptability. In my event booking project, our team planned to use plain HTML and PHP, but the club wanted features like live seat counts. I learnt React in about two weeks and moved the frontend to it. Being able to switch tools based on the requirement is something I think will help me in a company that works on many technologies.',
        avoid: 'Do not give a strength without an example.',
      },
      {
        q: 'What is your weakness?',
        a: 'I tend to underestimate how long testing takes, so early on my project deadlines slipped. Now I keep around 30 percent of the time for testing and fixing, and I write test cases while coding instead of at the end.',
        avoid: 'Avoid fake weaknesses.',
      },
      {
        q: 'Tell me about a time you worked with people from different backgrounds.',
        a: 'In a national hackathon, my team had members from three states with different languages and working styles. We decided to communicate only in English on a shared chat, split tasks by strengths and had short stand-ups twice a day. We submitted on time and learnt a lot from each other. I think this is similar to working in Accenture\'s global teams.',
        avoid: 'Do not say anything that sounds biased about any group.',
      },
      {
        q: 'How do you handle a situation where you do not know the answer to a client question?',
        a: 'I would not guess. I would say that I want to confirm and get back with the correct answer by a specific time, then check with documentation or my lead and reply on time. A wrong answer to a client can cause bigger problems than a short delay.',
        avoid: 'Do not say "I will manage" or "I will make something up".',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'I see myself as a skilled engineer with expertise in cloud application development, holding a couple of cloud certifications, and taking more responsibility such as leading a small module or interacting directly with clients. I would like to grow within Accenture through internal learning programs.',
        avoid: 'Do not mention leaving for an MBA or abroad.',
      },
      {
        q: 'Explain your project in simple terms.',
        a: 'Our college club used to manage workshop registrations through forms and Excel, and seats often got over-booked. I built a website where students log in, see upcoming workshops with available seats and book a seat. When a seat is booked, the count updates for everyone, and the organiser can download the attendee list. Over-booking stopped completely.',
        avoid: 'Do not start with the tech stack; start with the problem.',
      },
      {
        q: 'What do you understand by teamwork?',
        a: 'Teamwork means a shared goal where everyone knows their role, communicates openly and helps others when needed. In my project, when my teammate was stuck on the database, I paired with her for an hour even though it was not my module, because the whole project depended on it.',
        avoid: 'Do not define it like a textbook.',
      },
      {
        q: 'How do you stay updated with new technology?',
        a: 'I follow official cloud and framework blogs, try new features in small projects and complete short certifications. Recently I tried building a small chatbot using an LLM API to understand how generative AI is used in applications.',
        avoid: 'Do not claim expertise in AI just because you used ChatGPT.',
      },
      {
        q: 'Why should we hire you?',
        a: 'I have strong basics, a working full-stack project that real users use, a cloud certification and good communication. I adapt quickly to new tools, which is important in a company that works across many technologies. I am flexible about location and shift.',
        avoid: 'Do not repeat your introduction word for word.',
      },
      {
        q: 'Are you okay with a service agreement or joining delays?',
        a: 'Yes, I will follow whatever terms are in my offer letter. I understand joining dates depend on business needs, and I will use any waiting period to learn relevant skills and complete pre-joining learning if provided.',
        avoid: 'Do not complain about delays or ask HR to guarantee a date.',
      },
      {
        q: 'Tell me about a time you failed.',
        a: 'In my first hackathon, my team did not get shortlisted because we built too many features and none worked well. I learnt to focus on one core feature and make it work perfectly. In the next hackathon, we built a single solid feature and reached the finals.',
        avoid: 'Do not choose a failure that shows a serious integrity issue.',
      },
      {
        q: 'Do you have any questions for me?',
        a: 'Yes. What skills do you see in Associate Software Engineers who grow fastest in their first year? And is there pre-joining learning I can start on?',
        avoid: 'Do not ask about salary or hike first.',
      },
    ],
    documents: [
      '10th, 12th / diploma and all semester marksheets',
      'Degree or provisional certificate',
      'Aadhaar, PAN and other photo ID',
      'Passport (often requested; apply early if you do not have one)',
      'Passport-size photographs and updated resume',
      'Offer letter and candidate ID from the Accenture portal',
      'Gap declaration if applicable',
    ],
    policies: [
      'Relocation: you may be placed in any Accenture India delivery centre.',
      'Shifts: some projects may need shift work; check during allocation.',
      'Training: freshers usually go through technology training before project allocation, sometimes with assessments.',
      'Service agreement: if applicable, the terms are in your offer letter.',
      'Joining dates can vary; follow only official Accenture emails and the candidate portal.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },

  cognizant: {
    name: 'Cognizant',
    overview:
      'Cognizant is a large IT services company with major operations in India, especially in Chennai, Bengaluru, Hyderabad, Pune and Kolkata. Freshers usually join through the GenC program with tracks like GenC, GenC Next, GenC Elevate and GenC Pro, depending on skills shown in tests and interviews. HR looks for communication, willingness to learn and flexibility.',
    process: [
      {
        round: 'Aptitude / skill assessment',
        what: 'Usually quantitative, logical and verbal sections; some tracks include coding and technical MCQs.',
        tips: [
          'Practise basic aptitude daily; speed matters.',
          'For GenC Next / Pro tracks, practise medium-level coding.',
        ],
      },
      {
        round: 'Technical interview',
        what: 'Project discussion, a programming language, OOP, SQL and some coding for higher tracks.',
        tips: [
          'Be ready to write SQL queries and simple programs.',
          'Know every technology mentioned on your resume.',
        ],
      },
      {
        round: 'HR interview',
        what: 'Introduction, why Cognizant, relocation, shifts, strengths / weaknesses and situational questions. Sometimes combined with the technical round.',
        tips: [
          'Speak confidently and keep answers short and structured.',
        ],
      },
      {
        round: 'Onboarding and training',
        what: 'After joining, freshers usually go through technology training and assessments before being assigned to projects.',
        tips: [
          'Clear the training assessments; continuing employment may depend on them.',
        ],
      },
    ],
    commTest: {
      name: 'Communication evaluation (may be part of some tracks)',
      parts: [
        {
          part: 'Spoken English',
          how: 'You may be asked to read, repeat or speak on simple topics, evaluated for clarity and fluency.',
          tip: 'Speak clearly at a steady pace; avoid long pauses.',
        },
        {
          part: 'Written English',
          how: 'Grammar, comprehension or short writing tasks may appear in the assessment.',
          tip: 'Practise basic grammar and reading comprehension.',
        },
      ],
    },
    values: [
      'Values often mentioned: Start with a point of view, Seek data / build knowledge, Always strive / never settle, Work as one, Create conditions for everyone to thrive, Do the right thing.',
      'Strong presence in healthcare, banking, insurance and life sciences clients.',
      'GenC programs focus on early-career learning.',
    ],
    hrQuestions: [
      {
        q: 'Tell me about yourself.',
        a: 'I am Karthik R from Coimbatore, completing my B.E. in Computer Science with about 8.1 CGPA. I am strongest in Java and SQL. In my final-year project, a hospital appointment system, patients book slots online and doctors manage their schedule; I built the booking logic and database. I also completed an internship of two months where I wrote SQL reports for a small company. I enjoy cricket and was part of our college team, which taught me teamwork. I want to begin my career with Cognizant through the GenC program.',
        avoid: 'Do not exceed 2 minutes.',
      },
      {
        q: 'Why Cognizant?',
        a: 'Cognizant has strong experience with clients in healthcare, banking and insurance, and since my project was a hospital appointment system I am interested in healthcare technology. The GenC program is designed for freshers, with structured training before project work. Cognizant also encourages continuous learning and certification, and I want to grow in such an environment.',
        avoid: 'Do not say "it was the first offer I got".',
      },
      {
        q: 'What do you know about Cognizant?',
        a: 'Cognizant is a global IT services and consulting company headquartered in the US, with a very large share of its workforce in India, in cities like Chennai, Bengaluru, Hyderabad, Pune and Kolkata. It helps clients modernise their technology through application development, cloud, data, AI and digital engineering. It is especially strong in healthcare and life sciences, and also in banking, insurance, retail and manufacturing. Freshers are hired through the GenC program, with tracks like GenC, GenC Next, GenC Elevate and GenC Pro based on skill level.',
        avoid: 'Do not give wrong facts like calling it an Indian-owned company.',
      },
      {
        q: 'Which GenC track are you applying for and why?',
        a: 'I applied for the track mentioned in my application. I am confident in Java and SQL and enjoy coding, so I would like to work on development. Whatever track I am offered, I will treat it as a starting point and work towards higher-skilled roles through internal learning.',
        avoid: 'Do not show disappointment about a lower track.',
      },
      {
        q: 'Are you willing to relocate and work in shifts?',
        a: 'Yes. Cognizant has large centres in Chennai, Bengaluru, Hyderabad, Pune, Kolkata and other cities, and many clients are in the US and Europe. I understand that location and shift depend on the project. I have managed hostel life on my own for four years, so moving to a new city is fine for me, and I will plan my routine around shift timings.',
        avoid: 'Do not set location conditions like "only Chennai because my home is near".',
      },
      {
        q: 'What are your strengths?',
        a: 'I am detail-oriented. During my internship, the weekly sales total in my report did not match the accounts team\'s number. Instead of ignoring the small difference, I traced it and found that a join with the returns table was counting some orders twice. After fixing the query the numbers matched exactly. My second strength is teamwork; playing in the college cricket team taught me to put the team result above my own score.',
        avoid: 'Do not list adjectives without examples.',
      },
      {
        q: 'What is your weakness?',
        a: 'I tend to try to solve everything myself before asking for help. In my project I once spent almost a full day on a Spring Boot configuration issue that a classmate solved in ten minutes. Now I follow a simple rule: if I am stuck for more than an hour after searching properly, I ask someone, and I note the solution so I do not repeat the mistake.',
        avoid: 'Do not choose a deal-breaker like "I do not like working in teams".',
      },
      {
        q: 'Tell me about your internship.',
        a: 'I interned for two months at a small distribution company in Coimbatore. They prepared weekly sales and stock reports manually from their MySQL database, which took the manager about half a day. I wrote SQL queries with joins and GROUP BY to produce the reports, exported them to Excel with a Python script and scheduled it to run every Monday morning. The report now takes a few minutes, and I learnt how a real business uses data.',
        avoid: 'Do not exaggerate the scale or claim work you cannot explain in detail.',
      },
      {
        q: 'How do you handle a difficult team member?',
        a: 'I first talk to them privately to understand the reason. In my project, one teammate kept missing deadlines and others were getting irritated. When I spoke to him, I learnt he was struggling with the backend and was hesitant to say so. We swapped him to the frontend screens, which he was good at, and I paired with him for one session on the APIs. His work improved and the team atmosphere got better.',
        avoid: 'Do not criticise the person or say "I complained to the guide".',
      },
      {
        q: 'Describe a situation where you had to learn something new quickly.',
        a: 'For the hospital appointment project, our guide asked us to use Spring Boot, which none of us knew, and we had about two weeks before the first review. I followed the official getting-started guides, built a small CRUD API for a "doctor" table first, and then applied the same controller-service-repository pattern to the appointment module. We showed a working booking API in the review.',
        avoid: 'Do not be vague about what you learnt and in how much time.',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'I see myself as a senior developer who has delivered on client projects, with domain knowledge in healthcare or banking and a cloud certification. I would like to be the person new GenCs can come to for help, and to be ready to lead a module.',
        avoid: 'Do not mention leaving for higher studies or abroad.',
      },
      {
        q: 'What will you do if you are assigned to a technology you do not like?',
        a: 'I would first learn it properly, because I may not like it only because I do not know it yet. Every technology teaches something useful; for example, working on testing or support teaches how systems fail in real life. Once I have done good work and built trust, I can explore internal opportunities in other areas through the right process.',
        avoid: 'Do not say you will resign or refuse the project.',
      },
      {
        q: 'Why should we hire you?',
        a: 'I have strong fundamentals in Java and SQL, real internship experience where my work saved time for a business, and a final-year project I can explain end to end. I am flexible about location, shifts and technology, I work well in teams, and I learn quickly, as I showed with Spring Boot. I believe I can become productive soon after GenC training.',
        avoid: 'Do not sound desperate or compare yourself with others.',
      },
      {
        q: 'Tell me about a time you showed initiative.',
        a: 'During my internship nobody asked me to automate the weekly reports; I was only asked to prepare them. After doing it manually twice, I noticed the steps were exactly the same each week. I wrote a small script, showed the manager a demo, and with his approval set it to run automatically. It saved him several hours every week.',
        avoid: 'Do not choose an example where you bypassed rules or approvals.',
      },
      {
        q: 'What does "do the right thing" mean to you at work?',
        a: 'It means being honest about my progress, following security and data rules even when a shortcut is easier, and reporting problems early. For example, I would never copy client data to a personal laptop or email to work from home faster. In healthcare projects especially, patient data must be protected.',
        avoid: 'Do not give an abstract answer without an example.',
      },
      {
        q: 'Do you have any questions for us?',
        a: 'Yes, thank you. What does the training period look like for GenCs, and which skills would you suggest I start preparing before joining?',
        avoid: 'Do not ask about salary or hike first.',
      },
    ],
    documents: [
      '10th, 12th / diploma and semester marksheets',
      'Degree or provisional certificate',
      'Aadhaar, PAN and other ID proofs',
      'Passport-size photographs and resume',
      'Offer letter and candidate ID',
      'Gap or backlog clearance documents if applicable',
    ],
    policies: [
      'Relocation: you may be posted to any Cognizant location in India.',
      'Shifts: some projects may require shift work.',
      'Training: GenC freshers usually undergo technology training with assessments.',
      'Service agreement: if applicable, the terms are in your offer letter.',
      'Joining dates can vary; follow only official Cognizant communication.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },

  capgemini: {
    name: 'Capgemini',
    overview:
      'Capgemini is a French multinational IT services and consulting company with one of its largest workforces in India. Freshers usually join as Analyst or Senior Analyst through tests that include pseudocode, English, game-based aptitude and behavioural assessments. HR looks for communication, adaptability and team orientation.',
    process: [
      {
        round: 'Online assessment',
        what: 'Usually pseudocode, English communication, game-based aptitude and a behavioural competency test.',
        tips: [
          'Practise game-based aptitude to get familiar with the format.',
          'Answer the behavioural test honestly and consistently.',
        ],
      },
      {
        round: 'Coding round',
        what: 'Some roles include coding questions.',
        tips: [
          'Practise basic data structures and string problems.',
        ],
      },
      {
        round: 'Interview (technical + HR)',
        what: 'Project, programming basics, SQL and HR questions. Senior Analyst roles may have a tougher technical round.',
        tips: [
          'Explain your project clearly.',
          'Know Capgemini\'s seven values.',
        ],
      },
    ],
    commTest: {
      name: 'English communication test',
      parts: [
        {
          part: 'Grammar and vocabulary',
          how: 'Questions on grammar, synonyms and sentence correction.',
          tip: 'Practise common grammar rules.',
        },
        {
          part: 'Reading comprehension',
          how: 'Read passages and answer questions.',
          tip: 'Read the questions first, then the passage.',
        },
      ],
    },
    values: [
      'Seven values: Honesty, Boldness, Trust, Freedom, Team spirit, Modesty, Fun.',
      'Strong focus on diversity and inclusion.',
      'Global presence with large operations in India.',
    ],
    hrQuestions: [
      {
        q: 'Tell me about yourself.',
        a: 'I am Neha Sharma, completing my B.Tech in Information Technology from Jaipur with around 8.0 CGPA. My strongest skills are Python and SQL. My final-year project is a fake news headline detector: I trained a TF-IDF plus Logistic Regression model on a public dataset, reached around 90 percent accuracy on the test split, and deployed it as a small Flask web app where a user pastes a headline and gets a prediction with a confidence score. I have taken part in two hackathons and reached the finals in one. I also volunteer in our college coding club, teaching Python basics to first-years. I want to start my career at Capgemini in data and application development.',
        avoid: 'Do not exceed 2 minutes or list every certificate you have.',
      },
      {
        q: 'Why Capgemini?',
        a: 'Capgemini works with large global clients on cloud, data and AI, and that is exactly where my interest lies after my ML project. It is a European company with a big presence in India, so I would work in diverse international teams. I also like that Capgemini openly lists seven values, and two of them, freedom and team spirit, matter to me: as a fresher I want a place where I can suggest ideas and where the team succeeds together. Finally, Capgemini gives freshers structured training before projects, which will help me start well.',
        avoid: 'Do not say "for the salary" or "because it is a foreign company".',
      },
      {
        q: 'What do you know about Capgemini?',
        a: 'Capgemini is a French multinational IT services and consulting company headquartered in Paris. India is one of its largest delivery bases, with centres in cities like Mumbai, Bengaluru, Pune, Hyderabad, Chennai and Noida. It works in consulting, technology services, engineering and digital transformation, including cloud, data and AI, for clients in banking, automotive, retail, energy and more. Its seven values are honesty, boldness, trust, freedom, team spirit, modesty and fun.',
        avoid: 'Do not invent numbers or confuse Capgemini with other European firms.',
      },
      {
        q: 'Which of Capgemini\'s seven values do you relate to most?',
        a: 'Team spirit. In our 24-hour hackathon, my role was the ML model, but around midnight our frontend teammate was stuck with a form not sending data to the API. Instead of staying in my lane, I sat with her for 40 minutes, we found a CORS issue together and fixed it. We finished on time and reached the finals. I believe a team result matters more than individual modules, and I would bring the same attitude to Capgemini.',
        avoid: 'Do not list all seven values without an example.',
      },
      {
        q: 'Are you willing to relocate and work in shifts?',
        a: 'Yes. Capgemini has delivery centres across India and many clients in Europe and the US, so I understand both relocation and shifts can be part of the job. I have lived away from home in a hostel for four years, so moving to a new city is not a problem for me, and I will adjust my routine for shift work.',
        avoid: 'Do not say yes and then add a list of conditions.',
      },
      {
        q: 'What are your strengths?',
        a: 'I am curious and I do not stop at the first working solution. In my fake news project, the first Naive Bayes model worked, but I wanted to know if it could be better, so I compared it with Logistic Regression and a Random Forest using the same test split and chose the one with the best F1 score. My second strength is explaining things simply, which I practised while teaching first-years in the coding club.',
        avoid: 'Do not give qualities without an example.',
      },
      {
        q: 'What is your weakness?',
        a: 'I sometimes spend too long polishing small details, like the colours of a dashboard, before the core feature is complete. During one hackathon this cost us time. Now I follow a simple rule: make it work first, then make it look good, and I keep a list of polish items for the end.',
        avoid: 'Do not use "I am a perfectionist" without any real story or improvement.',
      },
      {
        q: 'Explain your project to a non-technical person.',
        a: 'Many people forward news on WhatsApp without checking if it is true. My app lets you paste a headline and tells you if it looks like fake or real news. It works like an experienced reader: it was shown thousands of headlines already marked real or fake, learnt which words and styles usually appear in fake ones, and uses that to make a guess with a confidence percentage. It is not perfect, so it is meant as a warning sign, not a final judge.',
        avoid: 'Do not use terms like TF-IDF or vectoriser for this question.',
      },
      {
        q: 'Tell me about a time you failed.',
        a: 'My first model showed 98 percent accuracy, and I was very happy, but when I tested it with fresh headlines from news sites it was wrong very often. I found that the dataset had a pattern: most fake headlines came from a few sources with a particular style, so the model learnt the source style and not the content. I learnt to check the data and test on truly new examples before trusting a number. I rebuilt the dataset with more varied sources and the real-world results improved.',
        avoid: 'Do not choose a failure you blame on others.',
      },
      {
        q: 'Where do you see yourself in five years?',
        a: 'In five years I want to be a strong data or ML engineer who has delivered real projects for clients, with cloud and data certifications. I would also like to understand one business domain, like banking or retail, deeply enough to suggest solutions, and to be mentoring new analysts in my team.',
        avoid: 'Do not say you will leave for an MS or start your own company.',
      },
      {
        q: 'How do you handle pressure?',
        a: 'I break work into small parts and decide what must be done first. In the hackathon finals, the judges asked us to add a feature within two hours. We listed the minimum version, split it between three people, and kept 20 minutes for testing. We delivered a working version. I also stay calm by focusing on the next step instead of the whole problem.',
        avoid: 'Do not say "I never feel pressure".',
      },
      {
        q: 'Why should we hire you?',
        a: 'I have strong Python and SQL fundamentals, a deployed ML project where I understand every step from data cleaning to deployment, and hackathon experience working under time pressure in teams. I communicate clearly, I am flexible about location, shifts and technology, and I learn on my own. I believe I can contribute quickly after training.',
        avoid: 'Do not sound arrogant or repeat your introduction word for word.',
      },
      {
        q: 'What does honesty mean to you at work?',
        a: 'It means giving accurate status updates, even when the news is bad, admitting mistakes early, and being transparent with clients about what is possible. In my project report, I mentioned the limitation that our model does not work well on regional-language news, instead of hiding it. Honesty is also the first of Capgemini\'s values.',
        avoid: 'Do not give an abstract definition.',
      },
      {
        q: 'Are you okay working in testing or support instead of development?',
        a: 'Yes. Testing and support teach you how systems behave in real use, how they fail and what users actually need. Those skills make you a better developer later. I would put the same effort into any role and look for ways to automate repetitive tasks, for example with test automation scripts.',
        avoid: 'Do not refuse or show disappointment.',
      },
      {
        q: 'Tell me about a time you showed boldness.',
        a: 'In a hackathon, after six hours we realised our idea needed data that was not available. Everyone wanted to continue because of time already spent. I proposed switching to a simpler problem that used a public dataset, explained why, and the team agreed. It was risky, but we finished a working product and reached the finals. Boldness for me is speaking up with reasons, not taking random risks.',
        avoid: 'Do not describe reckless or rule-breaking behaviour.',
      },
      {
        q: 'Do you have any questions for us?',
        a: 'Yes, thank you. What kind of training do Analysts usually go through before project allocation? And are there opportunities to move into data or AI projects through internal certifications?',
        avoid: 'Do not ask about salary, hike or leave first.',
      },
    ],
    documents: [
      '10th, 12th / diploma and semester marksheets',
      'Degree or provisional certificate',
      'Aadhaar, PAN and other ID proofs',
      'Passport-size photographs and resume',
      'Offer letter and candidate ID',
    ],
    policies: [
      'Relocation: you may be posted to any Capgemini location in India.',
      'Shifts: some projects may require shift work.',
      'Training: freshers usually undergo training before project allocation.',
      'Service agreement: if applicable, the terms are in your offer letter.',
      'Joining dates can vary; follow only official Capgemini communication.',
    ],
    lastNote: 'Patterns change; always confirm with the official careers page / your offer letter.',
  },
};
