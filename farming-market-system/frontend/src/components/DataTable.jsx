export default function DataTable({ columns, rows, mobileRender }) {
  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white lg:block">
        <table className="w-full">
          <thead className="bg-farm-gray">
            <tr>{columns.map((c) => <th key={c.key} className="p-3 text-left text-sm">{c.title}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => <td key={c.key} className="p-3 text-sm">{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">
        {rows.map((r, i) => (
          <div key={i} className="card p-3">
            {mobileRender ? mobileRender(r) : columns.map((c) => (
              <p key={c.key} className="text-sm"><span className="font-medium">{c.title}:</span> {c.render ? c.render(r) : String(r[c.key] ?? '-')}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
