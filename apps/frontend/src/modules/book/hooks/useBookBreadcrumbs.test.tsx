import { beforeEach, expect, it, vi } from 'vitest';
import { useBookBreadcrumbs } from './useBookBreadcrumbs';
import { render } from '@testing-library/react';
import { BreadcrumbKeysProvider } from '../../common/contexts/breadcrumbKeysContext';

const bookshelfQueryMock = vi.fn().mockImplementation(() => ({
  data: undefined,
}));

vi.mock('../../bookshelf/api/queries/findBookshelfByIdQuery/findBookshelfByIdQuery', () => ({
  useFindBookshelfByIdQuery: vi.fn(() => bookshelfQueryMock()),
}));

const errorHandledQueryMock = vi.fn().mockImplementation(() => ({
  data: undefined,
}));

vi.mock('../../common/hooks/useErrorHandledQuery', () => ({
  useErrorHandledQuery: vi.fn().mockImplementation(() => errorHandledQueryMock()),
}));

beforeEach(() => vi.clearAllMocks());

const noBookshelfNameText = 'No bookshelfName';
const noBookshelfIdText = 'No bookshelfId';
const noBookNameText = 'No bookName';
const noBookIdText = 'No bookId';

const testBookId = 'TestId';

const TestComponent = () => {
  const { breadcrumbKeys } = useBookBreadcrumbs({ bookId: testBookId });

  return (
    <div>
      <span>{breadcrumbKeys['$bookshelfName'] ?? noBookshelfNameText}</span>
      <span>{breadcrumbKeys['$bookshelfId'] ?? noBookshelfIdText}</span>
      <span>{breadcrumbKeys['$bookName'] ?? noBookNameText}</span>
      <span>{breadcrumbKeys['$bookId'] ?? noBookIdText}</span>
    </div>
  );
};

const renderTestComponent = () =>
  render(<TestComponent></TestComponent>, {
    wrapper: ({ children }) => <BreadcrumbKeysProvider>{children}</BreadcrumbKeysProvider>,
  });

it('given no data - omits state updates', async () => {
  const element = renderTestComponent();

  const noBookshelfName = (await element.findAllByText(noBookshelfNameText))[0];
  const noBookshelfId = (await element.findAllByText(noBookshelfIdText))[0];
  const noBookName = (await element.findAllByText(noBookNameText))[0];
  const noBookId = (await element.findAllByText(noBookIdText))[0];

  expect(noBookshelfName).toBeVisible();
  expect(noBookshelfId).toBeVisible();
  expect(noBookName).toBeVisible();
  expect(noBookId).toBeVisible();
});

it('given only bookshelf - updates bookshelf state', async () => {
  const mockData = {
    name: 'Bimber',
    id: 'AlsoAllah',
  };
  bookshelfQueryMock.mockImplementationOnce(() => ({
    data: mockData,
  }));

  const element = renderTestComponent();

  const bookshelfName = (await element.findAllByText(mockData.name))[0];
  const bookshelfId = (await element.findAllByText(mockData.id))[0];
  const noBookName = (await element.findAllByText(noBookNameText))[0];
  const noBookId = (await element.findAllByText(noBookIdText))[0];

  expect(bookshelfName).toBeVisible();
  expect(bookshelfId).toBeVisible();
  expect(noBookName).toBeVisible();
  expect(noBookId).toBeVisible();
});

it('given only userBook - updates userBook state', async () => {
  const mockData = {
    book: {
      title: 'Sialalala',
    },
  };
  errorHandledQueryMock.mockImplementationOnce(() => ({
    data: mockData,
  }));

  const element = renderTestComponent();

  const noBookshelfName = (await element.findAllByText(noBookshelfNameText))[0];
  const noBookshelfId = (await element.findAllByText(noBookshelfIdText))[0];
  const bookName = (await element.findAllByText(mockData.book.title))[0];
  const bookId = (await element.findAllByText(testBookId))[0];

  expect(noBookshelfName).toBeVisible();
  expect(noBookshelfId).toBeVisible();
  expect(bookName).toBeVisible();
  expect(bookId).toBeVisible();
});

it('given userBook & bookshelf - updates entire state', async () => {
  const userBookMockData = {
    book: {
      title: 'Sialalala',
    },
  };
  errorHandledQueryMock.mockImplementationOnce(() => ({
    data: userBookMockData,
  }));

  const bookshelfMockData = {
    name: 'Bimber',
    id: 'AlsoAllah',
  };
  bookshelfQueryMock.mockImplementationOnce(() => ({
    data: bookshelfMockData,
  }));

  const element = renderTestComponent();

  const bookshelfName = (await element.findAllByText(bookshelfMockData.name))[0];
  const bookshelfId = (await element.findAllByText(bookshelfMockData.id))[0];
  const bookName = (await element.findAllByText(userBookMockData.book.title))[0];
  const bookId = (await element.findAllByText(testBookId))[0];

  expect(bookshelfName).toBeVisible();
  expect(bookshelfId).toBeVisible();
  expect(bookName).toBeVisible();
  expect(bookId).toBeVisible();
});

it('given bookshelf data changes - updates state accordingly', async () => {
  const { rerender, findAllByText } = renderTestComponent();

  expect((await findAllByText(noBookshelfNameText))[0]).toBeVisible();
  expect((await findAllByText(noBookshelfIdText))[0]).toBeVisible();

  const mockData = {
    name: 'New Bookshelf',
    id: 'NewId123',
  };

  bookshelfQueryMock.mockImplementation(() => ({
    data: mockData,
  }));

  rerender(<TestComponent></TestComponent>);

  const bookshelfName = (await findAllByText(mockData.name))[0];
  const bookshelfId = (await findAllByText(mockData.id))[0];

  expect(bookshelfName).toBeVisible();
  expect(bookshelfId).toBeVisible();
});

it('given userBook data changes - updates state accordingly', async () => {
  const { rerender, findAllByText } = renderTestComponent();

  expect((await findAllByText(noBookNameText))[0]).toBeVisible();
  expect((await findAllByText(noBookIdText))[0]).toBeVisible();

  const userBookMockData = {
    book: {
      title: 'Sialalala',
    },
  };

  errorHandledQueryMock.mockImplementationOnce(() => ({
    data: userBookMockData,
  }));

  rerender(<TestComponent></TestComponent>);

  const bookTitle = (await findAllByText(userBookMockData.book.title))[0];
  const bookId = (await findAllByText(testBookId))[0];

  expect(bookTitle).toBeVisible();
  expect(bookId).toBeVisible();
});
