import { Value } from '@sinclair/typebox/value';

import { BookFormat, Language } from '@common/contracts';

import { type EIsbnProductID, type EIsbnBook } from './eisbnBook.js';
import { bookDraftSchema, type BookDraft } from '../../infrastructure/entities/book/book.js';

export class EIsbnMapper {
  public mapBook(eisbnBook: EIsbnBook): BookDraft | undefined {
    try {
      const format = this.mapFormat(eisbnBook.DescriptiveDetail.ProductForm);

      const language = this.mapLanguage(eisbnBook.DescriptiveDetail.Language?.LanguageCode);

      let isbnEntry: EIsbnProductID | undefined;

      if (Array.isArray(eisbnBook.ProductIdentifier)) {
        isbnEntry = eisbnBook.ProductIdentifier.find((productIdentifier) => productIdentifier.ProductIDType === 15);
      } else {
        isbnEntry = eisbnBook.ProductIdentifier.ProductIDType === 15 ? eisbnBook.ProductIdentifier : undefined;
      }

      if (!isbnEntry) {
        return undefined;
      }

      const title = Array.isArray(eisbnBook.DescriptiveDetail.TitleDetail)
        ? eisbnBook.DescriptiveDetail.TitleDetail[0]?.TitleElement?.TitleText
        : eisbnBook.DescriptiveDetail.TitleDetail?.TitleElement?.TitleText;

      const isbn = String(isbnEntry.IDValue);

      let authorNames: string[] = [];

      let translator: string | undefined;

      if (Array.isArray(eisbnBook.DescriptiveDetail.Contributor)) {
        authorNames = eisbnBook.DescriptiveDetail.Contributor.filter(
          (contributor) => contributor.ContributorRole === 'A01' && contributor.PersonNameInverted !== undefined,
        )
          .map((contributor) => this.mapAuthorName(contributor.PersonNameInverted!))
          .filter((authorName) => authorName !== undefined);

        const foundTranslator = eisbnBook.DescriptiveDetail.Contributor.find(
          (contributor) => contributor.ContributorRole === 'B06' && contributor.PersonNameInverted !== undefined,
        )?.PersonNameInverted;

        if (foundTranslator) {
          translator = this.mapAuthorName(foundTranslator);
        }
      } else if (
        eisbnBook.DescriptiveDetail.Contributor &&
        eisbnBook.DescriptiveDetail.Contributor.ContributorRole === 'A01' &&
        eisbnBook.DescriptiveDetail.Contributor.PersonNameInverted
      ) {
        authorNames = [this.mapAuthorName(eisbnBook.DescriptiveDetail.Contributor.PersonNameInverted)].filter(
          (authorName) => authorName !== undefined,
        );
      }

      let releaseYear: number | undefined;

      if (Array.isArray(eisbnBook.PublishingDetail?.PublishingDate)) {
        releaseYear = this.mapReleaseYear(eisbnBook.PublishingDetail.PublishingDate[0]?.Date);
      } else {
        releaseYear = this.mapReleaseYear(eisbnBook.PublishingDetail?.PublishingDate.Date);
      }

      const publisher = eisbnBook.PublishingDetail?.Publisher.PublisherName;

      const imageUrl = eisbnBook.CollateralDetail?.SupportingResource?.ResourceVersion?.ResourceLink;

      const bookDraftInput: Partial<BookDraft> = {
        isApproved: true,
        authorNames,
      };

      if (title) {
        bookDraftInput.title = title;
      }

      if (format) {
        bookDraftInput.format = format;
      }

      if (language) {
        bookDraftInput.language = language;
      }

      if (isbn) {
        bookDraftInput.isbn = isbn;
      }

      if (publisher) {
        bookDraftInput.publisher = publisher;
      }

      if (releaseYear) {
        bookDraftInput.releaseYear = releaseYear;
      }

      if (translator) {
        bookDraftInput.translator = translator;
      }

      if (imageUrl) {
        bookDraftInput.imageUrl = imageUrl;
      }

      return Value.Decode(bookDraftSchema, bookDraftInput);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: 'Book mapping error.',
          eisbnBook,
          error,
        }),
      );

      throw error;
    }
  }

  private mapAuthorName(eIsbnAuthorName: string | number): string | undefined {
    if (typeof eIsbnAuthorName === 'number') {
      return undefined;
    }

    const nameParts = eIsbnAuthorName.split(',');

    if (nameParts.length === 1) {
      return String(nameParts[0]).trim();
    }

    return `${String(nameParts[1]).trimStart()} ${String(nameParts[0])}`.trim();
  }

  private mapReleaseYear(eIsbnPublishedDate: number | undefined): number | undefined {
    if (eIsbnPublishedDate !== undefined) {
      const dateStr = eIsbnPublishedDate.toString();

      if (dateStr.length === 8) {
        return parseInt(dateStr.substring(0, 4), 10);
      }
    }

    return undefined;
  }

  private mapFormat(eIsbnBookFormat: string | undefined): BookFormat | undefined {
    switch (eIsbnBookFormat) {
      case 'BC':
        return BookFormat.paperback;

      case 'BB':
        return BookFormat.hardcover;

      default:
        return undefined;
    }
  }

  private mapLanguage(eIsbnBookLanguage: string | undefined): Language | undefined {
    if (eIsbnBookLanguage === 'pol') {
      return Language.Polish;
    }

    return undefined;
  }
}
