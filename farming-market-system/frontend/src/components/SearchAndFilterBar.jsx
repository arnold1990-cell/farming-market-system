import SearchBar from './SearchBar';

export default function SearchAndFilterBar({ value, onChange, children, placeholder }) {
  return (
    <div className="space-y-2">
      <SearchBar value={value} onChange={onChange} placeholder={placeholder} />
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
