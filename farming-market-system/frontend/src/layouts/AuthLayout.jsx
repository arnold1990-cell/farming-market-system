import Navbar from '../components/Navbar';
import BrandLogo from '../components/BrandLogo';

export default function AuthLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 rounded-[28px] bg-white px-6 py-6 text-center shadow-soft">
          <BrandLogo priority className="mx-auto w-full max-w-[160px]" imgClassName="mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Fresh produce, trusted farmers, and harvest visibility in one platform.</p>
        </div>
        {children}
      </main>
    </div>
  );
}
