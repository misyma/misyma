export const symbols = {
  authorMapper: Symbol('authorMapper'),
  authorRepository: Symbol('authorRepository'),

  createAuthorCommandHandler: Symbol('createAuthorCommandHandler'),
  loginAuthorCommandHandler: Symbol('loginAuthorCommandHandler'),
  deleteAuthorCommandHandler: Symbol('deleteAuthorCommandHandler'),

  findAuthorQueryHandler: Symbol('findAuthorQueryHandler'),
  findAuthorsByIdsQueryHandler: Symbol('findAuthorsByIdsQueryHandler'),
  findAuthorsQueryHandler: Symbol('findAuthorsQueryHandler'),

  authorHttpController: Symbol('authorHttpController'),
  authorAdminHttpController: Symbol('authorAdminHttpController'),
};

export const authorSymbols = {
  authorHttpController: symbols.authorHttpController,
  authorAdminHttpController: symbols.authorAdminHttpController,
  findAuthorsByIdsQueryHandler: symbols.findAuthorsByIdsQueryHandler,
};
