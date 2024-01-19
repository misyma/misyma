export const symbols = {
  bookshelfRepository: Symbol('bookshelfRepository'),
  bookshelfUserRepository: Symbol('bookshelfUserRepository'),

  bookshelfMapper: Symbol('bookshelfMapper'),

  findBookshelfByIdQueryHandler: Symbol('findBookshelfByIdQueryHandler'),
  findBookshelvesByUserIdQueryHandler: Symbol('findBookshelvesByUserIdQueryHandler'),

  createBookshelfCommandHandler: Symbol('createBookshelfCommandHandler'),
  updateBookshelfNameCommandHandler: Symbol('updateBookshelfNameCommandHandler'),
};

export const bookSymbols = {};
