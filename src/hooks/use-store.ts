import { useState, useEffect } from 'react';

/**
 * SSR-safe hook for Zustand stores with persist middleware.
 * Returns `undefined` during SSR/hydration to avoid mismatches,
 * then resolves to the actual store value on mount.
 */
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
