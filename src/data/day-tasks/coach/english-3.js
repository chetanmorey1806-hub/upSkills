// Interview Coach: English mistakes test 3 (mixed, harder).
// v(): each correct sentence with or without the final mark, commas and with straight or curly apostrophes.
const v = (...xs) => [...new Set(xs.flatMap((x) => {
  const end = (x.match(/[.?!]$/) || ['.'])[0];
  const base = x.replace(/[.?!]$/, '');
  return [base, base + end, base.replace(/,/g, ''), base.replace(/,/g, '') + end];
}).flatMap((y) => [y, y.replace(/'/g, '’')]))];

export default {
  lesson: 'english-3',
  minutes: 20,
  intro: 'Mixed and harder: question tags, subject questions, agreement, confusable words, international clarity and a full client email rewrite.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Choose the **correct** sentence.',
      options: ['You are from Pune, isn\'t it?', 'You are from Pune, aren\'t you?', 'You are from Pune, no?', 'You are from Pune, isn\'t you?'],
      answer: 1,
      explain: 'A question tag repeats the helping verb and subject of the sentence in the opposite form: "you **are**" becomes "**aren\'t you**". "Isn\'t it" for every sentence and the tag "no?" are common in Indian speech but are not standard.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Choose the **correct** sentence.',
      options: ['One of my friend work at Wipro.', 'One of my friends work at Wipro.', 'One of my friends works at Wipro.', 'One of my friend works at Wipro.'],
      answer: 2,
      explain: '"One of" is followed by a **plural** noun (friends), but the verb agrees with **one**, so it is singular (works). Two rules in one short sentence is why this is often wrong.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'At the end of an interview you want to ask about the notice period. Choose the **correct** sentence.',
      options: ['May I know what is the notice period?', 'May I know what the notice period is?', 'May I know what notice period is it?', 'May I know the notice period is what?'],
      answer: 1,
      explain: '"May I know" turns the question into an **indirect** question, so use statement order: "what the notice period **is**". You could also ask directly: "What is the notice period?"',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Select **all the incorrect** sentences.',
      options: [
        'Less people came to the session.',
        'The news is not good.',
        'The police has arrived.',
        'The data is stored in MySQL.',
        'Our company has 200 staffs.',
        'I have three years of experience.',
        'We have a lot of homework this week.',
      ],
      answers: [0, 2, 4],
      explain: 'Use **fewer** with countable nouns (fewer people). **Police** always takes a plural verb (the police have arrived). **Staff** is a group noun: say "200 staff members" or "200 employees". "The news is" is correct (news is uncountable), and "the data is" is standard in IT.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'You are writing to a client in the USA. Select **all** the phrases that are common in India but are likely to **confuse** the client.',
      options: [
        'I passed out in 2024.',
        'Can we prepone the call?',
        'I will get back to you tomorrow.',
        'I will revert by evening.',
        'Mr. Rao is out of station this week.',
        'Could you send me the file by Friday?',
      ],
      answers: [0, 1, 3, 4],
      explain: 'For an international reader, "passed out" means **fainted**, "prepone" is not a word they use, "revert" means go back to an earlier state, and "out of station" is an old Indian railway and army phrase. Say "graduated", "move the call earlier", "reply" or "get back to you", and "out of town".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this sentence. Type the full corrected sentence.\n\n> I have completed my graduation in 2024.',
      accept: v('I completed my graduation in 2024.', 'I graduated in 2024.'),
      explain: 'A finished time such as "in 2024" needs the **simple past** ("I completed"), not the present perfect ("I have completed"). "I graduated in 2024" is the most natural version.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this question. Type the full corrected question.\n\n> Who did tell you about this job?',
      accept: v('Who told you about this job?'),
      explain: 'When **who** is the subject (the person who did the telling), do not use "did": "Who **told** you?". "Did" is needed only when "who" is the object: "Who **did** you tell?"',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this question. Type the full corrected question.\n\n> Do you know what time is it?',
      accept: v('Do you know what time it is?'),
      explain: 'Inside "Do you know ...", the second part is an **indirect** question, so it uses statement order: "what time **it is**". The direct form is "What time is it?"',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Correct this request. Type the full corrected sentence.\n\n> Can you borrow me your charger?',
      accept: v(
        'Can you lend me your charger?', 'Could you lend me your charger?',
        'Can I borrow your charger?', 'Could I borrow your charger?', 'May I borrow your charger?',
      ),
      explain: 'The owner **lends** (gives for a time); the other person **borrows** (takes for a time). So: "Can you **lend** me your charger?" or "Can I **borrow** your charger?"',
    },
    {
      type: 'written',
      mins: 7,
      q: 'Rewrite this email paragraph to a client professionally (4-6 sentences). Keep the facts: you have one question about the login requirement, you have attached the updated file, and you want to deliver one day earlier if the question is answered by Wednesday.\n\n> Respected sir, I am having one doubt in the login requirement. PFA the updated file for your kind perusal. Kindly revert back at the earliest so that we can prepone the delivery. Waiting for your positive reply.',
      example: { title: 'one sentence, fixed', text: 'Before: "I am having one doubt in the report."\nAfter: "I have one question about the report: should the totals include tax?"' },
      minWords: 35,
      maxWords: 150,
      rules: [
        { not: ['respected sir', 'am having', 'doubt', 'pfa', 'perusal', 'revert', 'prepone', 'positive reply', 'at the earliest'], msg: 'Remove every Indianism and old phrase: "Respected sir", "am having", "doubt", "PFA", "kind perusal", "revert back", "at the earliest", "prepone" and "waiting for your positive reply".' },
        { any: ['dear', 'hello', 'hi '], msg: 'Start with a greeting, such as "Dear Mr. Smith,".' },
        { any: ['question'], msg: 'Say that you have a question (not a "doubt") about the login requirement.' },
        { any: ['login'], msg: 'Mention the login requirement.' },
        { any: ['attached', 'attachment', 'attaching'], msg: 'Say that the updated file is attached.' },
        { any: ['wednesday'], msg: 'Give the clear deadline: Wednesday.' },
        { any: ['earlier', 'a day early', 'one day early', 'ahead of', 'bring forward', 'brought forward', 'move the delivery'], msg: 'Explain that you can deliver earlier (instead of "prepone").' },
      ],
      sample: 'Dear Mr. Smith,\n\nI have one question about the login requirement: should users be able to log in with their mobile number as well as their email? I have attached the updated file for your review. If you can confirm this by Wednesday, we can deliver the module one day earlier than planned. I look forward to hearing from you.\n\nBest regards,\nNeha Kulkarni',
      explain: 'An international client should never have to decode the email. Ask the question itself (not "I have a doubt"), say what is attached, link the deadline (Wednesday) to the benefit (an earlier delivery), and close politely. "Prepone", "revert" and "PFA" are understood in Indian offices but often confuse readers abroad.',
    },
  ],
};
