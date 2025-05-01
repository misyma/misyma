import { type Book } from '../../../../domain/entities/book/book.js';
import { type BookDto } from '../bookDto.js';

export function mapBookToDto(book: Book): BookDto {
  const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
    book.getState();

  const bookDto: BookDto = {
    id: book.getId(),
    title,
    language,
    isApproved,
    releaseYear,
    categoryId: book.getCategoryId(),
    categoryName: book.getCategoryName(),
    authors: book.getAuthors().map((author) => ({
      id: author.getId(),
      name: author.getName(),
      isApproved: author.getIsApproved(),
    })),
  };

  if (isbn) {
    bookDto.isbn = isbn;
  }

  if (publisher) {
    bookDto.publisher = publisher;
  }

  if (translator) {
    bookDto.translator = translator;
  }

  if (pages) {
    bookDto.pages = pages;
  }

  if (imageUrl) {
    bookDto.imageUrl = imageUrl;
  }

  if (format) {
    bookDto.format = format;
  }

  return bookDto;
}
