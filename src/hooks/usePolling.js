import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 8000;

export function usePolling(callback, intervalMs = DEFAULT_INTERVAL_MS) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
