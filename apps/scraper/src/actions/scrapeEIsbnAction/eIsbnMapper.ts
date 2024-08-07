import { BookFormat, Language } from '@common/contracts';

import { type EIsbnProductID, type EIsbnBook } from './eisbnBook.js';
import { type BookDraft } from '../../infrastructure/entities/book/book.js';

export class EIsbnMapper {
  public mapBook(eisbnBook: EIsbnBook): BookDraft | undefined {
    const format = this.mapFormat(eisbnBook.DescriptiveDetail.ProductForm);

    const language = this.mapLanguage(eisbnBook.DescriptiveDetail.Language.LanguageCode);

    let isbnEntry: EIsbnProductID | undefined;

    if (Array.isArray(eisbnBook.ProductIdentifier)) {
      isbnEntry = eisbnBook.ProductIdentifier.find((productIdentifier) => productIdentifier.ProductIDType === 15);
    } else {
      isbnEntry = eisbnBook.ProductIdentifier.ProductIDType === 15 ? eisbnBook.ProductIdentifier : undefined;
    }

    if (!isbnEntry) {
      return undefined;
    }

    const title = eisbnBook.DescriptiveDetail.TitleDetail.TitleElement.TitleText;

    const isbn = String(isbnEntry.IDValue);

    const authorNames = Array.isArray(eisbnBook.DescriptiveDetail.Contributor)
      ? eisbnBook.DescriptiveDetail.Contributor.map((contributor) => this.mapAuthorName(contributor.PersonNameInverted))
      : [this.mapAuthorName(eisbnBook.DescriptiveDetail.Contributor.PersonNameInverted)];

    if (title.length > 256 || !format || !language || !authorNames.length) {
      return undefined;
    }

    const releaseYear = this.mapReleaseYear(
      Array.isArray(eisbnBook.PublishingDetail.PublishingDate)
        ? eisbnBook.PublishingDetail.PublishingDate[0]?.Date
        : eisbnBook.PublishingDetail.PublishingDate.Date,
    );

    const publisher = eisbnBook.PublishingDetail.Publisher.PublisherName;

    const imageUrl = eisbnBook.CollateralDetail?.SupportingResource?.ResourceVersion?.ResourceLink;

    return {
      title,
      isbn,
      publisher: publisher.length && publisher.length < 128 ? publisher : undefined,
      format,
      language,
      imageUrl: imageUrl ?? undefined,
      pages: undefined,
      releaseYear,
      authorNames: authorNames.slice(0, 1),
      translator: undefined,
      isApproved: true,
    };
  }

  private mapAuthorName(openLibraryAuthorName: string): string {
    const nameParts = openLibraryAuthorName.split(',');

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

  private mapFormat(eIsbnBookFormat: string): BookFormat | undefined {
    switch (eIsbnBookFormat) {
      case 'BC':
        return BookFormat.paperback;

      case 'BB':
        return BookFormat.hardcover;

      default:
        return undefined;
    }
  }

  private mapLanguage(eIsbnBookLanguage: string): Language | undefined {
    if (eIsbnBookLanguage === 'eng') {
      return Language.English;
    } else if (eIsbnBookLanguage === 'pol') {
      return Language.Polish;
    }

    return undefined;
  }
}
