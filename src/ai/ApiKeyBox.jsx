import { useState } from 'react';
import { KeyRound, ShieldCheck, ExternalLink } from 'lucide-react';
import { getApiKey, setApiKey, MODELS, EFFORTS } from './claudeClient.js';

export function useApiKey() {
  const [key, setKey] = useState(getApiKey);
  return [key, (k) => { setApiKey(k); setKey(k); }];
}

export default function ApiKeyBox({ apiKey, setKey, model, setModel, effort, setEffort, compact }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(!apiKey);
  return (
    <div className={`ai-keybox ${compact ? 'compact' : ''}`}>
      <div className="ai-keyrow">
        <KeyRound size={16} />
        {apiKey && !open ? (
          <>
            <span className="ai-ok"><ShieldCheck size={14} /> API key saved in this browser ({apiKey.slice(0, 10)}…)</span>
            <button className="link-btn" onClick={() => setOpen(true)}>change</button>
            <button className="link-btn danger" onClick={() => { setKey(''); setOpen(true); }}>remove</button>
          </>
        ) : (
          <>
            <input className="input ai-keyinput" type="password" placeholder="Paste your Anthropic API key (sk-ant-…)" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="btn small primary" disabled={!draft.trim()} onClick={() => { setKey(draft.trim()); setDraft(''); setOpen(false); }}>Save</button>
            <a className="btn small" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"><ExternalLink size={14} /> Get a key</a>
          </>
        )}
        {setModel && (
          <select value={model} onChange={(e) => setModel(e.target.value)} title="Model">
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        )}
        {setEffort && (
          <select value={effort} onChange={(e) => setEffort(e.target.value)} title="Effort: how much the model thinks before answering">
            {EFFORTS.map((x) => <option key={x} value={x}>effort: {x}</option>)}
          </select>
        )}
      </div>
      {open && <p className="muted small">Use your own key. It is stored only in this browser and sent directly to Anthropic; usage is billed to your account. No key? You can still build prompts here and copy them into claude.ai, ChatGPT or Gemini.</p>}
    </div>
  );
}
