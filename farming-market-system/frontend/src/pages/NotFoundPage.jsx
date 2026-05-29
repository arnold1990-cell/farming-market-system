import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-3xl font-bold">Page not found</h1><Link to="/" className="text-farm-green">Go home</Link></div></div>;
}
