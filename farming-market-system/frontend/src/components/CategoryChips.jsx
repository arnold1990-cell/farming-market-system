import CategoryChip from './CategoryChip';

export default function CategoryChips({ categories = [], active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => <CategoryChip key={category} label={category} active={active === category} onClick={() => onChange(category)} />)}
    </div>
  );
}
