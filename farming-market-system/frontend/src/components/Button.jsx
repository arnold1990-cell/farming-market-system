export default function Button({ className = '', children, ...props }) {
  return (
    <button
      className={`rounded-2xl bg-farm-green px-4 py-3 text-sm font-semibold text-white shadow-soft transition active:scale-[0.99] disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
