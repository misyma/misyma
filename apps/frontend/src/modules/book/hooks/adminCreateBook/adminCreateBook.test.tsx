import { beforeEach, expect, it, vi } from 'vitest';
import { useAdminCreateBook } from './adminCreateBook';
import { Language } from '@common/contracts';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookApiError } from '../../errors/bookApiError';
import { createMutationMock } from '../../../../tests/mocks/mutationMock';

const mutationMock = createMutationMock();

vi.mock('../../api/admin/mutations/createAdminBookMutation/createAdminBookMutation', () => ({
  useCreateAdminBookMutation: vi.fn().mockImplementation(() => mutationMock),
}));

const toastMock = vi.fn();
vi.mock('../../../common/components/toast/use-toast', () => ({
  useToast: vi.fn().mockImplementation(() => ({
    toast: toastMock,
  })),
}));

const onOperationErrorStub = vi.fn();

const CreateSuccess = () => {
  const { create } = useAdminCreateBook({
    onOperationError: onOperationErrorStub,
  });

  return (
    <button
      onClick={() => {
        create({
          bookPayload: {
            genreId: '1',
            language: Language.Abkhazian,
            releaseYear: 1999,
            title: 'Title',
          },
        });
      }}
    >
      Button
    </button>
  );
};

const renderAndWaitForClick = async () => {
  render(<CreateSuccess />);

  await userEvent.click((await screen.findAllByText('Button'))[0], {});

  await waitFor(() => expect(mutationMock.mutateAsync).toHaveBeenCalledTimes(1), {
    timeout: 500,
  });
};

beforeEach(() => vi.clearAllMocks());

it('Sends toast with success', async () => {
  await renderAndWaitForClick();

  expect(toastMock).toHaveBeenCalled();
});

it('Invokes onOperationError with Api error message', async () => {
  const expectedErrorMessage = 'Ich war ein böser Junge';
  mutationMock.mutateAsync.mockRejectedValueOnce(
    new BookApiError({
      apiResponseError: {},
      message: expectedErrorMessage,
      statusCode: 500,
    }),
  );

  await renderAndWaitForClick();

  expect(onOperationErrorStub).toHaveBeenCalledWith(expectedErrorMessage);

  expect(toastMock).not.toHaveBeenCalled();
});
