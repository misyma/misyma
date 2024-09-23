import { it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAuthorModal } from './deleteAuthorModal';
import { customRender } from '../../../tests/customRender';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.delete('https://api.misyma.com/api/admin/authors/:authorId', () => {
    return HttpResponse.json({ success: true });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

const mockToast = vi.fn();
vi.mock('../../common/components/toast/use-toast', () => ({
  useToast: () => ({ toast: mockToast, toasts: [] }),
}));

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', async () => ({
  ...(await vi.importActual('@tanstack/react-query')),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

it('renders the delete button', () => {
  customRender(<DeleteAuthorModal authorId="1" authorName="John Doe" />);

  expect(screen.getByRole('button')).toBeInTheDocument();
});

it('opens the modal when delete button is clicked', async () => {
  customRender(<DeleteAuthorModal authorId="1" authorName="John Doe" />);

  await userEvent.click(screen.getByRole('button'));

  expect(
    screen.getByText('Usunięcia autora jest nieodwracalne!')
  ).toBeInTheDocument();
  expect(screen.getByText('Czy jesteś tego pewien?')).toBeInTheDocument();
});

it('closes the modal when "Nie" button is clicked', async () => {
  customRender(<DeleteAuthorModal authorId="1" authorName="John Doe" />);

  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('Nie'));

  expect(
    screen.queryByText('Usunięcia autora jest nieodwracalne!')
  ).not.toBeInTheDocument();
});

it('deletes the author when "Tak" button is clicked', async () => {
  customRender(<DeleteAuthorModal authorId="1" authorName="John Doe" />);

  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('Tak'));

  await waitFor(() => {
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'success',
      title: 'Autor: John Doe został usunięty.',
    });
  });

  expect(
    screen.queryByText('Usunięcia autora jest nieodwracalne!')
  ).not.toBeInTheDocument();
});

it('displays an error message when deletion fails', async () => {
  server.use(
    http.delete('https://api.misyma.com/api/admin/authors/:authorId', () => {
      return new HttpResponse(JSON.stringify({ message: 'Deletion failed' }), {
        status: 400,
      });
    })
  );

  customRender(<DeleteAuthorModal authorId="1" authorName="John Doe" />);

  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(screen.getByText('Tak'));

  expect(mockInvalidateQueries).not.toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalled();
});

it('applies custom className to the delete icon', () => {
  customRender(
    <DeleteAuthorModal
      authorId="1"
      authorName="John Doe"
      className="custom-class"
    />
  );

  const icon = screen.getByRole('button').firstChild;
  expect(icon).toHaveClass('custom-class');
});
