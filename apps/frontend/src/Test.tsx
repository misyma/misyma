import { useQuery } from '@tanstack/react-query';
import ky from 'ky';

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

export const Test = () => {
  const { isLoading, isError, error, data } = useQuery<TodoItem[]>({
    queryKey: ['todos'],
    queryFn: () => {
      return ky.get('/api/todos').json();
    },
  });

  if (isLoading || !data) return <p>Loading...</p>;

  if (isError) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data.map((todo: TodoItem) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
};
