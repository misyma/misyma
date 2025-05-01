import { type Book } from '../../../../domain/entities/book/book.js';
import { type BookDto } from '../bookDto.js';

export function mapBookToDto(book: Book): BookDto {
  const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages, createdAt } =
    book.getState();

  const bookDto: BookDto = {
    id: book.getId(),
    title,
    language,
    isApproved,
    releaseYear,
    categoryId: book.getCategoryId(),
    categoryName: book.getCategoryName(),
    createdAt: createdAt.toISOString(),
    authors: book.getAuthors().map((author) => ({
      id: author.getId(),
      name: author.getName(),
      isApproved: author.getIsApproved(),
      createdAt: author.getCreatedAt().toISOString(),
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
