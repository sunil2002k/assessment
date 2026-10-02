import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../api/errors';

export type FetchStatus = 'loading' | 'error' | 'success';

// `fn` must be a stable reference (module-level function).
export function useFetch<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setStatus('loading');
    fn()
      .then((d) => {
        setData(d);
        setStatus('success');
      })
      .catch((e) => {
        setError(errorMessage(e));
        setStatus('error');
      });
  }, [fn]);

  useEffect(load, [load]);
  return { data, setData, status, error, reload: load };
}
