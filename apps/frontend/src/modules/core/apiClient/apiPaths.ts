const UserPaths = {
  path: '/users' as const,
  ['$userId']: {
    path: '/users/{{userId}}' as const,
    pathParam: {
      userId: '{{userId}}',
    },
    logout: {
      path: '/users/{{userId}}/logout' as const,
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
  login: {
    path: '/users/login' as const,
  },
  register: {
    path: '/users/register' as const,
  },
  resetPassword: {
    path: '/users/reset-password' as const,
  },
  sendVerificationEmail: {
    path: '/users/send-verification-email' as const,
  },
  verifyEmail: {
    path: '/users/verify-email',
  },
} as const;

Object.freeze(UserPaths);

const UserBooksPaths = {
  path: '/user-books' as const,
  $userBookId: {
    path: '/user-books/{{userBookId}}' as const,
    readings: {
      path: '/user-books/{{userBookId}}/readings' as const,
      $readingId: {
        path: '/user-books/{{userBookId}}/readings/{{readingId}}' as const,
      },
    },
  },
} as const;

Object.freeze(UserBooksPaths);

export const ApiPaths = {
  users: UserPaths,
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
      images: {
        path: '/bookshelves/{{bookshelfId}}/images' as const,
      },
    },
  },
  userBooks: UserBooksPaths,
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

Object.freeze(ApiPaths);
