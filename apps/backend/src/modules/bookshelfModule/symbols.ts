export const symbols = {
  bookshelfRepository: Symbol('bookshelfRepository'),

  bookshelfMapper: Symbol('bookshelfMapper'),

  findBookshelfByIdQueryHandler: Symbol('findBookshelfByIdQueryHandler'),
  findBookshelvesByUserIdQueryHandler: Symbol('findBookshelvesByUserIdQueryHandler'),

  createBookshelfCommandHandler: Symbol('createBookshelfCommandHandler'),
  updateBookshelfCommandHandler: Symbol('updateBookshelfCommandHandler'),

  bookshelfHttpController: Symbol('bookshelfHttpController'),
};

export const bookshelfSymbols = {
  bookshelfRepository: symbols.bookshelfRepository,
  bookshelfHttpController: symbols.bookshelfHttpController,
};
