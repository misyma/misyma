import { type AxiosResponse } from 'axios';
import { type XMLParser } from 'fast-xml-parser';

import { type EIsbnResponseBody } from './eisbnBook.js';
import { type EIsbnMapper } from './eIsbnMapper.js';
import { type EIsbnClient } from '../../infrastructure/clients/eIsbnClient.js';
import { type BookDraft } from '../../infrastructure/entities/book/book.js';
import { type AuthorRepository } from '../../infrastructure/repositories/authorRepository/authorRepository.js';
import { type BookRepository } from '../../infrastructure/repositories/bookRepository/bookRepository.js';
import { type LoggerService } from '../../libs/logger/loggerService.js';

export interface ScrapeEIsbnActionPayload {
  readonly from: number | undefined;
}

export class ScrapeEIsbnAction {
  public constructor(
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository,
    private readonly eIsbnMapper: EIsbnMapper,
    private readonly eisbnClient: EIsbnClient,
    private readonly logger: LoggerService,
    private readonly xmlParser: XMLParser,
  ) {}

  public async execute(payload: ScrapeEIsbnActionPayload): Promise<void> {
    const { from: initialFrom } = payload;

    this.logger.info({
      message: 'Scraping E-ISBN...',
      from: initialFrom,
    });

    let idFrom: number | null = initialFrom ?? 1401282;

    let savedBooksCount = 0;

    let i = 0;

    while (idFrom) {
      const response = await this.fetchEIsbnBooks(idFrom);

      const parsedResponseBody = this.xmlParser.parse(response.data) as EIsbnResponseBody;

      const eisbnBooks = parsedResponseBody?.ONIXMessage?.Product;

      if (!Array.isArray(eisbnBooks)) {
        this.logger.error({
          message: 'Invalid response from E-ISBN.',
          response: parsedResponseBody,
        });

        throw new Error('Invalid response from E-ISBN.');
      }

      const bookDrafts = eisbnBooks.map((book) => this.eIsbnMapper.mapBook(book)).filter((book) => book !== undefined);

      for await (const bookDraft of bookDrafts) {
        await this.saveBook(bookDraft);
      }

      savedBooksCount += bookDrafts.length;

      i += 1;

      this.logger.info({
        message: `Processed ${i * 100} books.`,
        idFrom,
        savedBooks: savedBooksCount,
      });

      const nextPageRegex = /eisbn:nextPage="([^"]+)"/;

      const nextPageMatch = nextPageRegex.exec(response.data);

      if (nextPageMatch && nextPageMatch[1]) {
        const nextPageUrl = nextPageMatch[1];

        const urlParams = new URLSearchParams(nextPageUrl.split('?')[1]);

        idFrom = urlParams.get('idFrom') ? parseInt(urlParams.get('idFrom') as string, 10) : null;
      }
    }

    this.logger.info({ message: 'Scraping E-ISBN completed.' });
  }

  private async fetchEIsbnBooks(idFrom: number): Promise<AxiosResponse> {
    const response = await this.eisbnClient.get('/IsbnWeb/api.xml', {
      params: {
        idFrom,
        max: 100,
      },
    });

    if (typeof response.data === 'string' && response.data.includes('javax.transaction.SystemException')) {
      this.logger.error({
        message: 'E-ISBN request failed, retrying...',
        response: response.data,
      });

      return this.fetchEIsbnBooks(idFrom);
    }

    return response;
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
