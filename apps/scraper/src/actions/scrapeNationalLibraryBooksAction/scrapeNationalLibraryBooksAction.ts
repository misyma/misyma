import { type NationalLibraryResponseBody } from '../../common/nationalLibraryBook.js';
import { type NationalLibraryClient } from '../../infrastructure/clients/nationalLibraryClient.js';
import { type BookDraft } from '../../infrastructure/entities/book/book.js';
import { type AuthorRepository } from '../../infrastructure/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../infrastructure/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

import { type NationalLibraryBookMapper } from './nationalLibraryBookMapper.js';

export interface ScrapeNationalLibraryBooksActionPayload {
  readonly from: number | undefined;
}

export class ScrapeNationalLibraryBooksAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly bnMapper: NationalLibraryBookMapper,
    private readonly bnClient: NationalLibraryClient,
    private readonly logger: LoggerService,
  ) {}

  public async execute(payload: ScrapeNationalLibraryBooksActionPayload): Promise<void> {
    const { from: initialFrom } = payload;

    this.logger.info({
      message: 'Scraping books from National Library API...',
      from: initialFrom,
    });

    let savedBooksCount = 0;

    let i = 0;

    let url = 'https://data.bn.org.pl/api/institutions/bibs.json?language=polski&limit=100&formOfWork=Książki';

    if (initialFrom) {
      url += `&sinceId=${initialFrom.toString()}`;
    }

    while (url) {
      const response = await this.bnClient.get<NationalLibraryResponseBody>(url);

      const bookDrafts = response.data.bibs
        .map((book) => this.bnMapper.mapBook(book))
        .filter((book) => book !== undefined);

      for (const bookDraft of bookDrafts) {
        await this.saveBook(bookDraft);
      }

      savedBooksCount += bookDrafts.length;

      i += 1;

      this.logger.info({
        message: `Processed ${(i * 100).toString()} books.`,
        url,
        savedBooks: savedBooksCount,
      });

      url = response.data.nextPage;
    }

    this.logger.info({ message: 'Scraping books National Library API completed.' });
  }

  private async saveBook(bookDraft: BookDraft): Promise<void> {
    const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

    if (existingBook) {
      return;
    }

    const authorIds: string[] = [];

    for (const authorName of bookDraft.authorNames) {
      let author = await this.authorRepository.findAuthor({ name: authorName });

      if (!author) {
        author = await this.authorRepository.create({ name: authorName });
      }

      authorIds.push(author.id);
    }

    await this.bookRepository.createBook({
      title: bookDraft.title,
      isbn: bookDraft.isbn,
      publisher: bookDraft.publisher,
      isApproved: true,
      language: bookDraft.language,
      imageUrl: bookDraft.imageUrl,
      releaseYear: bookDraft.releaseYear,
      translator: bookDraft.translator,
      pages: bookDraft.pages,
      authorIds,
      genreId: bookDraft.genreId,
    });
  }
}
