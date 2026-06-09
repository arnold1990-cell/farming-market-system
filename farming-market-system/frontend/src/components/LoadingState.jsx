import BrandLogo from './BrandLogo';
import LoadingSpinner from './LoadingSpinner';

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="card flex min-h-40 items-center justify-center p-6">
      <div className="text-center">
        <BrandLogo className="mx-auto mb-4 w-full max-w-[128px]" imgClassName="mx-auto" />
        <LoadingSpinner />
        <p className="mt-2 text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}
