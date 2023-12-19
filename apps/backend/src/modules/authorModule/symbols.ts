export const symbols = {
  authorMapper: Symbol('authorMapper'),
  authorRepository: Symbol('authorRepository'),
  createAuthorCommandHandler: Symbol('createAuthorCommandHandler'),
  loginAuthorCommandHandler: Symbol('loginAuthorCommandHandler'),
  deleteAuthorCommandHandler: Symbol('deleteAuthorCommandHandler'),
  findAuthorQueryHandler: Symbol('findAuthorQueryHandler'),
  authorHttpController: Symbol('authorHttpController'),
};

export const authorSymbols = {
  authorHttpController: symbols.authorHttpController,
};
