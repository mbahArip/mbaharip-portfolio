import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number = 250, cb?: { before: () => void; after: () => void }): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    cb?.before && cb.before();
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      cb?.after && cb.after();
    }, delay);

    return () => {
      clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
