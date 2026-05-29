export default function CategoryChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-farm-green text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
    >
      {label}
    </button>
  );
}
