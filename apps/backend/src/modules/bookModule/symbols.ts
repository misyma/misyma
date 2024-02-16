export const symbols = {
  bookMapper: Symbol('bookMapper'),
  bookRepository: Symbol('bookRepository'),

  createBookCommandHandler: Symbol('createBookCommandHandler'),
  loginBookCommandHandler: Symbol('loginBookCommandHandler'),
  deleteBookCommandHandler: Symbol('deleteBookCommandHandler'),

  findBookQueryHandler: Symbol('findBookQueryHandler'),

  genreRepository: Symbol('genreRepository'),
  genreMapper: Symbol('genreMapper'),

  createGenreCommandHandler: Symbol('createGenreCommandHandler'),
  updateGenreNameCommandHandler: Symbol('updateGenreNameCommandHandler'),
  deleteGenreCommandHandler: Symbol('deleteGenreCommandHandler'),

  findGenresQueryHandler: Symbol('findGenresQueryHandler'),
  findGenreByNameQueryHandler: Symbol('findGenreByNameQueryHandler'),

  bookHttpController: Symbol('bookHttpController'),
  genreHttpController: Symbol('genreHttpController'),
  genreAdminHttpController: Symbol('genreAdminHttpController'),
};

export const bookSymbols = {
  bookHttpController: symbols.bookHttpController,
  bookRepository: symbols.bookRepository,
  genreHttpController: symbols.genreHttpController,
  genreAdminHttpController: symbols.genreAdminHttpController,
};
