export const ApiPaths = {
  users: {
    path: '/users',
    ['$userId']: {
      path: '/users/{{userId}}',
      pathParam: {
        userId: '{{userId}}',
      },
    },
    token: {
      path: '/users/token',
    },
    me: {
      path: '/users/me',
    },
    changePassword: {
      path: '/users/change-password',
    },
  },
  quotes: {
    path: '/quotes',
    ['$quoteId']: {
      path: '/quotes/{{quoteId}}',
      params: {
        quoteId: '{{quoteId}}',
      },
    },
  },
  genres: {
    path: '/genres',
  },
  bookshelves: {
    path: '/bookshelves',
    ['$bookshelfId']: {
      path: '/bookshelves/{{bookshelfId}}',
      params: {
        bookshelfId: '{{bookshelfId}}',
      },
      images: {
        path: '/bookshelves/{{bookshelfId}}/images',
      },
    },
  },
  userBooks: {
    path: '/user-books',
    ['$userBookId']: {
      path: '/user-books/{{userBookId}}',
      params: {
        userBookId: '{{userBookId}}',
      },
      readings: {
        path: '/user-books/{{userBookId}}/readings',
        ['$readingId']: {
          path: '/user-books/{{userBookId}}/readings/{{readingId}}',
          params: {
            readingId: '{{readingId}}',
          },
        },
      },
    },
  },
  books: {
    path: '/books',
  },
  admin: {
    path: '/admin',
    bookChangeRequest: {
      path: '/admin/book-change-requests',
    },
    books: {
      path: '/admin/books',
      bookId: {
        path: '/admin/books/{{bookId}}',
      },
    },
  },
};
