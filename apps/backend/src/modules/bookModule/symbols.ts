export const symbols = {
  bookMapper: Symbol('bookMapper'),
  bookRepository: Symbol('bookRepository'),
  createBookCommandHandler: Symbol('createBookCommandHandler'),
  loginBookCommandHandler: Symbol('loginBookCommandHandler'),
  deleteBookCommandHandler: Symbol('deleteBookCommandHandler'),
  findBookQueryHandler: Symbol('findBookQueryHandler'),
  bookHttpController: Symbol('bookHttpController'),
};

export const bookSymbols = {
  bookHttpController: symbols.bookHttpController,
};
