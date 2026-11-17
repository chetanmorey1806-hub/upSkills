import { Fragment } from 'react';

// Renders inline **bold** and `code`.
export function Inline({ text }) {
  if (text == null) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i} className="ic">{p.slice(1, -1)}</code>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

// Paragraphs split on blank lines; lines starting with "- " / "• " / "1. " become lists.
export default function RichText({ text }) {
  if (!text) return null;
  const blocks = String(text).split(/\n\s*\n/);
  return blocks.map((b, i) => {
    const lines = b.split('\n').filter((l) => l.trim() !== '');
    if (lines.length && lines.every((l) => /^\s*([-•*]|\d+[.)])\s+/.test(l))) {
      const ordered = /^\s*\d/.test(lines[0]);
      const Tag = ordered ? 'ol' : 'ul';
      return (
        <Tag key={i}>
          {lines.map((l, j) => (
            <li key={j}><Inline text={l.replace(/^\s*([-•*]|\d+[.)])\s+/, '')} /></li>
          ))}
        </Tag>
      );
    }
    return (
      <p key={i}>
        {lines.map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            <Inline text={l} />
          </Fragment>
        ))}
      </p>
    );
  });
}
