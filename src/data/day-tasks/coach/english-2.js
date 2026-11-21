// Interview Coach: English mistakes test 2 (medium).
// v(): each correct sentence with or without the final mark, commas and with straight or curly apostrophes.
const v = (...xs) => [...new Set(xs.flatMap((x) => {
  const end = (x.match(/[.?!]$/) || ['.'])[0];
  const base = x.replace(/[.?!]$/, '');
  return [base, base + end, base.replace(/,/g, ''), base.replace(/,/g, '') + end];
}).flatMap((y) => [y, y.replace(/'/g, '’')]))];

export default {
  lesson: 'english-2',
  minutes: 18,
  intro: 'Medium level: tenses with since/for, indirect questions, Indianisms, redundancy, uncountable nouns and a professional email rewrite.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You joined your company in 2023 and still work there. Choose the **correct** sentence.',
      options: ['I am working here since 2023.', 'I have been working here since 2023.', 'I am working here from 2023.', 'I have been working here for 2023.'],
      answer: 1,
      explain: 'For an action that started in the past and is still going on, use the **present perfect continuous**: "I have been working". Use **since** with a starting point (2023) and **for** with a length of time (two years).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Choose the **correct** sentence.',
      options: ['Can you tell me where is the HR office?', 'Can you tell me where the HR office is?', 'Can you tell me where HR office is?', 'Can you tell me where is HR office?'],
      answer: 1,
      explain: 'After "Can you tell me / Do you know", the question becomes **indirect**, so use statement order: "where **the HR office is**". Also keep "the" before "HR office".',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You want a meeting with a client in London to happen earlier. Which line will the client **understand most easily**?',
      options: ['Can we prepone the meeting?', 'Can we bring the meeting forward to 2 pm?', 'Kindly do the needful and prepone it.', 'Can we revert the meeting to 2 pm?'],
      answer: 1,
      explain: '"Prepone" is in Indian English dictionaries but is not used outside South Asia, and "revert" means go back to an earlier state. "**Bring forward**" (or "move it earlier") plus a clear time works for everyone.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Select **all the incorrect** sentences.',
      options: [
        'Please return back the book.',
        'I will reach the office by 10.',
        'She is married with a doctor.',
        'Please send the file by Friday.',
        'Can you repeat it again?',
        'Congratulations on your promotion.',
        'I prefer tea than coffee.',
      ],
      answers: [0, 2, 4, 6],
      explain: '"Return **back**" repeats itself, you are married **to** someone, "repeat **again**" repeats itself (unless it was already repeated once), and the pattern is "prefer A **to** B". The other three are correct.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Select **all the incorrect** sentences (look at the nouns).',
      options: [
        'My mentor gave me many advices.',
        'We received a lot of feedback.',
        'I have installed many softwares.',
        'The lab has new equipment.',
        'One of my friend works at Wipro.',
        'Each student must carry an ID card.',
      ],
      answers: [0, 2, 4],
      explain: '"Advice" and "software" are **uncountable**: a lot of advice, a lot of software (or "many tools"). "One of" needs a **plural** noun: one of my **friends**. Feedback and equipment are also uncountable, so those sentences are already correct.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> Let us discuss about the project.',
      accept: v('Let us discuss the project.', "Let's discuss the project.", 'Let us talk about the project.', "Let's talk about the project."),
      explain: '"Discuss" takes a direct object: discuss **the project**. If you want "about", change the verb: "talk about the project".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> I did not went there.',
      accept: v('I did not go there.', "I didn't go there."),
      explain: '"Did" already shows the past, so the main verb stays in its **base form**: did not **go**. The same rule applies in questions: "Did you go?"',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> She is senior than me.',
      accept: v('She is senior to me.', "She's senior to me."),
      explain: 'Senior, junior, superior and inferior take **to**, not "than": senior **to** me. They already contain the idea of comparison.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> When I will finish the task, I will inform you.',
      accept: v(
        'When I finish the task, I will inform you.', "When I finish the task, I'll inform you.",
        'When I finish the task, I will let you know.', "When I finish the task, I'll let you know.",
        'When I finish the task, I will tell you.', "When I finish the task, I'll tell you.",
      ),
      explain: 'After time words like **when, after, before, as soon as**, English uses the **present** tense for a future action: "When I **finish**". Keep "will" only in the main part: "I will let you know".',
    },
    {
      type: 'written',
      mins: 6,
      q: 'Rewrite this email paragraph to your team lead professionally (3-5 sentences). Keep the facts: the weekly report is attached, and you need her approval by Friday.\n\n> Hi sir, as discussed over call I am attaching herewith the weekly report. Please revert back at the earliest. Kindly do the needful.',
      example: { title: 'clear request with a deadline', text: 'Before: "Please revert at the earliest."\nAfter: "Could you please review it and reply by 4 pm on Thursday?"' },
      minWords: 25,
      maxWords: 120,
      rules: [
        { not: ['revert', 'herewith', 'do the needful', 'at the earliest', 'hi sir'], msg: 'Remove "Hi sir", "herewith", "revert back", "at the earliest" and "do the needful".' },
        { any: ['attached', 'attaching', 'attachment'], msg: 'Say that the weekly report is attached.' },
        { any: ['weekly report', 'report'], msg: 'Name the document: the weekly report.' },
        { any: ['approve', 'approval', 'sign off', 'sign-off'], msg: 'Ask clearly for her approval.' },
        { any: ['friday'], msg: 'Give the deadline: Friday.' },
      ],
      sample: 'Hi Meera,\n\nAs we discussed on the call, I have attached the weekly report. Could you please review it and share your approval by Friday? Let me know if anything needs to change.\n\nThanks,\nSahil',
      explain: 'A good work email names the person, says what is attached, asks for one clear action and gives a real deadline. "Revert back", "herewith", "at the earliest" and "do the needful" are vague or old-fashioned, so the reader has to guess what you want and by when.',
    },
  ],
};
