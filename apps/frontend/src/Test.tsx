import { useQuery } from '@tanstack/react-query';
import ky from 'ky';

interface HealthResponse {
  status: string;
}

export const Test = () => {
  const { isLoading, isError, error, data } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => {
      return ky.get('https://api.davout.io/health').json();
    },
  });

  if (isLoading || !data) return <p>Loading!</p>;

  if (isError) return <p>Error: {error.message}</p>;

  return <span>Health: {data.status}</span>;
};
