import { Plus } from 'lucide-react';

export default function FloatingActionButton({ onClick, label = 'Add' }) {
  return (
    <button onClick={onClick} className="fixed bottom-24 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-farm-green px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden">
      <Plus size={16} />
      {label}
    </button>
  );
}
