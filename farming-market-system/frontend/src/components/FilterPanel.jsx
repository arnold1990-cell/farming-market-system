import Select from './Select';

export default function FilterPanel({ categories }) {
  return <div className="card p-4 grid gap-3 md:grid-cols-4"><Select><option>All Categories</option>{categories.map(c=><option key={c.id}>{c.name}</option>)}</Select><Select><option>Any Price</option><option>0-10</option><option>10-50</option></Select><Select><option>Any Location</option><option>Gaborone</option><option>Maun</option></Select><Select><option>In Stock</option><option>Out of Stock</option></Select></div>;
}
