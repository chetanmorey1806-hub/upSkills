// Aptitude & Reasoning question bank (Quantitative, Logical Reasoning, Verbal Ability).
// Topic files live in ./aptitude/*.js; loaded with a glob so the app builds even while files are added.
const mods = import.meta.glob('./aptitude/*.js', { eager: true });
const ORDER = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
export const APTITUDE = Object.keys(mods).sort().flatMap((k) => mods[k].default || [])
  .filter((t) => t && t.id && Array.isArray(t.questions))
  .sort((a, b) => ORDER.indexOf(a.section) - ORDER.indexOf(b.section));
export const APT_SECTIONS = ORDER;
export const findAptTopic = (id) => APTITUDE.find((t) => t.id === id);
