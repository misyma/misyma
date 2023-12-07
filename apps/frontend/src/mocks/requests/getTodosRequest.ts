import { http, HttpResponse } from 'msw';

export const getTodosRequest = http.get('/api/todos', () => {
  return HttpResponse.json([
    {
      id: 1,
      title: 'Mocked todo 1',
      completed: false,
    },
    {
      id: 2,
      title: 'Mocked todo 2',
      completed: true,
    },
    {
      id: 3,
      title: 'Mocked todo 3',
      completed: false,
    },
  ]);
});
