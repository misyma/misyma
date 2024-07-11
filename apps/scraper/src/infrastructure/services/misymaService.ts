import { type AxiosInstance } from 'axios';

import {
  type FindAuthorsResponseBody,
  type CreateBookRequestBody,
  type FindBooksResponseBody,
  type Author,
  type CreateAuthorResponseBody,
} from '@common/contracts';

import { type LoggerService } from '../../libs/logger/loggerService.js';

export interface BookExistsPayload {
  readonly title: string;
}

export interface CreateBookPayload {
  readonly data: CreateBookRequestBody;
}

export interface FindAuthorIdPayload {
  readonly name: string;
}

export interface CreateAuthorPayload {
  readonly name: string;
}

export class MisymaService {
  public constructor(
    private readonly httpClient: AxiosInstance,
    private readonly logger: LoggerService,
  ) {}

  public async bookExists(payload: BookExistsPayload): Promise<boolean> {
    const { title } = payload;

    try {
      const response = await this.httpClient.get<FindBooksResponseBody>('api/admin/books', { params: { title } });

      return response.data.data.length > 0;
    } catch (error) {
      this.logger.error({
        message: 'Error while getting a book',
        error,
      });

      throw error;
    }
  }

  public async createBook(payload: CreateBookPayload): Promise<void> {
    const { data } = payload;

    try {
      await this.httpClient.post('api/admin/books', { ...data });
    } catch (error) {
      this.logger.error({
        message: 'Error while creating a book',
        error,
      });

      throw error;
    }
  }

  public async findAuthorId(payload: FindAuthorIdPayload): Promise<string | undefined> {
    const { name } = payload;

    try {
      const response = await this.httpClient.get<FindAuthorsResponseBody>('api/authors', { params: { name } });

      return response.data.data[0]?.id;
    } catch (error) {
      this.logger.error({
        message: 'Error while getting an author',
        error,
      });

      throw error;
    }
  }

  public async createAuthor(payload: CreateAuthorPayload): Promise<Author> {
    const { name } = payload;

    try {
      const response = await this.httpClient.post<CreateAuthorResponseBody>('api/admin/authors', { name });

      return response.data;
    } catch (error) {
      this.logger.error({
        message: 'Error while creating an author',
        error,
      });

      throw error;
    }
  }
}
