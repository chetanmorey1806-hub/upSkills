// Java career data (final projects, coding round, soft skills).
// Loaded with a glob so the app still builds if a file is missing.
const mods = import.meta.glob('./java-career/*.js', { eager: true });
const pick = (name, fallback = []) => {
  for (const m of Object.values(mods)) if (m[name]) return m[name];
  return fallback;
};

export const javaProjects = pick('javaProjects');
export const codingProblems = pick('codingProblems');
export const softSkillModules = pick('softSkillModules');
export const hrQuestions = pick('hrQuestions');
export const gdTopics = pick('gdTopics');
export const emailTasks = pick('emailTasks');
export const starQuestions = pick('starQuestions');
export const fillerWords = pick('fillerWords', ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'so', 'literally', 'i mean', 'kind of', 'sort of', 'right']);

// Java courses used by the interview test series (in learning order)
export const JAVA_TRACKS = ['corejava', 'collections', 'advjava', 'hibernate', 'spring', 'springboot', 'javatech'];
