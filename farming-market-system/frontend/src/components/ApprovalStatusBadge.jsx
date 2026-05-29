export default function ApprovalStatusBadge({ status }) {
  const normalized = String(status || 'PENDING').toUpperCase();
  const styles = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    READY_NOW: 'bg-emerald-100 text-emerald-700',
    MATURING_SOON: 'bg-blue-100 text-blue-700',
    SOLD_OUT: 'bg-gray-200 text-gray-600'
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[normalized] || 'bg-gray-100 text-gray-700'}`}>{normalized.replaceAll('_', ' ')}</span>;
}
