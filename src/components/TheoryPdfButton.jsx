import { useState } from 'react';
import { FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth.js';
import '../styles/theory-pdf.css';

// "Download PDF" of a lesson's theory, for offline reading in any PDF viewer (phone or computer).
// The PDF code + fonts are loaded only when the button is clicked.
export default function TheoryPdfButton({ topic, course, label, variant = 'button' }) {
  const user = useAuth();
  const [state, setState] = useState('idle'); // idle | busy | done | error
  if (!topic?.theory?.length) return null;

  const run = async () => {
    if (state === 'busy') return;
    setState('busy');
    try {
      const { downloadTheoryPdf } = await import('../pdf/theoryPdf.js');
      await downloadTheoryPdf(topic, { course, label, student: user?.name || user?.username || '' });
      setState('done');
      setTimeout(() => setState('idle'), 4000);
    } catch (e) {
      console.error(e);
      setState('error');
    }
  };

  const btn = (
    <button className={`btn ${variant === 'card' ? 'primary' : ''} tpdf-btn`} onClick={run} disabled={state === 'busy'}>
      {state === 'busy' ? <Loader2 size={16} className="tpdf-spin" /> : state === 'done' ? <CheckCircle2 size={16} /> : <FileDown size={16} />}
      {state === 'busy' ? 'Preparing PDF…' : state === 'done' ? 'PDF downloaded' : `Download ${label || 'theory'} PDF`}
    </button>
  );

  if (variant !== 'card') return btn;
  return (
    <div className="tpdf-card">
      <span className="tpdf-icon"><FileDown size={22} /></span>
      <div className="tpdf-text">
        <b>Finished {label || 'this lesson'}? Save the theory as a PDF</b>
        <span>All theory sections, syntax, key points and tips in one clean PDF. Open it any time, even offline, in your phone's or computer's built-in PDF viewer.</span>
        {state === 'error' && <span className="tpdf-err">Could not create the PDF. Check your internet connection and try again.</span>}
      </div>
      {btn}
    </div>
  );
}
