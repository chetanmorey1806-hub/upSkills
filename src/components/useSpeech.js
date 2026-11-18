// Speech-to-text with the browser's Web Speech API (Chrome, Edge, Safari). Falls back gracefully.
import { useCallback, useEffect, useRef, useState } from 'react';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export function useSpeech({ lang = 'en-IN', onText } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const rec = useRef(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => () => { try { rec.current?.stop(); } catch { /* ignore */ } }, []);

  const start = useCallback(() => {
    if (!SR) { setError('Speech recognition is not supported in this browser. Use Chrome or Edge, or type your answer.'); return; }
    setError('');
    const r = new SR();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let fin = '', tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fin += t; else tmp += t;
      }
      setInterim(tmp);
      if (fin) cb.current?.(fin.trim());
    };
    r.onerror = (e) => { setError(e.error === 'not-allowed' ? 'Microphone permission was denied.' : `Mic error: ${e.error}`); };
    r.onend = () => { setListening(false); setInterim(''); };
    rec.current = r;
    try { r.start(); setListening(true); } catch { /* already started */ }
  }, [lang]);

  const stop = useCallback(() => { try { rec.current?.stop(); } catch { /* ignore */ } setListening(false); }, []);

  return { supported: !!SR, listening, interim, error, start, stop, toggle: () => (listening ? stop() : start()) };
}

// Reads text aloud (used to "ask" interview questions).
export function speak(text, rate = 1) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
export function stopSpeaking() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }
