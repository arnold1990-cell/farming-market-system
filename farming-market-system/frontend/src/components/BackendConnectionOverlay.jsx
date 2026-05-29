import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, ServerOff } from 'lucide-react';
import { BACKEND_HEALTHCHECK_URL } from '../config/api';

const RETRY_INTERVAL_MS = 4000;

export default function BackendConnectionOverlay() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [checking, setChecking] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const mountedRef = useRef(true);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch(BACKEND_HEALTHCHECK_URL, { cache: 'no-store' });
      if (!mountedRef.current) return;
      setIsAvailable(response.ok);
    } catch {
      if (!mountedRef.current) return;
      setIsAvailable(false);
    } finally {
      if (mountedRef.current) {
        setChecking(false);
        setHasCheckedOnce(true);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    checkBackend();
    const timer = window.setInterval(checkBackend, RETRY_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [checkBackend]);

  if (!hasCheckedOnce || isAvailable) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex justify-center px-3 py-2">
      <div className="w-full max-w-4xl rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 shadow-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <ServerOff size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium leading-5">
              Backend is offline. Some live data may be unavailable.
            </p>
          </div>
          <button
            type="button"
            onClick={checkBackend}
            className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-amber-400 bg-white px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:shrink-0"
            disabled={checking}
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
            Retry connection
          </button>
        </div>
      </div>
    </div>
  );
}
