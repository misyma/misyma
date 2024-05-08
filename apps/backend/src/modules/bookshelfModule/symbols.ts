export const symbols = {
  bookshelfMapper: Symbol('bookshelfMapper'),
  bookshelfRepository: Symbol('bookshelfRepository'),
  findBookshelfByIdQueryHandler: Symbol('findBookshelfByIdQueryHandler'),
  findBookshelvesByUserIdQueryHandler: Symbol('findBookshelvesByUserIdQueryHandler'),
  createBookshelfCommandHandler: Symbol('createBookshelfCommandHandler'),
  updateBookshelfCommandHandler: Symbol('updateBookshelfCommandHandler'),
  deleteBookshelfCommandHandler: Symbol('deleteBookshelfCommandHandler'),
  bookshelfHttpController: Symbol('bookshelfHttpController'),
};

export const bookshelfSymbols = {
  bookshelfRepository: symbols.bookshelfRepository,
  createBookshelfCommandHandler: symbols.createBookshelfCommandHandler,
  bookshelfHttpController: symbols.bookshelfHttpController,
};
