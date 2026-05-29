import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav({ links }) {
  const { pathname } = useLocation();
  return <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40"><div className="grid grid-cols-4">{links.slice(0,4).map(l=><Link key={l.path} to={l.path} className={`text-xs text-center py-3 ${pathname===l.path?'text-farm-green font-semibold':''}`}>{l.label}</Link>)}</div></div>;
}
