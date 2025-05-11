import { FC, PropsWithChildren } from 'react';
import { BookDetailsChangeRequestProvider } from '../../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { QueryClientProvider } from '../../../../core/components/providers/queryClientProvider/queryClientProvider';
import { Toaster } from '../../../../common/components/toast/toaster';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { StepOneFormDataTestIds } from './stepOneForm/stepOneForm';
import { StoreProvider } from '../../../../core/components/providers/storeProvider/storeProvider';
import { CreateChangeRequestForm, StepTwoFormDataTestIds } from './createChangeRequestForm';
import { useQueryClient } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { Book, bookFormats, languages, readingStatuses } from '@common/contracts';
import { FindBookByIdQueryOptions } from '../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';
import { type Category } from '@common/contracts';

const testBookId = 'mein-book';

const testBook: Book = {
  id: testBookId,
  categoryName: 'Such category',
  authors: [
    {
      id: randomUUID(),
      isApproved: true,
      name: 'Zdzisław',
    },
  ],
  isbn: '9788361640479',
  categoryId: '',
  isApproved: true,
  language: languages.Abkhazian,
  releaseYear: 1999,
  title: 'Title',
  pages: 555,
  imageUrl: '',
  format: bookFormats.ebook,
  publisher: 'Www',
  translator: 'Pan Jerzy',
};

const API_URL = import.meta.env.VITE_API_BASE_URL;

const bookChangeRequestResponseMock = vi.fn().mockResolvedValue(HttpResponse.json({ success: true }, { status: 200 }));

const server = setupServer(
  http.get(API_URL + '/authors', () => {
    return HttpResponse.json({
      data: [],
      metadata: {
        total: 5,
      },
    });
  }),
  http.get(API_URL + '/categories', () =>
    HttpResponse.json({
      data: [
        {
          id: randomUUID(),
          name: 'Such category, much wow',
        },
      ] as Category[],
    }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();

  queryClient.setQueryData(FindUserBookByIdQueryOptions({ userBookId: testBookId }).queryKey, (vals) => {
    if (vals) {
      return vals;
    }

    return {
      book: testBook,
      bookId: testBookId,
      bookshelfId: 'mein-bookshelf',
      collections: [],
      createdAt: '2025-04-04',
      id: 'mein-id',
      isFavorite: true,
      readings: [],
      status: readingStatuses.finished,
      imageUrl: '',
    };
  });

  queryClient.setQueryData(FindBookByIdQueryOptions({ bookId: testBookId }).queryKey, (vals) => {
    if (vals) {
      return vals;
    }

    return testBook;
  });

  return <>{children}</>;
};

const TestComponent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <StoreProvider>
      <QueryClientProvider>
        <Wrapper>
          <BookDetailsChangeRequestProvider>{children}</BookDetailsChangeRequestProvider>
          <Toaster />
        </Wrapper>
      </QueryClientProvider>
    </StoreProvider>
  );
};

it('renders correctly', async () => {
  const element = render(
    <TestComponent>
      <CreateChangeRequestForm
        bookId="mein-book"
        onCancel={() => {}}
        onSubmit={() => {}}
      ></CreateChangeRequestForm>
    </TestComponent>,
  );

  let capturedRequestBody = null;

  server.use(
    http.post(API_URL + '/book-change-requests', async (...args) => {
      capturedRequestBody = await args[0].request.json();
      return bookChangeRequestResponseMock(...args);
    }),
  );

  const isbnInput: HTMLInputElement = (await element.findByTestId(
    StepOneFormDataTestIds.isbn.input,
  )) as HTMLInputElement;

  fireEvent.click(isbnInput);
  fireEvent.change(isbnInput, { target: { value: '' } });

  const continueButton = await element.findByTestId(StepOneFormDataTestIds.continueButton);
  fireEvent.click(continueButton);

  const createButton = await element.findByTestId(StepTwoFormDataTestIds.createButton);
  fireEvent.click(createButton);

  await waitFor(
    () => {
      expect(bookChangeRequestResponseMock).toHaveBeenCalled();
    },
    { timeout: 5000 },
  );

  expect(capturedRequestBody).toEqual({
    bookId: testBookId,
    isbn: null,
  });
});
