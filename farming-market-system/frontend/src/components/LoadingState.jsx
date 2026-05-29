import LoadingSpinner from './LoadingSpinner';

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="card flex min-h-40 items-center justify-center p-6">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-2 text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}
