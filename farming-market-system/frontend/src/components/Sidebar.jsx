import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ links }) {
  const { pathname } = useLocation();
  return <aside className="hidden lg:block w-64 bg-white border-r min-h-screen sticky top-16"><div className="p-4 space-y-1">{links.map(l => <Link key={l.path} to={l.path} className={`block px-3 py-2 rounded-xl ${pathname===l.path?'bg-farm-mint text-farm-green font-semibold':'hover:bg-gray-100'}`}>{l.label}</Link>)}</div></aside>;
}
