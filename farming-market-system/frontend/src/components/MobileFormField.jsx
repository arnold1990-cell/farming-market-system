export default function MobileFormField({ label, error, children }) {
  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-gray-700">{label}</label> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
