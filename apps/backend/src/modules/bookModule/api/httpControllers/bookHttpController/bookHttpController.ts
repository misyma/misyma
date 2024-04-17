import {
  type CreateBookBodyDTO,
  type CreateBookResponseBodyDTO,
  createBookBodyDTOSchema,
  createBookResponseBodyDTOSchema,
} from './schemas/createBookSchema.js';
import {
  findBookResponseBodyDTOSchema,
  type FindBookResponseBodyDTO,
  type FindBookPathParamsDTO,
  findBookPathParamsDTOSchema,
} from './schemas/findBookSchema.js';
import {
  type FindBooksResponseBodyDTO,
  findBooksResponseBodyDTOSchema,
  findBooksQueryParamsDTOSchema,
  type FindBooksQueryParamsDTO,
} from './schemas/findBooksSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookCommandHandler } from '../../../application/commandHandlers/createBookCommandHandler/createBookCommandHandler.js';
import { type FindBookQueryHandler } from '../../../application/queryHandlers/findBookQueryHandler/findBookQueryHandler.js';
import { type FindBooksQueryHandler } from '../../../application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler.js';
import { type Book } from '../../../domain/entities/book/book.js';
import { type BookDTO } from '../common/bookDto.js';

export class BookHttpController implements HttpController {
  public readonly basePath = '/api/books';
  public readonly tags = ['Book'];

  public constructor(
    private readonly createBookCommandHandler: CreateBookCommandHandler,
    private readonly findBookQueryHandler: FindBookQueryHandler,
    private readonly findBooksQueryHandler: FindBooksQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBook.bind(this),
        schema: {
          request: {
            body: createBookBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseBodyDTOSchema,
              description: 'Draft book created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create draft book',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookResponseBodyDTOSchema,
              description: 'Book found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find book by id',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findBooks.bind(this),
        description: 'Find books',
        schema: {
          request: {
            queryParams: findBooksQueryParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBooksResponseBodyDTOSchema,
              description: 'Books found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDTO>> {
    const { authorIds, ...bookData } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { book } = await this.createBookCommandHandler.execute({
      ...bookData,
      authorIds,
      isApproved: false,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookToBookDTO(book),
    };
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParamsDTO>,
  ): Promise<HttpOkResponse<FindBookResponseBodyDTO>> {
    const { id } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { book } = await this.findBookQueryHandler.execute({ bookId: id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookToBookDTO(book),
    };
  }

  private async findBooks(
    request: HttpRequest<undefined, FindBooksQueryParamsDTO, undefined>,
  ): Promise<HttpOkResponse<FindBooksResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { isbn, title } = request.queryParams;

    const { books } = await this.findBooksQueryHandler.execute({
      isbn,
      title,
    });

    return {
      body: {
        data: books.map((book) => this.mapBookToBookDTO(book)),
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private mapBookToBookDTO(book: Book): BookDTO {
    const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
      book.getState();

    const bookDto: BookDTO = {
      id: book.getId(),
      title,
      language,
      format,
      isApproved,
      authors: book.getAuthors().map((author) => ({
        id: author.getId(),
        name: author.getName(),
        isApproved: author.getIsApproved(),
      })),
    };

    if (isbn) {
      bookDto.isbn = isbn;
    }

    if (publisher) {
      bookDto.publisher = publisher;
    }

    if (releaseYear) {
      bookDto.releaseYear = releaseYear;
    }

    if (translator) {
      bookDto.translator = translator;
    }

    if (pages) {
      bookDto.pages = pages;
    }

    if (imageUrl) {
      bookDto.imageUrl = imageUrl;
    }

    return bookDto;
  }
}
