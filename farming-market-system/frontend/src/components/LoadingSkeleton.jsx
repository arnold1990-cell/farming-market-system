export default function LoadingSkeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-200/70 ${className}`} />;
}
