import { BookFormat, isValidLanguage, Language, type ImportBookRequestBody } from '@common/contracts';

import { type OpenLibraryBookBinding, type OpenLibraryBook } from './openLibraryBook.js';

export class OpenLibraryMapper {
  public mapBook(openLibraryBook: OpenLibraryBook): ImportBookRequestBody | undefined {
    if (!openLibraryBook.title?.length || openLibraryBook.title.length > 256) {
      return undefined;
    }

    const authorNames = openLibraryBook.authors?.length
      ? [
          ...new Set(
            openLibraryBook.authors
              .filter((openLibraryAuthorName) => openLibraryAuthorName.length)
              .map((openLibraryAuthorName) => this.mapAuthorName(openLibraryAuthorName)),
          ),
        ]
      : ['Unknown'];

    const language = this.mapLanguage(openLibraryBook.language);

    const format = this.mapFormat(openLibraryBook.binding);

    const releaseYear = this.mapReleaseYear(openLibraryBook.date_published);

    return {
      title: openLibraryBook.title,
      isbn: openLibraryBook.isbn13,
      publisher:
        openLibraryBook.publisher?.length && openLibraryBook.publisher.length < 128
          ? openLibraryBook.publisher
          : undefined,
      format,
      language,
      imageUrl: openLibraryBook.image?.length ? openLibraryBook.image : undefined,
      pages: openLibraryBook.pages && openLibraryBook.pages < 5000 ? openLibraryBook.pages : undefined,
      releaseYear: releaseYear && releaseYear < 2100 ? releaseYear : undefined,
      authorNames,
      translator: undefined,
    };
  }

  private mapAuthorName(openLibraryAuthorName: string): string {
    const nameParts = openLibraryAuthorName.split(',');

    if (nameParts.length === 1) {
      return String(nameParts[0]).trim();
    }

    return `${String(nameParts[1]).trimStart()} ${String(nameParts[0])}`;
  }

  private mapReleaseYear(openLibraryDatePublished: string | number | undefined): number | undefined {
    if (typeof openLibraryDatePublished === 'string') {
      return new Date(openLibraryDatePublished).getFullYear();
    } else if (typeof openLibraryDatePublished === 'number') {
      return openLibraryDatePublished;
    }

    return undefined;
  }

  private mapFormat(openLibraryFormat: OpenLibraryBookBinding | undefined): BookFormat {
    switch (openLibraryFormat) {
      case 'Paperback':
        return BookFormat.paperback;

      case 'Hardcover':
        return BookFormat.hardcover;

      case 'Kindle Edition':
        return BookFormat.ebook;

      default:
        return BookFormat.unknown;
    }
  }

  private mapLanguage(openLibraryLanguage: string | undefined): Language {
    if (!openLibraryLanguage) {
      return Language.English;
    }

    const abbreviatedLanguage = openLibraryLanguage.toLowerCase().substring(0, 2);

    if (isValidLanguage(abbreviatedLanguage)) {
      return abbreviatedLanguage;
    }

    return Language.English;
  }
}
