export const symbols = {
  bookMapper: Symbol('bookMapper'),
  bookRepository: Symbol('bookRepository'),
  createBookCommandHandler: Symbol('createBookCommandHandler'),
  deleteBookCommandHandler: Symbol('deleteBookCommandHandler'),
  updateBookGenresCommandHandler: Symbol('updateBookGenresCommandHandler'),
  findBookQueryHandler: Symbol('findBookQueryHandler'),
  findBooksQueryHandler: Symbol('findBooksQueryHandler'),
  bookHttpController: Symbol('bookHttpController'),

  genreRepository: Symbol('genreRepository'),
  genreMapper: Symbol('genreMapper'),
  createGenreCommandHandler: Symbol('createGenreCommandHandler'),
  updateGenreNameCommandHandler: Symbol('updateGenreNameCommandHandler'),
  deleteGenreCommandHandler: Symbol('deleteGenreCommandHandler'),
  findGenresQueryHandler: Symbol('findGenresQueryHandler'),
  findGenreByNameQueryHandler: Symbol('findGenreByNameQueryHandler'),
  findGenreByIdQueryHandler: Symbol('findGenreByIdQueryHandler'),
  genreHttpController: Symbol('genreHttpController'),
  genreAdminHttpController: Symbol('genreAdminHttpController'),

  userBookMapper: Symbol('userBookMapper'),
  userBookRepository: Symbol('userBookRepository'),
  createUserBookCommandHandler: Symbol('createUserBookCommandHandler'),
  deleteUserBookCommandHandler: Symbol('deleteUserBookCommandHandler'),
  updateUserBookCommandHandler: Symbol('updateUserBookCommandHandler'),
  findUserBookQueryHandler: Symbol('findUserBookQueryHandler'),
  findUserBooksQueryHandler: Symbol('findUserBooksQueryHandler'),
  userBookHttpController: Symbol('userBookHttpController'),
};

export const bookSymbols = {
  bookHttpController: symbols.bookHttpController,
  userBookHttpController: symbols.userBookHttpController,
  bookRepository: symbols.bookRepository,
  userBookRepository: symbols.userBookRepository,
  genreHttpController: symbols.genreHttpController,
  genreAdminHttpController: symbols.genreAdminHttpController,
};
