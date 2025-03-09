export const ApiPaths = {
  users: {
    path: '/users' as const,
    ['$userId']: {
      path: '/users/{{userId}}' as const,
      pathParam: {
        userId: '{{userId}}',
      },
    },
    token: {
      path: '/users/token' as const,
    },
    me: {
      path: '/users/me' as const,
    },
    changePassword: {
      path: '/users/change-password' as const,
    },
  },
  quotes: {
    path: '/quotes' as const,
    ['$quoteId']: {
      path: '/quotes/{{quoteId}}' as const,
      params: {
        quoteId: '{{quoteId}}',
      },
    },
  },
  genres: {
    path: '/genres' as const,
  },
  bookshelves: {
    path: '/bookshelves' as const,
    ['$bookshelfId']: {
      path: '/bookshelves/{{bookshelfId}}' as const,
      params: {
        bookshelfId: '{{bookshelfId}}',
      },
      images: {
        path: '/bookshelves/{{bookshelfId}}/images' as const,
      },
    },
  },
  userBooks: {
    path: '/user-books' as const,
    ['$userBookId']: {
      path: '/user-books/{{userBookId}}' as const,
      params: {
        userBookId: '{{userBookId}}',
      },
      readings: {
        path: '/user-books/{{userBookId}}/readings' as const,
        ['$readingId']: {
          path: '/user-books/{{userBookId}}/readings/{{readingId}}' as const,
          params: {
            readingId: '{{readingId}}',
          },
        },
      },
    },
  },
  books: {
    path: '/books' as const,
  },
  admin: {
    path: '/admin' as const,
    bookChangeRequest: {
      path: '/admin/book-change-requests' as const,
    },
    books: {
      path: '/admin/books' as const,
      bookId: {
        path: '/admin/books/{{bookId}}' as const,
      },
    },
    authors: {
      path: '/admin/authors' as const,
    },
  },
  authors: {
    path: '/authors' as const,
  },
};
