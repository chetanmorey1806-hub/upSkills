import { useState } from 'react';

export default function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="code">
      <div className="code-head">
        <span>{label || 'Code'}</span>
        <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
