import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, ServerOff } from 'lucide-react';
import api from '../services/api';

const RETRY_INTERVAL_MS = 4000;

export default function BackendConnectionOverlay() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [checking, setChecking] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const mountedRef = useRef(true);

  const checkBackend = useCallback(async () => {
    setChecking(true);
    try {
      const response = await api.get('/health');
      if (!mountedRef.current) return;
      setIsAvailable(response.status < 500);
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
    <div className="fixed right-4 top-4 z-[70] max-w-[18rem]">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-amber-900 shadow-lg backdrop-blur">
        <div className="flex items-start gap-2">
          <ServerOff size={16} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold">Live backend unreachable</p>
            <p className="mt-0.5 text-[11px] leading-4 text-amber-800">Marketplace data may be delayed until `/api` responds again.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={checkBackend}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={checking}
        >
          <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          Retry
        </button>
      </div>
    </div>
  );
}
