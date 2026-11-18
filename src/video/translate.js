// Translates English lesson narration into Hindi / Marathi for the video lessons.
// 1) Browser built-in on-device Translator API (Chrome / Edge, free, no key, works offline after the model download)
// 2) Claude, with the student's own API key (same key as the AI tools)
// 3) Otherwise the English text is kept.
import { getApiKey, streamClaude } from '../ai/claudeClient.js';

const STORE = 'upskillr-vtr-';
const mem = { hi: null, mr: null };

function load(lang) {
  if (!mem[lang]) {
    try { mem[lang] = new Map(Object.entries(JSON.parse(localStorage.getItem(STORE + lang) || '{}'))); } catch { mem[lang] = new Map(); }
  }
  return mem[lang];
}
let saveTimer = null;
function save(lang) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const m = load(lang);
    // keep the newest ~4000 entries so localStorage does not overflow
    const entries = [...m.entries()].slice(-4000);
    try { localStorage.setItem(STORE + lang, JSON.stringify(Object.fromEntries(entries))); } catch { try { localStorage.removeItem(STORE + lang); } catch { /* ignore */ } }
  }, 800);
}

export const cached = (lang, text) => (lang === 'en' ? text : load(lang).get(text));

// ---------- built-in translator ----------
const hasBuiltIn = () => typeof self !== 'undefined' && 'Translator' in self;
const builtIn = {};

export async function builtInStatus(lang) {
  if (!hasBuiltIn()) return 'none';
  try { return await self.Translator.availability({ sourceLanguage: 'en', targetLanguage: lang }); } catch { return 'unavailable'; }
}

// call from a click handler (a model download needs a user gesture)
export function prepareBuiltIn(lang, onProgress) {
  if (!hasBuiltIn()) return Promise.resolve(null);
  if (!builtIn[lang]) {
    builtIn[lang] = self.Translator.create({
      sourceLanguage: 'en',
      targetLanguage: lang,
      monitor(m) { m.addEventListener('downloadprogress', (e) => onProgress?.(e.loaded)); },
    }).catch(() => { builtIn[lang] = null; return null; });
  }
  return builtIn[lang];
}

/** which engine will be used: 'builtin' | 'claude' | 'none' */
export async function engineFor(lang) {
  if (lang === 'en') return 'none';
  const st = await builtInStatus(lang);
  if (st !== 'none' && st !== 'unavailable') return 'builtin';
  if (getApiKey()) return 'claude';
  return 'none';
}

async function viaClaude(texts, lang) {
  const name = lang === 'mr' ? 'Marathi' : 'Hindi';
  const system = `You translate narration for Indian students' programming video lessons into simple, spoken ${name} (Devanagari script), the way a friendly Indian teacher explains in class. Keep technical terms, code, function names, keywords, file names and English acronyms in English (for example: function, variable, array, API, SELECT, useState, app.get). Do not add or drop information. Reply with ONLY a JSON array of strings, same length and order as the input.`;
  const { text } = await streamClaude({
    apiKey: getApiKey(),
    model: 'claude-opus-5-5',
    effort: 'low',
    system,
    messages: [{ role: 'user', content: JSON.stringify(texts) }],
  });
  const m = /\[[\s\S]*\]/.exec(text || '');
  const arr = m ? JSON.parse(m[0]) : [];
  if (!Array.isArray(arr) || arr.length !== texts.length) throw new Error('Bad translation reply');
  return arr.map(String);
}

/**
 * Translate texts (English) to lang. Fills the cache; returns the translated array
 * (falls back to the English text for anything that could not be translated).
 */
export async function translateTexts(texts, lang) {
  if (lang === 'en') return texts;
  const m = load(lang);
  const todo = [...new Set(texts.filter((t) => t && !m.has(t)))];
  if (todo.length) {
    const engine = await engineFor(lang);
    try {
      if (engine === 'builtin') {
        const tr = await prepareBuiltIn(lang);
        if (tr) {
          for (const t of todo) {
            try { m.set(t, await tr.translate(t)); } catch { /* keep English */ }
          }
        }
      } else if (engine === 'claude') {
        for (let i = 0; i < todo.length; i += 25) {
          const chunk = todo.slice(i, i + 25);
          const out = await viaClaude(chunk, lang);
          chunk.forEach((t, k) => m.set(t, out[k]));
        }
      }
    } catch { /* network / quota problems → English */ }
    save(lang);
  }
  return texts.map((t) => m.get(t) || t);
}
