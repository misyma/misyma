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

  findGenresQueryHandler: Symbol('findGenresQueryHandler'),
  findGenreByNameQueryHandler: Symbol('findGenreByNameQueryHandler'),

  bookHttpController: Symbol('bookHttpController'),
};

export const bookSymbols = {
  bookHttpController: symbols.bookHttpController,
  bookRepository: symbols.bookRepository,
};
