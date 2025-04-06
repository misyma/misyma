import { type NationalLibraryResponseBody } from './nationalLibraryBook.js';
import { type NationalLibraryClient } from '../../infrastructure/clients/nationalLibraryClient.js';
import { type Author } from '../../infrastructure/entities/author/author.js';
import { type BookDraft } from '../../infrastructure/entities/book/book.js';
import { type AuthorRepository } from '../../infrastructure/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../infrastructure/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

import { type NationalLibraryBookMapper } from './nationalLibraryBookMapper.js';

export interface ScrapeNationalLibraryBooksActionPayload {
  readonly from: number | undefined;
}

export class ScrapeNationalLibraryBooksAction {
  private readonly batchSize = 100;

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

    let url = `https://data.bn.org.pl/api/institutions/bibs.json?language=polski&limit=${this.batchSize.toString()}&formOfWork=Książki`;

    if (initialFrom) {
      url += `&sinceId=${initialFrom.toString()}`;
    }

    while (url) {
      const response = await this.bnClient.get<NationalLibraryResponseBody>(url);

      const bookDrafts = response.data.bibs
        .map((book) => this.bnMapper.mapBook(book))
        .filter((book) => book !== undefined);

      const authorNames = bookDrafts.flatMap((bookDraft) => bookDraft.authorNames);

      const uniqueAuthorNames = Array.from(new Set(authorNames));

      const persistedAuthors = await Promise.all(
        uniqueAuthorNames.map(async (authorName) => this.saveAuthor(authorName)),
      );

      const authorsMapping = new Map<string, Author>();

      persistedAuthors.forEach((author) => {
        authorsMapping.set(author.name, author);
      });

      await Promise.all(
        bookDrafts.map(async (bookDraft) => {
          const authorIds = bookDraft.authorNames.map((authorName) => {
            const author = authorsMapping.get(authorName);

            if (!author) {
              throw new Error(`Author ${authorName} not found`);
            }

            return author.id;
          });

          await this.saveBook(bookDraft, authorIds);
        }),
      );

      savedBooksCount += bookDrafts.length;

      i += 1;

      this.logger.info({
        message: `Processed ${(i * this.batchSize).toString()} books.`,
        url,
        savedBooks: savedBooksCount,
      });

      url = response.data.nextPage;
    }

    this.logger.info({ message: 'Scraping books National Library API completed.' });
  }

  private async saveAuthor(authorName: string): Promise<Author> {
    const existingAuthor = await this.authorRepository.findAuthor({ name: authorName });

    if (existingAuthor) {
      return existingAuthor;
    }

    const author = await this.authorRepository.create({ name: authorName });

    return author;
  }

  private async saveBook(bookDraft: BookDraft, authorIds: string[]): Promise<void> {
    const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

    if (existingBook) {
      return;
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
