/* eslint-disable @typescript-eslint/no-explicit-any */

import { Value } from '@sinclair/typebox/value';

import { BookFormat, Language } from '@common/contracts';

import { type NationalLibraryBook } from '../../common/nationalLibraryBook.js';
import { bookDraftSchema, type BookDraft } from '../../infrastructure/entities/book/book.js';

export class NationalLibraryBookMapper {
  public mapBook(nationalLibraryBook: NationalLibraryBook): BookDraft | undefined {
    const marcFields = nationalLibraryBook.marc.fields;

    const getField = (tag: string): any => marcFields.find((f: any) => f[tag]);

    const getSubfield = (tag: string, code: string): any => {
      const field = getField(tag);
      return field ? field[tag].subfields.find((sf: any) => sf[code])?.[code] : undefined;
    };

    const titleRaw = nationalLibraryBook.title;
    const authorRaw = getSubfield('100', 'a');
    const translatorRaw = getSubfield('700', 'a');
    const publisherRaw = getSubfield('260', 'b');
    const releaseYearRaw = getSubfield('260', 'c');
    const isbn = getSubfield('020', 'a');
    const pagesRaw = getSubfield('300', 'a');
    let pages;

    if (pagesRaw) {
      const pagesMatch = pagesRaw.match(/\d+/);

      if (pagesMatch) {
        pages = parseInt(pagesMatch[0], 10);
      }
    }

    if (!authorRaw || !titleRaw || !pages || !isbn) {
      return undefined;
    }

    const authorNameParts = authorRaw.split(',');

    let authorName;

    if (authorNameParts.length === 1) {
      authorName = authorNameParts[0].trim();
    } else {
      authorName = authorNameParts[1].trim() + ' ' + authorNameParts[0].trim();
    }

    const title = titleRaw.split(' /')[0]?.trim();

    const bookDraftInput: Partial<BookDraft> = {
      title: title as string,
      isApproved: true,
      language: Language.Polish,
      format: BookFormat.paperback,
      authorNames: [authorName],
      pages: pages as number,
    };

    try {
      if (isbn) {
        bookDraftInput.isbn = isbn;
      }

      if (publisherRaw) {
        bookDraftInput.publisher = publisherRaw
          .replace(/"/g, '')
          .replace(/[.,;:!?]+$/, '')
          .trim();
      }

      if (releaseYearRaw) {
        const releaseYearMatch = releaseYearRaw.match(/\d{4}/);

        if (releaseYearMatch) {
          bookDraftInput.releaseYear = parseInt(releaseYearMatch[0], 10);
        }
      }

      if (translatorRaw) {
        const translatorNameParts = translatorRaw.split(',');

        let translatorName;

        if (translatorNameParts.length === 1) {
          translatorName = translatorNameParts[0].trim();
        } else {
          translatorName = translatorNameParts[1].trim() + ' ' + translatorNameParts[0].trim();
        }

        bookDraftInput.translator = translatorName;
      }

      if (!Value.Check(bookDraftSchema, bookDraftInput)) {
        return undefined;
      }

      return bookDraftInput;
    } catch (error) {
      console.error(
        JSON.stringify({
          message: 'Book mapping error.',
          bnBook: nationalLibraryBook,
          error,
        }),
      );

      throw error;
    }
  }
}
