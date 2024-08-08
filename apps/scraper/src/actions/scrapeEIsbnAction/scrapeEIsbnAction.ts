import { type XMLParser } from 'fast-xml-parser';

import { type EIsbnMessage } from './eisbnBook.js';
import { type EIsbnMapper } from './eIsbnMapper.js';
import { type EIsbnClient } from '../../infrastructure/clients/eIsbnClient.js';
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

    let booksCount = 0;

    while (idFrom) {
      const response = await this.eisbnClient.get('/IsbnWeb/api.xml', {
        params: {
          idFrom,
          max: 100,
        },
      });

      const parsedResponse = this.xmlParser.parse(response.data) as EIsbnMessage;

      const eisbnBooks = parsedResponse.ONIXMessage.Product;

      if (!Array.isArray(eisbnBooks)) {
        return;
      }

      const bookDrafts = eisbnBooks.map((book) => this.eIsbnMapper.mapBook(book)).filter((book) => book !== undefined);

      for await (const bookDraft of bookDrafts) {
        const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

        if (existingBook) {
          continue;
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

      booksCount += bookDrafts.length;

      this.logger.info({
        message: `Processed ${booksCount} books.`,
        idFrom,
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
}
