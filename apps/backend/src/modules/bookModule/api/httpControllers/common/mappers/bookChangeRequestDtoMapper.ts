import { type BookChangeRequest } from '../../../../domain/entities/bookChangeRequest/bookChangeRequest.js';
import { type BookChangeRequestDto } from '../bookChangeRequestDto.js';

export function mapBookChangeRequestToDto(bookChangeRequest: BookChangeRequest): BookChangeRequestDto {
  const {
    title,
    language,
    format,
    imageUrl,
    isbn,
    publisher,
    releaseYear,
    translator,
    pages,
    bookId,
    createdAt,
    userEmail,
    authorIds,
    bookTitle,
    changedFields,
  } = bookChangeRequest.getState();

  const bookChangeRequestDto: BookChangeRequestDto = {
    id: bookChangeRequest.getId(),
    bookId,
    userEmail,
    createdAt: createdAt.toISOString(),
    bookTitle: bookTitle as string,
    changedFields,
  };

  if (authorIds) {
    bookChangeRequestDto.authorIds = authorIds;
  }

  if (isbn) {
    bookChangeRequestDto.isbn = isbn;
  }

  if (publisher) {
    bookChangeRequestDto.publisher = publisher;
  }

  if (releaseYear) {
    bookChangeRequestDto.releaseYear = releaseYear;
  }

  if (translator) {
    bookChangeRequestDto.translator = translator;
  }

  if (pages) {
    bookChangeRequestDto.pages = pages;
  }

  if (imageUrl) {
    bookChangeRequestDto.imageUrl = imageUrl;
  }

  if (title) {
    bookChangeRequestDto.title = title;
  }

  if (language) {
    bookChangeRequestDto.language = language;
  }

  if (format) {
    bookChangeRequestDto.format = format;
  }

  return bookChangeRequestDto;
}
