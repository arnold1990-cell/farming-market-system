import StatusBadge from './StatusBadge';

export default function OrderCard({ order, right }) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Order #{order.id}</p>
          <p className="text-xs text-gray-500">{order.createdAt || ''}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      {order.products ? <p className="text-sm text-gray-700">{order.products}</p> : null}
      {order.totalAmount !== undefined ? <p className="text-sm font-medium">Total: BWP {Number(order.totalAmount).toFixed(2)}</p> : null}
      {right ? <div>{right}</div> : null}
    </div>
  );
}
