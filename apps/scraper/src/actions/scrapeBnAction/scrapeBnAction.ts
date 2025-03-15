import { type BnResponseBody } from './bnBook.js';
import { type BnMapper } from './bnMapper.js';
import { type BnClient } from '../../infrastructure/clients/bnClient.js';
import { type BookDraft } from '../../infrastructure/entities/book/book.js';
import { type AuthorRepository } from '../../infrastructure/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../infrastructure/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export interface ScrapeBnActionPayload {
  readonly from: number | undefined;
}

export class ScrapeBnAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly bnMapper: BnMapper,
    private readonly bnClient: BnClient,
    private readonly logger: LoggerService,
  ) {}

  public async execute(payload: ScrapeBnActionPayload): Promise<void> {
    const { from: initialFrom } = payload;

    this.logger.info({
      message: 'Scraping BN...',
      from: initialFrom,
    });

    let savedBooksCount = 0;

    let i = 0;

    let url = 'https://data.bn.org.pl/api/institutions/bibs.json?language=polski&limit=100&formOfWork=Książki';

    if (initialFrom) {
      url += `&sinceId=${initialFrom}`;
    }

    while (url) {
      const response = await this.bnClient.get<BnResponseBody>(url);

      const bookDrafts = response.data.bibs
        .map((book) => this.bnMapper.mapBook(book))
        .filter((book) => book !== undefined);

      for await (const bookDraft of bookDrafts) {
        await this.saveBook(bookDraft);
      }

      savedBooksCount += bookDrafts.length;

      i += 1;

      this.logger.info({
        message: `Processed ${i * 100} books.`,
        url,
        savedBooks: savedBooksCount,
      });

      url = response.data.nextPage;
    }

    this.logger.info({ message: 'Scraping BN completed.' });
  }

  private async saveBook(bookDraft: BookDraft): Promise<void> {
    const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

    if (existingBook) {
      return;
    }

    const authorIds: string[] = [];

    for await (const authorName of bookDraft.authorNames) {
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
      format: bookDraft.format,
      isApproved: true,
      language: bookDraft.language,
      imageUrl: bookDraft.imageUrl,
      releaseYear: bookDraft.releaseYear,
      translator: bookDraft.translator,
      pages: bookDraft.pages,
      authorIds,
    });
  }
}
