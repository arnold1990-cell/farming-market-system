export default function CategoryCard({ category }) {
  return <div className="card overflow-hidden"><img src={`${category.image}?auto=format&fit=crop&w=500&q=60`} className="h-24 w-full object-cover" /><div className="p-3 font-semibold">{category.name}</div></div>;
}
