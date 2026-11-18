import { useEffect, useState, useCallback } from 'react';

const KEY = 'xlpbi-progress-v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event('xlpbi-progress'));
}

// data shape: { done: {key:true}, quiz: {key: bestScore}, practice: {key: [idx...]}, bookmarks: {qid:true} }
export function useProgress() {
  const [data, setData] = useState(read);
  useEffect(() => {
    const h = () => setData(read());
    window.addEventListener('xlpbi-progress', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('xlpbi-progress', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const update = useCallback((fn) => {
    const next = fn(read());
    // count one activity per change for today (powers the dashboard activity chart)
    const day = new Date().toISOString().slice(0, 10);
    next.activity = { ...(next.activity || {}), [day]: ((next.activity || {})[day] || 0) + 1 };
    write(next);
  }, []);

  const toggleDone = (key) =>
    update((d) => ({ ...d, done: { ...(d.done || {}), [key]: !(d.done || {})[key] } }));
  const setQuiz = (key, score) =>
    update((d) => {
      const prev = (d.quiz || {})[key] ?? -1;
      return { ...d, quiz: { ...(d.quiz || {}), [key]: Math.max(prev, score) } };
    });
  const togglePractice = (key, i) =>
    update((d) => {
      const cur = new Set((d.practice || {})[key] || []);
      cur.has(i) ? cur.delete(i) : cur.add(i);
      return { ...d, practice: { ...(d.practice || {}), [key]: [...cur] } };
    });
  const toggleBookmark = (qid) =>
    update((d) => ({ ...d, bookmarks: { ...(d.bookmarks || {}), [qid]: !(d.bookmarks || {})[qid] } }));
  const reset = () => write({});

  return {
    done: data.done || {},
    quiz: data.quiz || {},
    practice: data.practice || {},
    bookmarks: data.bookmarks || {},
    activity: data.activity || {},
    toggleDone,
    setQuiz,
    togglePractice,
    toggleBookmark,
    reset,
  };
}
