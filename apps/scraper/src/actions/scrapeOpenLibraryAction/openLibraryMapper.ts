import { Value } from '@sinclair/typebox/value';

import { BookFormat, isValidLanguage, Language } from '@common/contracts';

import { type OpenLibraryBookBinding, type OpenLibraryBook } from './openLibraryBook.js';
import { bookDraftSchema, type BookDraft } from '../../infrastructure/entities/book/book.js';

export class OpenLibraryMapper {
  public mapBook(openLibraryBook: OpenLibraryBook): BookDraft | undefined {
    const format = this.mapFormat(openLibraryBook.binding);

    const language = this.mapLanguage(openLibraryBook.language);

    const isSupportedLanguage = language === Language.English || language === Language.Polish;

    if (
      !openLibraryBook.title?.length ||
      openLibraryBook.title.length > 256 ||
      !format ||
      !openLibraryBook.isbn13 ||
      !language ||
      !isSupportedLanguage ||
      !openLibraryBook.authors?.length
    ) {
      return undefined;
    }

    const authorNames = [
      ...new Set(
        openLibraryBook.authors
          .filter((openLibraryAuthorName) => openLibraryAuthorName.length)
          .map((openLibraryAuthorName) => this.mapAuthorName(openLibraryAuthorName)),
      ),
    ];

    if (authorNames.length > 2) {
      return undefined;
    }

    const bookDraft: BookDraft = {
      title: openLibraryBook.title,
      format,
      language,
      isApproved: true,
      authorNames,
    };

    if (openLibraryBook.isbn13) {
      bookDraft.isbn = openLibraryBook.isbn13;
    }

    if (openLibraryBook.publisher) {
      bookDraft.publisher = openLibraryBook.publisher;
    }

    if (openLibraryBook.pages) {
      bookDraft.pages = openLibraryBook.pages;
    }

    if (openLibraryBook.image) {
      bookDraft.imageUrl = openLibraryBook.image;
    }

    const releaseYear = this.mapReleaseYear(openLibraryBook.date_published);

    if (releaseYear) {
      bookDraft.releaseYear = releaseYear;
    }

    return Value.Decode(bookDraftSchema, bookDraft);
  }

  private mapAuthorName(openLibraryAuthorName: string): string {
    const nameParts = openLibraryAuthorName.split(',');

    if (nameParts.length === 1) {
      return String(nameParts[0]).trim();
    }

    return `${String(nameParts[1]).trimStart()} ${String(nameParts[0])}`.trim();
  }

  private mapReleaseYear(openLibraryDatePublished: string | number | undefined): number | undefined {
    if (typeof openLibraryDatePublished === 'string') {
      return new Date(openLibraryDatePublished).getFullYear();
    } else if (typeof openLibraryDatePublished === 'number') {
      return openLibraryDatePublished;
    }

    return undefined;
  }

  private mapFormat(openLibraryFormat: OpenLibraryBookBinding | undefined): BookFormat | undefined {
    switch (openLibraryFormat) {
      case 'Paperback':
        return BookFormat.paperback;

      case 'Hardcover':
        return BookFormat.hardcover;

      case 'Kindle Edition':
        return BookFormat.ebook;

      default:
        return undefined;
    }
  }

  private mapLanguage(openLibraryLanguage: string | undefined): Language | undefined {
    if (!openLibraryLanguage) {
      return undefined;
    }

    const abbreviatedLanguage = openLibraryLanguage.toLowerCase().substring(0, 2);

    if (isValidLanguage(abbreviatedLanguage)) {
      return abbreviatedLanguage;
    }

    return undefined;
  }
}
