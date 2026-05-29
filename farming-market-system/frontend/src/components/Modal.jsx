export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4"><div className="bg-white rounded-2xl w-full max-w-lg p-5"><div className="flex justify-between mb-3"><h3 className="font-semibold">{title}</h3><button onClick={onClose}>X</button></div>{children}</div></div>;
}
