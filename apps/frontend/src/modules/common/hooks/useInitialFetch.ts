import { useEffect, useRef, useState } from 'react';

import useDebounce from './useDebounce';

interface UseInitialFetchProps {
  isFetching: boolean;
}
export const useInitialFetch = ({ isFetching }: UseInitialFetchProps) => {
  const [loading, setLoading] = useState(false);

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInitialFetchRef = useRef(true);

  const isLoading = useDebounce(loading, 500);

  useEffect(() => {
    if (isFetching) {
      if (isInitialFetchRef.current) {
        setLoading(true);

        isInitialFetchRef.current = false;
      } else {
        loadingTimerRef.current = setTimeout(() => setLoading(true), 500);
      }
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }

      setLoading(false);
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isFetching]);

  return {
    isLoading,
  };
};
