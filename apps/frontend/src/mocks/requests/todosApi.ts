import { http, HttpResponse } from 'msw';

let currentId = 3;

const todos = [
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
];

export const getTodosRequest = http.get('/api/todos', () => {
  return HttpResponse.json(todos);
});

export const postTodosRequest = http.post('/api/todos', async ({ request }) => {  
  const body = await request.text();

  if (!body) {
    return HttpResponse.json(
      {
        statusCode: 400,
        message: 'Bad Request.',
      },
      {
        status: 400,
      },
    );
  }

  const { title } = JSON.parse(body);

  currentId += 1;

  todos.push({
    completed: false,
    id: currentId,
    title,
  });

  return HttpResponse.json({}, { status: 200 });
});

const handlers = [getTodosRequest, postTodosRequest];

export default handlers;
