import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search products...', onFilterClick }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-farm-green/20 focus:ring-2" />
      </div>
      <button type="button" onClick={onFilterClick} className="rounded-2xl border border-gray-200 bg-white p-3 text-gray-700">
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );
}
