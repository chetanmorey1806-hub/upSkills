export default function ProgressBar({ value, color }) {
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  return (
    <div className="pbar" title={`${pct}%`}>
      <div className="pbar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
