export default function StatusBadge({ status }) {
  const color = { PENDING: 'bg-amber-100 text-amber-700', PAID: 'bg-emerald-100 text-emerald-700', DELIVERING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700', ASSIGNED: 'bg-purple-100 text-purple-700' }[status] || 'bg-gray-100 text-gray-700';
  return <span className={`badge ${color}`}>{status}</span>;
}
