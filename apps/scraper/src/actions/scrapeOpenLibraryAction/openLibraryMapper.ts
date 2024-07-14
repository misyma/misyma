import { type BookDraft } from './bookDraft.js';
import { type OpenLibraryBookBinding, type OpenLibraryBook } from './openLibraryBook.js';
import { BookFormat } from '../../infrastructure/entities/book/bookFormat.js';
import { isValidLanguage, Language } from '../../infrastructure/entities/book/language.js';

export class OpenLibraryMapper {
  public mapBook(openLibraryBook: OpenLibraryBook): BookDraft | undefined {
    if (!openLibraryBook.authors || !openLibraryBook.authors.length || !openLibraryBook.title) {
      return undefined;
    }

    const authorNames = openLibraryBook.authors
      .filter((openLibraryAuthorName) => openLibraryAuthorName.length)
      .map((openLibraryAuthorName) => this.mapAuthorName(openLibraryAuthorName));

    const language = this.mapLanguage(openLibraryBook.language);

    const format = this.mapFormat(openLibraryBook.binding);

    const releaseYear = this.mapReleaseYear(openLibraryBook.date_published);

    return {
      title: openLibraryBook.title,
      isbn: openLibraryBook.isbn13,
      publisher: openLibraryBook.publisher?.length ? openLibraryBook.publisher : undefined,
      format,
      isApproved: true,
      language,
      imageUrl: openLibraryBook.image?.length ? openLibraryBook.image : undefined,
      pages: openLibraryBook.pages || undefined,
      releaseYear: releaseYear || undefined,
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
        return BookFormat.paperback;
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
