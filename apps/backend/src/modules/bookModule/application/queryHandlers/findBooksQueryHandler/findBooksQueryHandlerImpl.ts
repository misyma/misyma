import { type FindBooksQueryHandler, type FindBooksResult } from './findBooksQueryHandler.js';
import { type BookRepository } from '../../../domain/repositories/bookRepository/bookRepository.js';

export class FindBooksQueryHandlerImpl implements FindBooksQueryHandler {
  public constructor(private readonly bookRepository: BookRepository) {}

  public async execute(): Promise<FindBooksResult> {
    const books = await this.bookRepository.findBooks();

    return { books };
  }
}
