import RichText from './RichText.jsx';
import CodeBlock from './CodeBlock.jsx';

// Renders AI answers: ```fenced code``` becomes a code block, the rest is rich text.
export default function AiText({ text }) {
  const parts = String(text || '').split(/```([\w+#.-]*)\n?([\s\S]*?)(?:```|$)/g);
  const out = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i] && parts[i].trim()) out.push(<RichText key={`t${i}`} text={parts[i].replace(/^#{1,4}\s+(.*)$/gm, '**$1**')} />);
    if (i + 2 < parts.length && parts[i + 2] != null) out.push(<CodeBlock key={`c${i}`} code={parts[i + 2].replace(/\n$/, '')} label={parts[i + 1] || 'Code'} />);
  }
  return <>{out}</>;
}
