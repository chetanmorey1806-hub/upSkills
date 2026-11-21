// Interview Coach: English mistakes test 1 (easy).
// v(): each correct sentence with or without the final mark, commas and with straight or curly apostrophes.
const v = (...xs) => [...new Set(xs.flatMap((x) => {
  const end = (x.match(/[.?!]$/) || ['.'])[0];
  const base = x.replace(/[.?!]$/, '');
  return [base, base + end, base.replace(/,/g, ''), base.replace(/,/g, '') + end];
}).flatMap((y) => [y, y.replace(/'/g, '’')]))];

export default {
  lesson: 'english-1',
  minutes: 15,
  intro: 'Spot and fix the most common English mistakes Indian freshers make in interviews: -ing misuse, "Myself", articles, prepositions and simple questions.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Choose the **correct** sentence.',
      options: ['I am having two years of experience.', 'I have two years of experience.', 'I am having two year experience.', 'I have two year of experiences.'],
      answer: 1,
      explain: '"Have" meaning possess is a state, so it does not take -ing: "I **have**", not "I am having". After a number above one the noun is plural (two **years**), and "experience" here is uncountable (no -s).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'The interviewer says "Tell me about yourself." Choose the **correct** opening line.',
      options: ['Myself Priya Deshmukh.', 'Myself is Priya Deshmukh.', 'I am Priya Deshmukh.', 'Me Priya Deshmukh.'],
      answer: 2,
      explain: '"Myself" is reflexive ("I taught myself Excel") and can never be the subject of a sentence. Start with "**I am** Priya" or "**My name is** Priya".',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Choose the **correct** sentence.',
      options: ['He is engineer at Infosys.', 'He is a engineer at Infosys.', 'He is an engineer at Infosys.', 'He is the engineer at the Infosys.'],
      answer: 2,
      explain: 'A singular job noun needs an article, and "engineer" starts with a vowel sound, so "**an** engineer". Company names take no "the". The choice of a/an depends on the **sound**: "an MBA" but "a university".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Select **all the incorrect** sentences.',
      options: [
        'I am good in Excel.',
        'I am interested in this role.',
        'Let us discuss about the project.',
        'I know Java and SQL.',
        'She is a honest person.',
        'I am from Nashik.',
      ],
      answers: [0, 2, 4],
      explain: 'Incorrect: "good **in** Excel" (say good **at**), "discuss **about**" ("discuss" takes no preposition) and "**a** honest" (h is silent, so "an honest"). The other three are correct.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> I am good in Excel.',
      accept: v('I am good at Excel.', "I'm good at Excel."),
      explain: 'The fixed pattern for a skill is "good **at**": good at Excel, good at maths, good at explaining. "Good in" is a common translation of "Excel mein achha".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> Please share the informations.',
      accept: v('Please share the information.'),
      explain: '"Information" is **uncountable**, so it never takes -s. The same is true for advice, feedback, software, equipment and knowledge.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this question. Type the full corrected question.\n\n> What you are doing?',
      accept: v('What are you doing?', "What're you doing?"),
      explain: 'In a direct question the helping verb comes **before** the subject: "What **are you** doing?". Keeping statement order ("you are") is a very common mistake.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> I am going to home.',
      accept: v('I am going home.', "I'm going home."),
      explain: 'After verbs of movement, "home" needs no preposition: go **home**, come home, reach home. Compare "go **to** the office", which does need "to".',
    },
    {
      type: 'written',
      mins: 5,
      q: 'Rewrite this short email to an HR manager professionally (3-5 sentences). Keep the meaning: you are sending your resume for the Data Analyst role.\n\n> Respected sir, PFA my resume for data analyst post. Kindly do the needful. Waiting for your positive reply. Thanking you.',
      example: { title: 'another email, fixed', text: 'Before: "Respected sir, PFA marksheet. Kindly do the needful."\nAfter: "Dear Ms. Joshi, I have attached my marksheet as requested. Please let me know if you need any other document. Best regards, Amit"' },
      minWords: 25,
      maxWords: 120,
      rules: [
        { not: ['pfa', 'do the needful', 'positive reply', 'respected sir', 'thanking you'], msg: 'Remove "Respected sir", "PFA", "do the needful", "waiting for your positive reply" and "Thanking you".' },
        { any: ['dear', 'hello', 'hi '], msg: 'Start with a greeting such as "Dear Ms. Patil," or "Hello,".' },
        { any: ['attached', 'attaching', 'attachment'], msg: 'Say clearly that your resume is attached ("I have attached my resume").' },
        { any: ['data analyst'], msg: 'Name the role: Data Analyst.' },
        { any: ['regards', 'thank you', 'look forward', 'sincerely'], msg: 'Close politely, for example "I look forward to hearing from you." and "Best regards".' },
      ],
      sample: 'Dear Ms. Patil,\n\nI am applying for the Data Analyst role and have attached my resume for your review. Please let me know if you need any further documents. I look forward to hearing from you.\n\nBest regards,\nRohan Pawar',
      explain: '"Respected sir", "PFA", "do the needful" and "Thanking you" are old Indian letter habits. A modern email greets by name, says exactly what is attached and why, and closes with a clear, polite line.',
    },
  ],
};
