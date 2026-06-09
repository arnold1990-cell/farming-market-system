import BrandLogo from './BrandLogo';

export default function SplashScreen({ label = 'Loading Pula Harvest...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center">
        <BrandLogo
          priority
          className="mx-auto shrink-0"
          imgClassName="drop-shadow-[0_24px_54px_rgba(20,153,67,0.18)]"
        />
        <p className="mt-5 text-sm font-semibold tracking-[0.18em] text-farm-green">{label}</p>
      </div>
    </div>
  );
}
