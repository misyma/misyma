import { XMLParser } from 'fast-xml-parser';

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
  ) {}

  public async execute(payload: ScrapeEIsbnActionPayload): Promise<void> {
    const { from } = payload;

    this.logger.info({
      message: 'Scraping E-ISBN...',
      from,
      authorRepository: this.authorRepository,
      bookRepository: this.bookRepository,
      eIsbnMapper: this.eIsbnMapper,
    });

    const parser = new XMLParser();

    const initialFrom = from ?? 1401282;

    const response = await this.eisbnClient.get('/IsbnWeb/api.xml', {
      params: {
        from: initialFrom,
        max: 100,
      },
    });

    const parsedResponse = parser.parse(response.data) as EIsbnMessage;

    const eisbnBooks = parsedResponse.ONIXMessage.Product;

    if (!Array.isArray(eisbnBooks)) {
      return;
    }

    const bookDrafts = eisbnBooks.map((book) => this.eIsbnMapper.mapBook(book)).filter((book) => book !== undefined);

    console.log(bookDrafts.length);

    // const existingBook = await this.bookRepository.findBook({ title: bookDraft.title });

    // if (existingBook) {
    //   return;
    // }

    // const authorIds: string[] = [];

    // for (const authorName of bookDraft.authorNames) {
    //   let author = await this.authorRepository.findAuthor({ name: authorName });

    //   if (!author) {
    //     author = await this.authorRepository.create({ name: authorName });
    //   }

    //   authorIds.push(author.id);
    // }

    // await this.bookRepository.createBook({
    //   title: bookDraft.title,
    //   isbn: bookDraft.isbn,
    //   publisher: bookDraft.publisher,
    //   format: bookDraft.format,
    //   isApproved: true,
    //   language: bookDraft.language,
    //   imageUrl: bookDraft.imageUrl,
    //   releaseYear: bookDraft.releaseYear,
    //   translator: bookDraft.translator,
    //   pages: bookDraft.pages,
    //   authorIds,
    // });

    this.logger.info({ message: 'Scraping E-ISBN completed.' });
  }
}
