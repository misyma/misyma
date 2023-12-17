export const symbols = {
  bookMapper: Symbol('bookMapper'),
  bookRepository: Symbol('bookRepository'),
  createBookCommandHandler: Symbol('createBookCommandHandler'),
  loginBookCommandHandler: Symbol('loginBookCommandHandler'),
  deleteBookCommandHandler: Symbol('deleteBookCommandHandler'),
  findBookQueryHandler: Symbol('findBookQueryHandler'),
  bookHttpController: Symbol('bookHttpController'),

  authorMapper: Symbol('authorMapper'),
  authorRepository: Symbol('authorRepository'),
  createAuthorCommandHandler: Symbol('createAuthorCommandHandler'),
  loginAuthorCommandHandler: Symbol('loginAuthorCommandHandler'),
  deleteAuthorCommandHandler: Symbol('deleteAuthorCommandHandler'),
  findAuthorQueryHandler: Symbol('findAuthorQueryHandler'),
  authorHttpController: Symbol('authorHttpController'),
};

export const bookSymbols = {
  bookHttpController: symbols.bookHttpController,
  authorHttpController: symbols.authorHttpController,
};
