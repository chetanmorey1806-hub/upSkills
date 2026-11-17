// Auto-loads every topic file in each folder (sorted by filename).
// Files that are missing a default export (e.g. half-written) are skipped.
const load = (mods) =>
  Object.keys(mods)
    .sort()
    .map((k) => mods[k].default)
    .filter((t) => t && t.id && Array.isArray(t.theory));

const excelDays = load(import.meta.glob('./excel-days/*.js', { eager: true })).sort((a, b) => (a.day || 0) - (b.day || 0));
const excelExtra = load(import.meta.glob('./excel-extra/*.js', { eager: true })).sort((a, b) => (a.extraNo || 0) - (b.extraNo || 0));
const excelGuides = load(import.meta.glob('./excel/*.js', { eager: true }));
const powerbiTopics = load(import.meta.glob('./powerbi/*.js', { eager: true }));

export const tracks = {
  excel: {
    key: 'excel',
    name: 'Excel 60-Day Course',
    short: 'Excel',
    icon: '📗',
    color: 'var(--excel)',
    tagline: '8 modules, 60 days: from Excel basics to formulas, lookups, pivots, dashboards, Power Query and VBA.',
    unit: 'Day',
    topics: excelDays,
  },
  extra: {
    key: 'extra',
    name: 'Excel Extra Skills',
    short: 'Extra Skills',
    icon: '🚀',
    color: '#0e7490',
    tagline: '28 job-oriented skills: shortcuts, Paste Special, dynamic arrays, LET/LAMBDA, M language and Power BI integration.',
    unit: 'Skill',
    topics: excelExtra,
  },
  powerbi: {
    key: 'powerbi',
    name: 'Power BI',
    short: 'Power BI',
    icon: '📊',
    color: 'var(--pbi)',
    tagline: 'Power Query, data modeling, DAX, visuals, Service, RLS and performance.',
    unit: 'Topic',
    topics: powerbiTopics,
  },
  guides: {
    key: 'guides',
    name: 'Excel Topic Guides',
    short: 'Excel Guides',
    icon: '📚',
    color: '#7c3aed',
    tagline: 'Topic-wise deep-dive revision notes (20 topics) for interview preparation.',
    unit: 'Topic',
    topics: excelGuides,
  },
};

export const trackOrder = ['excel', 'extra', 'powerbi', 'guides'];

export const allTopics = trackOrder.flatMap((k) => tracks[k].topics.map((t) => ({ ...t, track: k })));

export const topicKey = (track, id) => `${track}/${id}`;

export function topicLabel(track, t, index) {
  if (t.day && track === 'excel') return `Day ${t.day}`;
  if (t.extraNo) return `Skill ${t.extraNo}`;
  return `${tracks[track]?.unit || 'Topic'} ${index + 1}`;
}

export function findTopic(track, id) {
  const list = tracks[track]?.topics || [];
  const index = list.findIndex((t) => t.id === id);
  return index === -1 ? null : { topic: list[index], index, list };
}
