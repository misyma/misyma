import { FC, PropsWithChildren } from 'react';
import { BookDetailsChangeRequestProvider } from '../../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { QueryClientProvider } from '../../../../core/components/providers/queryClientProvider/queryClientProvider';
import { Toaster } from '../../../../common/components/toast/toaster';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StepOneFormDataTestIds } from './stepOneForm/stepOneForm';
import { StoreProvider } from '../../../../core/components/providers/storeProvider/storeProvider';
import { CreateChangeRequestForm, StepTwoFormDataTestIds } from './createChangeRequestForm';
import { useQueryClient } from '@tanstack/react-query';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { Author, Book, bookFormats, languages, readingStatuses } from '@common/contracts';
import { FindBookByIdQueryOptions } from '../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { randomUUID } from 'crypto';
import { type Category } from '@common/contracts';
import { faker } from '@faker-js/faker';
import { getAuthorsInfiniteQueryOptions } from '../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';

const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

vi.mock('@tanstack/react-virtual');

import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual';

const mockedVirtualizer = vi.mocked(useVirtualizer);

mockedVirtualizer.mockReturnValue({
  scrollToIndex: vi.fn(),
  getVirtualItems: vi.fn(() => [
    { index: 0, start: 0, end: 40, size: 40, lane: 0 },
    { index: 1, start: 40, end: 80, size: 40, lane: 0 },
    { index: 2, start: 80, end: 120, size: 40, lane: 0 },
    { index: 3, start: 120, end: 160, size: 40, lane: 0 },
    { index: 4, start: 160, end: 200, size: 40, lane: 0 },
  ]),
  getTotalSize: vi.fn(() => 350),
  measure: vi.fn(),
  // Make sure to include the missing methods needed by cmdk
  scrollToOffset: vi.fn(),
  options: {
    size: 500,
    parentRef: { current: { scrollTo: vi.fn() } },
    estimateSize: vi.fn(() => 40),
  },
} as unknown as Virtualizer<Element, Element>);

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
    {
      id: randomUUID(),
      isApproved: true,
      name: faker.person.firstName(),
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

const newAuthors = [
  {
    id: randomUUID(),
    isApproved: true,
    name: faker.person.firstName(),
  },
  {
    id: randomUUID(),
    isApproved: true,
    name: faker.person.firstName(),
  },
  {
    id: randomUUID(),
    isApproved: true,
    name: faker.person.firstName(),
  },
];

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://api.misyma.com/api";

const bookChangeRequestResponseMock = vi
  .fn()
  .mockImplementation(() => HttpResponse.json({ success: true }, { status: 200 }));

const server = setupServer(
  http.get(API_URL + '/authors', () => {
    return HttpResponse.json({
      data: [...testBook.authors, ...newAuthors] as Author[],
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

Element.prototype.scrollIntoView = vi.fn();

Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
}));

beforeAll(() => server.listen());
beforeEach(() => vi.clearAllMocks());
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

  queryClient.setQueryData(
    getAuthorsInfiniteQueryOptions({
      all: true,
      pageSize: 25,
      name: '',
    }).queryKey,
    (vals) => {
      if (vals) return vals;

      return {
        pages: [
          {
            data: [...testBook.authors, ...newAuthors],
            metadata: {
              total: 5,
              page: 1,
              pageSize: 25,
            },
          },
        ],
        pageParams: [{}],
      };
    },
  );

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

it.each([
  ['isbn', StepOneFormDataTestIds.isbn.input],
  ['publisher', StepOneFormDataTestIds.publisher.input],
  ['releaseYear', StepOneFormDataTestIds.releaseYear.input],
])('step 1: sends only given input removal - %s', async (key, testId) => {
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

  const input: HTMLInputElement = (await element.findByTestId(testId)) as HTMLInputElement;

  fireEvent.click(input);
  fireEvent.change(input, { target: { value: '' } });

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
    [key]: null,
  });
});

it('given no changes from step 1 - create button is disabled', async () => {
  const element = render(
    <TestComponent>
      <CreateChangeRequestForm
        bookId="mein-book"
        onCancel={() => {}}
        onSubmit={() => {}}
      ></CreateChangeRequestForm>
    </TestComponent>,
  );

  server.use(
    http.post(API_URL + '/book-change-requests', async (...args) => {
      return bookChangeRequestResponseMock(...args);
    }),
  );

  const continueButton = await element.findByTestId(StepOneFormDataTestIds.continueButton);
  fireEvent.click(continueButton);

  const createButton = (await element.findByTestId(StepTwoFormDataTestIds.createButton)) as HTMLButtonElement;

  expect(createButton.disabled).toBe(true);
});

// very weird and not giving much certainty
it('#Advisable to test manually for now# sends only changed authors', async () => {
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

  const trigger = await element.findByTestId('author-multi-combobox-trigger-button');

  fireEvent.click(trigger);

  const firstAuthor = await screen.findByTestId(`author-multi-combobox-option-${testBook.authors[0].id}`);

  // Unsure why this does not work correctly in tests.
  // Leaving double-clicking for now just to test the underlying business logic.
  fireEvent.click(firstAuthor);
  fireEvent.click(firstAuthor);

  const oneOfNewAuthors = await element.findByTestId(`author-multi-combobox-option-${newAuthors[0].id}`);

  fireEvent.click(oneOfNewAuthors);
  fireEvent.click(oneOfNewAuthors);

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
    authorIds: [testBook.authors[1].id, ...newAuthors.slice(1).map((x) => x.id)],
  });
});
