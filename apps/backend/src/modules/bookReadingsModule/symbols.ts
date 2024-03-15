export const symbols = {
  bookReadingRepository: Symbol('bookReadingRepository'),
  bookReadingMapper: Symbol('bookReadingMapper'),

  findBookReadingByIdQueryHandler: Symbol('findBookReadingByIdQueryHandler'),
  findBookReadingsByUserBookIdQueryHandler: Symbol('findBookReadingsByUserBookIdQueryHandler'),

  createBookReadingCommandHandler: Symbol('createBookReadingCommandHandler'),
  updateBookReadingNameCommandHandler: Symbol('updateBookReadingNameCommandHandler'),
  deleteBookReadingNameCommandHandler: Symbol('deleteBookReadingNameCommandHandler'),

  bookReadingHttpController: Symbol('bookReadingHttpController'),
};

export const bookReadingSymbols = {
  bookReadingHttpController: symbols.bookReadingHttpController,
};
