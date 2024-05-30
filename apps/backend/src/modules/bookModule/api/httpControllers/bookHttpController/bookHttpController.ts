import {
  type CreateBookBodyDto,
  type CreateBookResponseBodyDto,
  createBookBodyDtoSchema,
  createBookResponseBodyDtoSchema,
} from './schemas/createBookSchema.js';
import {
  findBookResponseBodyDtoSchema,
  type FindBookResponseBodyDto,
  type FindBookPathParamsDto,
  findBookPathParamsDtoSchema,
} from './schemas/findBookSchema.js';
import {
  type FindBooksResponseBodyDto,
  findBooksResponseBodyDtoSchema,
  findBooksQueryParamsDtoSchema,
  type FindBooksQueryParamsDto,
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
import { type BookDto } from '../common/bookDto.js';

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
            body: createBookBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: createBookResponseBodyDtoSchema,
              description: 'Draft book created',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Create draft book',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bookId',
        handler: this.findBook.bind(this),
        schema: {
          request: {
            pathParams: findBookPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookResponseBodyDtoSchema,
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
            queryParams: findBooksQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBooksResponseBodyDtoSchema,
              description: 'Books found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async createBook(
    request: HttpRequest<CreateBookBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookResponseBodyDto>> {
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
      body: this.mapBookToBookDto(book),
    };
  }

  private async findBook(
    request: HttpRequest<undefined, undefined, FindBookPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookResponseBodyDto>> {
    const { bookId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { book } = await this.findBookQueryHandler.execute({ bookId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookToBookDto(book),
    };
  }

  private async findBooks(
    request: HttpRequest<undefined, FindBooksQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBooksResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { isbn, title, page = 1, pageSize = 10 } = request.queryParams;

    const { books, total } = await this.findBooksQueryHandler.execute({
      isbn,
      title,
      page,
      pageSize,
    });

    return {
      body: {
        data: books.map((book) => this.mapBookToBookDto(book)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private mapBookToBookDto(book: Book): BookDto {
    const { title, language, format, isApproved, imageUrl, isbn, publisher, releaseYear, translator, pages } =
      book.getState();

    const bookDto: BookDto = {
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
