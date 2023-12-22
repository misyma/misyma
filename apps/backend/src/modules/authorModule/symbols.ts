export const symbols = {
  authorMapper: Symbol('authorMapper'),
  authorRepository: Symbol('authorRepository'),

  createAuthorCommandHandler: Symbol('createAuthorCommandHandler'),
  loginAuthorCommandHandler: Symbol('loginAuthorCommandHandler'),
  deleteAuthorCommandHandler: Symbol('deleteAuthorCommandHandler'),

  findAuthorQueryHandler: Symbol('findAuthorQueryHandler'),
  findAuthorsByIdsQueryHandler: Symbol('findAuthorsByIdsQueryHandler'),

  authorHttpController: Symbol('authorHttpController'),
};

export const authorSymbols = {
  authorHttpController: symbols.authorHttpController,
  findAuthorsByIdsQueryHandler: symbols.findAuthorsByIdsQueryHandler,
};
