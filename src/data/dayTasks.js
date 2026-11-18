// Day-wise practice tasks, one file per lesson: ./day-tasks/<track>/<lessonId>.js
// Loaded lazily (only when a student opens the Day Task tab), so they do not grow the main bundle.
const FILES = import.meta.glob('./day-tasks/*/*.js');

export const dayTaskKey = (track, id) => `./day-tasks/${track}/${id}.js`;
export const hasDayTask = (track, id) => !!FILES[dayTaskKey(track, id)];
export async function loadDayTask(track, id) {
  const f = FILES[dayTaskKey(track, id)];
  return f ? (await f()).default : null;
}
export function dayTaskIds(track) {
  return Object.keys(FILES).filter((k) => k.startsWith(`./day-tasks/${track}/`)).map((k) => k.split('/').pop().replace(/\.js$/, ''));
}
export const dayTaskTracks = () => [...new Set(Object.keys(FILES).map((k) => k.split('/')[2]))];
