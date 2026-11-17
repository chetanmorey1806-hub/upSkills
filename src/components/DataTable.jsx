export default function DataTable({ table, excelStyle = true }) {
  if (!table || !table.headers) return null;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {excelStyle && <th className="rownum"></th>}
            {table.headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {(table.rows || []).map((r, i) => (
            <tr key={i}>
              {excelStyle && <td className="rownum">{i + 2}</td>}
              {r.map((c, j) => <td key={j}>{String(c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
