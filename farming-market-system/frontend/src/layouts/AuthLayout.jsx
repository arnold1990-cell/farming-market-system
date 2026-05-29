import Navbar from '../components/Navbar';

export default function AuthLayout({ children }) {
  return <div><Navbar /><main className="max-w-md mx-auto px-4 py-8">{children}</main></div>;
}
