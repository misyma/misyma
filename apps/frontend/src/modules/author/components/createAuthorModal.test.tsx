import { it, expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { CreateAuthorModal } from './createAuthorModal';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../../tests/customRender';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.post('https://api.misyma.com/api/admin/authors', () => {
    return HttpResponse.json({ id: '1', name: 'John Doe' });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

it('correctly renders Trigger', async () => {
  const onMutated = () => {};

  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={
        <button aria-label="BasicButtonLabel">
          The most basic button ever
        </button>
      }
    />
  );

  const button = await screen.findByLabelText('BasicButtonLabel');
  expect(button).toBeVisible();
});

it('correctly renders Modal', async () => {
  const onMutated = () => {};

  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={
        <button aria-label="BasicButtonLabel">
          The most basic button ever
        </button>
      }
    />
  );

  const button = await screen.findByLabelText('BasicButtonLabel');
  await userEvent.click(button);

  const dialogTitle = await screen.findByLabelText(
    'Create author modal header'
  );
  expect(dialogTitle).toBeVisible();
  expect(dialogTitle).toHaveTextContent('Stwórz autora');
});

it('validates form input', async () => {
  const onMutated = vi.fn();
  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={<button>Open Modal</button>}
    />
  );

  await userEvent.click(screen.getByText('Open Modal'));
  const input = screen.getByLabelText('Imię i nazwisko*');
  const submitButton = screen.getByText('Stwórz');

  expect(submitButton).toBeDisabled();

  await userEvent.type(input, 'Jo');
  expect(submitButton).toBeDisabled();
  expect(
    await screen.findByText(
      'Imię i nazwisko autora musi miec co najmniej trzy znaki.'
    )
  ).toBeVisible();

  await userEvent.clear(input);
  await userEvent.type(input, 'John Doe');
  expect(submitButton).toBeEnabled();
});

it('submits form successfully', async () => {
  const onMutated = vi.fn();
  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={<button>Open Modal</button>}
    />
  );

  await userEvent.click(screen.getByText('Open Modal'));
  const input = screen.getByLabelText('Imię i nazwisko*');
  const submitButton = screen.getByText('Stwórz');

  await userEvent.type(input, 'John Doe');
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(onMutated).toHaveBeenCalled();
  });

  expect(
    await screen.findByText('Autor: John Doe został stworzony.')
  ).toBeVisible();
});

it('handles API error', async () => {
  server.use(
    http.post('https://api.misyma.com/api/admin/authors', () => {
      return HttpResponse.json(
        { message: 'Author already exists' },
        {
          status: 409,
        }
      );
    })
  );

  const onMutated = vi.fn();
  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={<button>Open Modal</button>}
    />
  );

  await userEvent.click(screen.getByText('Open Modal'));
  const input = screen.getByLabelText('Imię i nazwisko*');
  const submitButton = screen.getByText('Stwórz');

  await userEvent.type(input, 'John Doe');
  await userEvent.click(submitButton);

  expect(await screen.findByText('Autor już istnieje.')).toBeVisible();
  expect(onMutated).not.toHaveBeenCalled();
});

it('closes modal on successful submission', async () => {
  const onMutated = vi.fn();
  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={<button>Open Modal</button>}
    />
  );

  await userEvent.click(screen.getByText('Open Modal'));
  const input = screen.getByLabelText('Imię i nazwisko*');
  const submitButton = screen.getByText('Stwórz');

  await userEvent.type(input, 'John Doe');
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.queryByText('Stwórz autora')).not.toBeInTheDocument();
  });
});

it('resets form on modal close', async () => {
  const onMutated = vi.fn();
  customRender(
    <CreateAuthorModal
      onMutated={onMutated}
      trigger={<button>Open Modal</button>}
    />
  );

  await userEvent.click(screen.getByText('Open Modal'));
  const input = screen.getByLabelText('Imię i nazwisko*');

  await userEvent.type(input, 'John Doe');
  await userEvent.click(screen.getByLabelText('Close dialog'));

  await userEvent.click(screen.getByText('Open Modal'));
  expect(input).toHaveValue('');
});
