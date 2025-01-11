export const symbols = {
  bookshelfMapper: Symbol('bookshelfMapper'),
  bookshelfRepository: Symbol('bookshelfRepository'),
  findBookshelfByIdQueryHandler: Symbol('findBookshelfByIdQueryHandler'),
  findBookshelvesByUserIdQueryHandler: Symbol('findBookshelvesByUserIdQueryHandler'),
  createBookshelfCommandHandler: Symbol('createBookshelfCommandHandler'),
  updateBookshelfCommandHandler: Symbol('updateBookshelfCommandHandler'),
  uploadBookshelfImageCommandHandler: Symbol('uploadBookshelfImageCommandHandler'),
  deleteBookshelfCommandHandler: Symbol('deleteBookshelfCommandHandler'),
  bookshelfHttpController: Symbol('bookshelfHttpController'),
};

export const bookshelfSymbols = {
  bookshelfRepository: symbols.bookshelfRepository,
  createBookshelfCommandHandler: symbols.createBookshelfCommandHandler,
  bookshelfHttpController: symbols.bookshelfHttpController,
};
